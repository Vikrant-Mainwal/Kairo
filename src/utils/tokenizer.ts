/**
 * Tokenizer utility for the LCS diff engine.
 *
 * Strategy: split on word boundaries while keeping delimiters as tokens.
 * This gives word-level granularity which is more semantically meaningful
 * than character-level diffing for AI model output comparison.
 */

/**
 * Tokenize text into an array of word + whitespace tokens.
 * Whitespace tokens are preserved so the reconstructed output
 * maintains original formatting exactly.
 */
export function tokenize(text: string): string[] {
  if (!text) return []
  // Split on word boundaries, keeping separators as tokens
  return text.match(/\S+|\s+/g) ?? []
}

/**
 * Detokenize an array of tokens back into a string.
 * Since we preserve whitespace as tokens, this is simply a join.
 */
export function detokenize(tokens: string[]): string {
  return tokens.join('')
}
