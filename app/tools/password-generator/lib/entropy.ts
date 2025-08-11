import type { GeneratePasswordOptions } from './generators'

function log2(x: number): number {
  return Math.log(x) / Math.log(2)
}

export function estimatePasswordEntropyBits(opts: GeneratePasswordOptions): number {
  let charsetSize = 0
  const AMBIG = new Set(['O', '0', 'I', 'l', '1'])
  if (opts.useUpper) charsetSize += opts.excludeAmbiguous ? 26 - 2 /* O,I */ : 26
  if (opts.useLower) charsetSize += opts.excludeAmbiguous ? 26 - 1 /* l */ : 26
  if (opts.useDigits) charsetSize += opts.excludeAmbiguous ? 10 - 2 /* 0,1 */ : 10
  if (opts.useSymbols) {
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/~'
    const filtered = opts.excludeAmbiguous ? symbols.split('').filter(s => !AMBIG.has(s)).length : symbols.length
    charsetSize += filtered
  }
  if (charsetSize <= 1 || opts.length <= 0) return 0
  return opts.length * log2(charsetSize)
}

export function estimatePassphraseEntropyBits(wordCount: number, wordlistSize: number): number {
  if (wordCount <= 0 || wordlistSize <= 1) return 0
  return wordCount * log2(wordlistSize)
}


