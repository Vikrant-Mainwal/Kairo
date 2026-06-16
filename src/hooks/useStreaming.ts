import { useReducer, useRef, useCallback } from "react";
import { useMetrics } from "./useMetrics";
import type { StreamState, StreamMetrics } from "../types";

// ─── State machine
type StreamAction =
  | { type: "START" }
  | { type: "APPEND"; chunk: string }
  | { type: "DONE" }
  | { type: "ERROR"; error: string }
  | { type: "RESET" };

function streamReducer(state: StreamState, action: StreamAction): StreamState {
  switch (action.type) {
    case "START":
      return { streaming: true, output: "", error: null };
    case "APPEND":
      return { ...state, output: state.output + action.chunk };
    case "DONE":
      return { ...state, streaming: false };
    case "ERROR":
      // IMPORTANT: preserve any partial output received before the error
      return { ...state, streaming: false, error: action.error };
    case "RESET":
      return { streaming: false, output: "", error: null };
    default:
      return state;
  }
}

const INITIAL_STATE: StreamState = {
  streaming: false,
  output: "",
  error: null,
};

// ─── Hook

export interface UseStreamingOptions {
  model: string;
  systemPrompt?: string;
}

export interface UseStreamingReturn extends StreamState {
  metrics: StreamMetrics;
  stream: (prompt: string, options: UseStreamingOptions) => Promise<string>;
  abort: () => void;
  reset: () => void;
}

/**
 * useStreaming — core streaming hook.
 *
 * Manages the full lifecycle of an SSE stream:
 *  1. Opens a fetch with stream: true
 *  2. Reads ReadableStream chunks via getReader()
 *  3. Decodes SSE lines and extracts delta.text
 *  4. Appends tokens to output state incrementally
 *  5. Handles abort, network errors, and partial output preservation
 */
export function useStreaming(): UseStreamingReturn {
  const [state, dispatch] = useReducer(streamReducer, INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);
  const lastPromptRef = useRef("");
  const metricsHook = useMetrics();

  const stream = useCallback(
    async (prompt: string, options: UseStreamingOptions): Promise<string> => {
      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      lastPromptRef.current = prompt;

      dispatch({ type: "START" });
      metricsHook.reset();
      metricsHook.start();

      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
              prompt,
              model: options.model,
              max_tokens: 1024,
              stream: true,
              messages: [
                {
                  role: "system",
                  content:
                    options.systemPrompt ?? "You are a helpful AI assistant.",
                },
                { role: "user", content: prompt },
              ],
            }),
          },
        );

        if (!response.ok) {
          const err = (await response.json().catch(() => ({}))) as {
            error?: { message?: string };
          };
          throw new Error(err.error?.message ?? `HTTP ${response.status}`);
        }

        if (!response.body) throw new Error("Response body is null");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalOutput = "";

        // Read the SSE stream chunk by chunk
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            
            const data = line.slice(6).trim();

            if (data === "[DONE]") {
              continue;
            }

            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const delta = json.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                finalOutput += delta;

                dispatch({ type: "APPEND", chunk: delta });

                metricsHook.addTokens(
                  Math.max(1, Math.ceil(delta.split(/\s+/).length)),
                );
              }
            } catch {
              // Skip malformed SSE lines silently
            }
          }
        }

        metricsHook.stop();
        dispatch({ type: "DONE" });

        return finalOutput;
      } catch (err: unknown) {
        metricsHook.stop();

        let message = "An unexpected error occurred.";

        if (err instanceof Error) {
          if (err.name === "AbortError") {
            message = "Stream aborted — partial output preserved.";
          } else if (
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError")
          ) {
            message = "Network error. Check your connection and try again.";
          } else {
            message = err.message;
          }
        }

        dispatch({
          type: "ERROR",
          error: message,
        });

        throw err;
      }
    },
    [metricsHook],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    metricsHook.reset();
    dispatch({ type: "RESET" });
  }, [metricsHook]);

  return {
    ...state,
    metrics: metricsHook.metrics,
    stream,
    abort,
    reset,
  };
}
