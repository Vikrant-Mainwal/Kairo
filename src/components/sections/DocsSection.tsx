import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  title: string;
  content: string | ReactNode;
}

function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col justify-center w-full">
      <div className="space-y-2 ">
        {items.map((item, i) => (
          <div
            key={item.title}
            className="rounded-xl border border-neutral-800 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
              className="w-full flex items-center justify-between px-5 py-4 text-md font-medium text-neutral-200 hover:bg-neutral-800/50 transition-colors text-left"
            >
              {item.title}
              <ChevronDown
                className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 border-t border-neutral-800 bg-neutral-900/30">
                {typeof item.content === "string" ? (
                  <pre className="mt-4 text-sm font-mono text-neutral-400 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </pre>
                ) : (
                  <div className="mt-4">{item.content}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const DOCS: AccordionItem[] = [
  {
    title: "LCS diff algorithm - how it works",
    content: `The Longest Common Subsequence (LCS) algorithm finds the longest sequence of tokens that appear in the same relative order in both model outputs - without requiring them to be contiguous.

STEP 1  - Build the DP table:
  dp[i][j] = LCS length of A[0..i-1] and B[0..j-1]
  if A[i-1] === B[j-1]:  dp[i][j] = dp[i-1][j-1] + 1
  else:                   dp[i][j] = max(dp[i-1][j], dp[i][j-1])

STEP 2  - Backtrack from dp[m][n] to classify each token:
  • Both match   → "common" token (shown normally)
  • Only in B    → "added" token  (green highlight)
  • Only in A    → "removed" token (red strikethrough)`,
  },
  {
    title: "Complexity analysis",
    content: `Time:  O(m × n)  - filling the DP matrix
Space: O(m × n)  - storing the matrix (can reduce to O(min(m,n)) with Hirschberg's algorithm)
Recon: O(m + n)  - backtracking from dp[m][n] to dp[0][0]

For typical AI outputs of 200–800 tokens each:
  200 × 800 = 160,000 operations  - runs instantly in the browser.
  800 × 800 = 640,000 operations  - still synchronous, no workers needed.`,
  },
  {
    title: "Why LCS? Comparison with alternatives",
    content: `Myers Diff
  + Optimal for sparse diffs. O((m+n)·D) where D = edit distance.
  − Designed for line-level code diffing. Complex to implement correctly.
  − No advantage for token-level prose comparison.

Naive comparison
  + Trivial to implement.
  − O(n²) worst case. Fails on any insertion/deletion with no alignment.
  − Not suitable for meaningful diff output.

Line-based diffing
  + Great for source code with meaningful line breaks.
  − AI outputs are paragraphs  - no meaningful line boundaries.
  − One changed word shows the entire "line" as changed. Too coarse.

LCS wins because:
  ✓ Predictable O(m×n)  - no degenerate cases.
  ✓ Correct word-level alignment even for rephrased sentences.
  ✓ Simple, auditable backtracking. No edge cases.
  ✓ Zero external dependencies.`,
  },
  {
    title: "Streaming architecture",
    content: `useStreaming() hook lifecycle:
  1. Opens fetch() with { stream: true } to Anthropic /v1/messages
  2. ReadableStream + TextDecoder decodes chunks incrementally
  3. Lines are split on \\n; only "data: " prefixed lines are parsed
  4. delta.text extracted from each SSE event and appended to state
  5. AbortController cancels in-flight requests cleanly

useMetrics() hook:
  • Runs setInterval(tick, 120) during streaming
  • Computes elapsed, tokens, and TPS on each tick
  • Calls stop() on completion for a final accurate snapshot

Partial output preservation:
  The streaming reducer ONLY appends  - it never clears output on error.
  Users always see what was received before any failure.`,
  },
  {
    title: "Accessibility (WCAG AA)",
    content: `• aria-live="polite" on output region  - screen readers announce new tokens
• aria-busy on Run button during streaming
• role="alert" on error messages  - immediate screen reader announcement
• aria-label on all inputs, buttons, and interactive controls
• aria-pressed on toggle buttons (text/audio mode)
• aria-expanded on collapsible sections (system prompt)
• All actions reachable via Tab + Enter/Space  - no mouse required
• focus-visible outline on every interactive element (2px kairo-400)
• Color is never the sole means of conveying information
  → Diff tokens have text + color + strikethrough for removed tokens
• Semantic HTML: header, nav, main, section, h1–h2, label, button`,
  },
  {
    title: "Error handling strategy",
    content: `Every async path is wrapped in try/catch with AbortController:

AbortError:
  → "Stream aborted  - partial output preserved."
  → Output is kept. User sees what arrived before abort.

Network failure (Failed to fetch):
  → "Network error. Check your connection and try again."
  → Retry button re-runs the exact same request.

HTTP errors (non-2xx):
  → API error message surfaced directly from response body.
  → Falls back to "HTTP {status}" if body is not parseable.

Partial output preservation rule:
  The APPEND action only adds to state.output.
  The ERROR action sets error but never touches output.
  This is enforced by the streamReducer type-level design.`,
  },
  {
    title: "Project architecture",
    content: `  src/
                  ├── components/
                  │    ├── playground/     # Playground, AudioInput, StreamOutput
                  │    ├── diff-view/      # DiffView, DiffPanel
                  │    ├── metrics/        # MetricsBar
                  │    ├── ui/             # Button, Select, Badge (reusable primitives)
                  │    ├── layout/         # Navbar
                  │    └── sections/       # HeroSection, DocsSection
                  │
                  ├── hooks/
                  │    ├── useStreaming.ts  # SSE stream manager with AbortController
                  │    ├── useMetrics.ts   # Live TPS/elapsed/token metrics
                  │    └── useAudioRecorder.ts  # MediaRecorder wrapper
                  │
                  ├── utils/
                  │    ├── diff.ts         # LCS matrix + reconstruction
                  │    ├── tokenizer.ts    # Word+whitespace tokenizer
                  │    └── cn.ts           # className merger
                  │
                  ├── services/
                  │    └── models.ts       # Model list + sample prompts
                  │
                  └── types/index.ts      # All shared TypeScript types`,
  },
];

export function DocsSection() {
  return (
      <section aria-labelledby="docs-heading" className="space-y-4 m-10">
        <h2 id="docs-heading" className="text-lg font-medium text-neutral-200">
          Architecture &amp; documentation
        </h2>
        <p className="text-md text-neutral-500">
          Technical notes on the diff algorithm, streaming architecture,
          accessibility, and error handling.
        </p>
        <Accordion items={DOCS} />
      </section>
  );
}
