// Generation utilities for passwords, passphrases, and key-like strings
// Security note: All randomness sourced from crypto.getRandomValues

export interface GeneratePasswordOptions {
  length: number
  useUpper: boolean
  useLower: boolean
  useDigits: boolean
  useSymbols: boolean
  excludeAmbiguous: boolean
  pronounceable: boolean
}

export interface GeneratePassphraseOptions {
  wordCount: number
  separator: string
  capitalize: boolean
  addNumber: boolean
  addSymbol: boolean
  wordlist: string[]
}

const AMBIGUOUS_CHARS = new Set(['O', '0', 'I', 'l', '1'])

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~'

function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0
  const array = new Uint32Array(1)
  let x: number
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive
  do {
    crypto.getRandomValues(array)
    x = array[0]
  } while (x >= limit)
  return x % maxExclusive
}

function pickRandom<T>(items: T[]): T {
  return items[secureRandomInt(items.length)]
}

function buildCharset(opts: GeneratePasswordOptions): string {
  let charset = ''
  if (opts.useUpper) charset += UPPER
  if (opts.useLower) charset += LOWER
  if (opts.useDigits) charset += DIGITS
  if (opts.useSymbols) charset += SYMBOLS

  if (opts.excludeAmbiguous) {
    charset = Array.from(charset).filter((c) => !AMBIGUOUS_CHARS.has(c)).join('')
  }
  return charset
}

function ensureAtLeastOneFromEachSelectedSet(passwordChars: string[], opts: GeneratePasswordOptions): void {
  const pools: Array<[boolean, string]> = [
    [opts.useUpper, opts.excludeAmbiguous ? Array.from(UPPER).filter(c => !AMBIGUOUS_CHARS.has(c)).join('') : UPPER],
    [opts.useLower, opts.excludeAmbiguous ? Array.from(LOWER).filter(c => !AMBIGUOUS_CHARS.has(c)).join('') : LOWER],
    [opts.useDigits, opts.excludeAmbiguous ? Array.from(DIGITS).filter(c => !AMBIGUOUS_CHARS.has(c)).join('') : DIGITS],
    [opts.useSymbols, opts.excludeAmbiguous ? Array.from(SYMBOLS).filter(c => !AMBIGUOUS_CHARS.has(c)).join('') : SYMBOLS],
  ]

  const takenIndices = new Set<number>()
  for (const [enabled, pool] of pools) {
    if (!enabled || pool.length === 0) continue
    let idx: number
    do {
      idx = secureRandomInt(passwordChars.length)
    } while (takenIndices.has(idx))
    takenIndices.add(idx)
    passwordChars[idx] = pool[secureRandomInt(pool.length)]
  }
}

// Pronounceable helper using alternating consonant/vowel pattern
const VOWELS = 'aeiou'
const CONSONANTS = Array.from(LOWER).filter((c) => !VOWELS.includes(c)).join('')

function generatePronounceable(length: number): string {
  const result: string[] = []
  let useConsonant = secureRandomInt(2) === 0 // random start
  for (let i = 0; i < length; i++) {
    const pool = useConsonant ? CONSONANTS : VOWELS
    const ch = pool[secureRandomInt(pool.length)]
    result.push(ch)
    useConsonant = !useConsonant
  }
  return result.join('')
}

export function generatePassword(opts: GeneratePasswordOptions): string {
  const { length, pronounceable } = opts

  // Prevent empty selection
  if (!opts.useUpper && !opts.useLower && !opts.useDigits && !opts.useSymbols) {
    throw new Error('At least one character set must be enabled')
  }
  if (length < 1) return ''

  if (pronounceable) {
    // Start from pronounceable core and then optionally mix in selected sets to meet constraints
    const base = generatePronounceable(length)
    const chars = base.split('')
    ensureAtLeastOneFromEachSelectedSet(chars, opts)
    return chars.join('')
  }

  const charset = buildCharset(opts)
  if (charset.length === 0) throw new Error('Charset is empty')
  const result: string[] = new Array(length)
  for (let i = 0; i < length; i++) {
    result[i] = charset[secureRandomInt(charset.length)]
  }
  ensureAtLeastOneFromEachSelectedSet(result, opts)
  return result.join('')
}

export function generatePassphrase(opts: GeneratePassphraseOptions): string {
  const { wordCount, separator, capitalize, addNumber, addSymbol, wordlist } = opts
  if (wordCount <= 0) throw new Error('wordCount must be > 0')
  if (!wordlist || wordlist.length === 0) throw new Error('wordlist required')

  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    let w = wordlist[secureRandomInt(wordlist.length)]
    if (capitalize) {
      w = w.charAt(0).toUpperCase() + w.slice(1)
    }
    words.push(w)
  }

  let sep = separator
  if (separator === ' ') sep = ' '

  let phrase = words.join(sep)
  if (addNumber) {
    phrase += String(secureRandomInt(10))
  }
  if (addSymbol) {
    const symbolChoices = '!@#$%^&*'
    phrase += symbolChoices[secureRandomInt(symbolChoices.length)]
  }
  return phrase
}

// Alphabets
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

function randomFromAlphabet(len: number, alphabet: string): string {
  const out: string[] = new Array(len)
  for (let i = 0; i < len; i++) {
    out[i] = alphabet[secureRandomInt(alphabet.length)]
  }
  return out.join('')
}

function generateUuidV4(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  // Per RFC 4122 v4
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function generatePemLike(): string {
  // Non-functional placeholder; base64-ish body length around 32-64 chars per line
  const header = '-----BEGIN PRIVATE KEY-----'
  const footer = '-----END PRIVATE KEY-----'
  const bodyLen = 256
  const body = randomFromAlphabet(bodyLen, BASE64_ALPHABET)
  const chunked = body.match(/.{1,64}/g)?.join('\n') ?? body
  return `${header}\n${chunked}\n${footer}`
}

export type KeyLikeType = 'hex' | 'base58' | 'base64' | 'uuid' | 'bech32' | 'pem'

export function generateKeyLike(type: KeyLikeType): string {
  switch (type) {
    case 'hex': {
      // 64 hex chars
      const bytes = new Uint8Array(32)
      crypto.getRandomValues(bytes)
      return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    }
    case 'base58': {
      // 44–58 characters
      const len = 44 + secureRandomInt(15) // 44..58
      return randomFromAlphabet(len, BASE58_ALPHABET)
    }
    case 'base64': {
      // 43–86 characters (no padding variant not enforced here; allow +/ and = optionally)
      const len = 43 + secureRandomInt(44) // 43..86
      const core = randomFromAlphabet(len, BASE64_ALPHABET)
      return core
    }
    case 'uuid':
      return generateUuidV4()
    case 'bech32': {
      // Bech32-like: bc1q + 39 chars from bech32 charset (length ~ 39)
      const len = 39
      return 'bc1q' + randomFromAlphabet(len, BECH32_ALPHABET)
    }
    case 'pem':
      return generatePemLike()
    default:
      return ''
  }
}


