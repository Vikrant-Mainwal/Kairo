/**
 * A single model provider definition.
 * Extendable — add auth, headers, rate limits later.
 */
export interface ModelProvider {
  id: string;
  name: string;
  endpointUrl: string;
  defaultModel?: string;
  headers?: Record<string, string>;
}

/**
 * What the user sends to the playground.
 */
export interface InferenceRequest {
  prompt: string;
  model: string;
  providerId: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  stream: boolean;
}

/**
 * A single chunk arriving from the stream.
 */
export interface StreamChunk {
  text: string;
  tokenCount?: number;
  finishReason?: string;
}

/**
 * Accumulated state for one inference run.
 */
export interface InferenceResult {
  fullText: string;
  chunks: StreamChunk[];
  metrics: InferenceMetrics;
  status: InferenceStatus;
  error?: string;
}

export type InferenceStatus =
  | "idle"
  | "streaming"
  | "complete"
  | "error";

/**
 * Real-time perf metrics per run.
 */
export interface InferenceMetrics {
  startTime: number;           
  firstTokenTime?: number;     
  endTime?: number;
  totalTokens: number;
  tokensPerSecond?: number;
  latencyMs?: number;
}