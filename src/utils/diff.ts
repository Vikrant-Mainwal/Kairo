/**
 * LCS-based token diff engine.
 *
 * ── Why LCS? ─────────────────────────────────────────────────────────────────
 * For AI model output comparison, we compare at the TOKEN level (words +
 * whitespace), not line level. This is because:
 *
 *  • AI outputs are often single paragraphs — no meaningful line boundaries.
 *  • A single rephrased sentence produces a full-line diff with line-based
 *    algorithms, losing all sub-sentence granularity.
 *  • Token-level LCS highlights exactly which words changed.
 *
 * ── Algorithm ────────────────────────────────────────────────────────────────
 * LCS (Longest Common Subsequence) finds the longest sequence of tokens that
 * appear in the same relative order in both strings, without requiring
 * contiguity. Every token not in the LCS is either added or removed.
 *
 * Step 1 — Build DP table:
 *   dp[i][j] = LCS length of A[0..i-1] and B[0..j-1]
 *   if A[i-1] === B[j-1]: dp[i][j] = dp[i-1][j-1] + 1
 *   else:                  dp[i][j] = max(dp[i-1][j], dp[i][j-1])
 *
 * Step 2 — Backtrack from dp[m][n] to reconstruct which tokens are common,
 *   added, or removed.
 *
 * ── Complexity ───────────────────────────────────────────────────────────────
 *   Time:  O(m × n)   — filling the DP table
 *   Space: O(m × n)   — storing the matrix
 *           Can be reduced to O(min(m,n)) with Hirschberg's algorithm
 *   Recon: O(m + n)   — backtracking
 *
 * ── Comparison with alternatives ─────────────────────────────────────────────
 *
 *  Myers Diff:
 *    - Optimal for line-level code diffs. O((m+n)·D) time where D = edit dist.
 *    - Excellent for sparse diffs (few changes). Complex to implement correctly.
 *    - Designed for line-based comparison; less suited for token-level prose.
 *
 *  Naive comparison:
 *    - Scan token by token; fails on any insertion/deletion (no alignment).
 *    - O(n²) in worst case. Not viable for meaningful diffs.
 *
 *  Line-based diffing:
 *    - Splits text on '\n'. AI outputs rarely have meaningful line breaks.
 *    - One changed word = full line marked as changed. Too coarse.
 *
 *  LCS wins for moderate AI outputs (< 2000 tokens each) because:
 *    - Predictable O(m×n) performance — no degenerate cases.
 *    - Correct word-level alignment even for rephrased sentences.
 *    - Simple backtracking produces clean added/removed classification.
 *    - No external dependencies needed.
 */

import { tokenize } from './tokenizer'
import type { DiffToken, DiffResult } from '../types'

/**
 * Build the LCS dynamic-programming matrix.
 * Using Uint16Array per row keeps memory compact and cache-friendly.
 */
function buildLCSMatrix(a: string[], b: string[]): Uint16Array[] {
  const m = a.length
  const n = b.length
  const dp: Uint16Array[] = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  return dp
}

/**
 * Backtrack through the LCS matrix to reconstruct the diff.
 * Returns two parallel arrays: diffA (left panel) and diffB (right panel).
 */
function reconstructDiff(
  a: string[],
  b: string[],
  dp: Uint16Array[]
): { diffA: DiffToken[]; diffB: DiffToken[] } {
  const diffA: DiffToken[] = []
  const diffB: DiffToken[] = []
  let i = a.length
  let j = b.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      // Token is common to both
      diffA.unshift({ token: a[i - 1], type: 'common' })
      diffB.unshift({ token: b[j - 1], type: 'common' })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Token was added in B
      diffB.unshift({ token: b[j - 1], type: 'added' })
      j--
    } else {
      // Token was removed from A
      diffA.unshift({ token: a[i - 1], type: 'removed' })
      i--
    }
  }

  return { diffA, diffB }
}

/**
 * Main diff function. Tokenizes both texts, builds LCS matrix,
 * reconstructs the diff, and computes stats.
 */
export function computeDiff(textA: string, textB: string): DiffResult {
  const tokensA = tokenize(textA)
  const tokensB = tokenize(textB)
  const dp = buildLCSMatrix(tokensA, tokensB)
  const { diffA, diffB } = reconstructDiff(tokensA, tokensB, dp)

  const common = diffA.filter(t => t.type === 'common').length
  const removed = diffA.filter(t => t.type === 'removed').length
  const added = diffB.filter(t => t.type === 'added').length
  const total = common + Math.max(added, removed)
  const similarity = total > 0 ? Math.round((common / total) * 100) : 0

  return {
    diffA,
    diffB,
    stats: { common, added, removed, similarity },
  }
}
