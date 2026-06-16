import { tokenize } from './tokenizer'
import type { DiffToken, DiffResult } from '../types'

/*
 * Build the LCS dynamic-programming matrix.
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
