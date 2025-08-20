"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, Crown, Eye, EyeOff, RotateCcw } from 'lucide-react'
import { PasswordControls, PassphraseControls } from './components/Controls'
import { generateKeyLike, generatePassphrase, generatePassword, type KeyLikeType } from './lib/generators'
import { estimatePassphraseEntropyBits, estimatePasswordEntropyBits } from './lib/entropy'
import { toast } from 'sonner'
import { SMALL_WORDLIST } from './lib/wordlist'

interface Props {
  isPremiumUser: boolean
  userId: string | null
}


type Mode = 'password' | 'passphrase' | 'keylike'

export default function PasswordGeneratorClient({ isPremiumUser }: Props) {

  const [mode, setMode] = useState<Mode>('password')
  const [masked, setMasked] = useState(false)
  const [output, setOutput] = useState('')
  const outputRef = useRef<HTMLInputElement>(null)
  const [wordlist, setWordlist] = useState<string[]>(SMALL_WORDLIST)

  // zxcvbn-ts dynamic state
  const [zScore, setZScore] = useState<number | null>(null)
  const [zCrack, setZCrack] = useState<string | null>(null)

  // Password state (SSR-safe defaults; load persisted values after mount)
  const [length, setLength] = useState<number>(16)
  const [useUpper, setUseUpper] = useState<boolean>(true)
  const [useLower, setUseLower] = useState<boolean>(true)
  const [useDigits, setUseDigits] = useState<boolean>(true)
  const [useSymbols, setUseSymbols] = useState<boolean>(false)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false)
  const [pronounceable, setPronounceable] = useState<boolean>(false)

  // Passphrase state
  const [wordCount, setWordCount] = useState<number>(5)
  const [separator, setSeparator] = useState<string>('-')
  const [capitalize, setCapitalize] = useState<boolean>(false)
  const [addNumber, setAddNumber] = useState<boolean>(false)
  const [addSymbol, setAddSymbol] = useState<boolean>(false)

  // Load persisted settings on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setLength(Number(localStorage.getItem('pg_length') ?? 16))
      setUseUpper(localStorage.getItem('pg_upper') !== '0')
      setUseLower(localStorage.getItem('pg_lower') !== '0')
      setUseDigits(localStorage.getItem('pg_digits') !== '0')
      setUseSymbols(localStorage.getItem('pg_symbols') === '1')
      setExcludeAmbiguous(localStorage.getItem('pg_amb') === '1')
      setPronounceable(localStorage.getItem('pg_pron') === '1')

      setWordCount(Number(localStorage.getItem('pp_count') ?? 5))
      setSeparator(localStorage.getItem('pp_sep') ?? '-')
      setCapitalize(localStorage.getItem('pp_cap') === '1')
      setAddNumber(localStorage.getItem('pp_num') === '1')
      setAddSymbol(localStorage.getItem('pp_sym') === '1')
    } catch {
      // Ignore storage errors
    }
  }, [])
  // Lazy-load extended wordlist when passphrase mode is viewed
  useEffect(() => {
    if (mode !== 'passphrase') return
    let cancelled = false
    ;(async () => {
      try {
        const mod = await import('./lib/wordlist-extended')
        if (!cancelled && Array.isArray(mod.EXTENDED_WORDLIST) && mod.EXTENDED_WORDLIST.length) {
          setWordlist((prev) => {
            // Avoid duplications
            const set = new Set([...prev, ...mod.EXTENDED_WORDLIST])
            return Array.from(set)
          })
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [mode])

  // Lazy-load zxcvbn-ts for strength scoring when password mode active
  useEffect(() => {
    if (mode !== 'password' || !output) { setZScore(null); setZCrack(null); return }
    let cancelled = false
    ;(async () => {
      try {
        const [{ zxcvbn, zxcvbnOptions }, langEn, langCommon] = await Promise.all([
          import('@zxcvbn-ts/core'),
          import('@zxcvbn-ts/language-en'),
          import('@zxcvbn-ts/language-common')
        ])
        zxcvbnOptions.setOptions({
          translations: langEn.translations,
          dictionary: { ...langCommon.dictionary, ...langEn.dictionary },
          graphs: langCommon.adjacencyGraphs,
        })
        const res = zxcvbn(output)
        if (!cancelled) {
          setZScore(res.score)
          setZCrack(res.crackTimesDisplay.offlineFastHashing1e10PerSecond)
        }
      } catch {
        // Ignore scoring errors; entropy still shown
      }
    })()
    return () => { cancelled = true }
  }, [mode, output])

  // Key-like state
  const [keyType, setKeyType] = useState<KeyLikeType>('hex')
  const [pemText, setPemText] = useState<string>('')

  // Persist settings
  useEffect(() => { localStorage.setItem('pg_length', String(length)) }, [length])
  useEffect(() => { localStorage.setItem('pg_upper', useUpper ? '1' : '0') }, [useUpper])
  useEffect(() => { localStorage.setItem('pg_lower', useLower ? '1' : '0') }, [useLower])
  useEffect(() => { localStorage.setItem('pg_digits', useDigits ? '1' : '0') }, [useDigits])
  useEffect(() => { localStorage.setItem('pg_symbols', useSymbols ? '1' : '0') }, [useSymbols])
  useEffect(() => { localStorage.setItem('pg_amb', excludeAmbiguous ? '1' : '0') }, [excludeAmbiguous])
  useEffect(() => { localStorage.setItem('pg_pron', pronounceable ? '1' : '0') }, [pronounceable])

  useEffect(() => { localStorage.setItem('pp_count', String(wordCount)) }, [wordCount])
  useEffect(() => { localStorage.setItem('pp_sep', separator) }, [separator])
  useEffect(() => { localStorage.setItem('pp_cap', capitalize ? '1' : '0') }, [capitalize])
  useEffect(() => { localStorage.setItem('pp_num', addNumber ? '1' : '0') }, [addNumber])
  useEffect(() => { localStorage.setItem('pp_sym', addSymbol ? '1' : '0') }, [addSymbol])

  const generate = useCallback(() => {
    try {
      if (mode === 'password') {
        const pwd = generatePassword({ length, useUpper, useLower, useDigits, useSymbols, excludeAmbiguous, pronounceable })
        setOutput(pwd)
      } else if (mode === 'passphrase') {
        const sep = separator === 'custom' ? '-' : separator
        const phrase = generatePassphrase({ wordCount, separator: sep, capitalize, addNumber, addSymbol, wordlist })
        setOutput(phrase)
      } else if (mode === 'keylike') {
        const val = generateKeyLike(keyType)
        setOutput(val)
        if (keyType === 'pem') setPemText(val)
      }
      setTimeout(() => outputRef.current?.focus(), 0)
    } catch (e: any) {
      toast.error('Generation failed', { description: e.message || 'Unexpected error' })
    }
  }, [mode, length, useUpper, useLower, useDigits, useSymbols, excludeAmbiguous, pronounceable, wordCount, separator, capitalize, addNumber, addSymbol, keyType, toast])

  useEffect(() => { generate() }, [])

  const passwordEntropy = useMemo(() => {
    if (mode !== 'password') return 0
    return estimatePasswordEntropyBits({ length, useUpper, useLower, useDigits, useSymbols, excludeAmbiguous, pronounceable })
  }, [mode, length, useUpper, useLower, useDigits, useSymbols, excludeAmbiguous, pronounceable])

  const passphraseEntropy = useMemo(() => {
    if (mode !== 'passphrase') return 0
    return estimatePassphraseEntropyBits(wordCount, wordlist.length)
  }, [mode, wordCount, wordlist.length])

  const copy = async () => {
    await navigator.clipboard.writeText(output)
          toast.success('Copied', { description: 'Value copied to clipboard' })
  }

  const premiumDisabled = !isPremiumUser

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
      <TabsList>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
        <TabsTrigger value="keylike">Key-like</TabsTrigger>
      </TabsList>

      {/* Password */}
      <TabsContent value="password">
        <Card>
          <CardContent className="p-4 space-y-4">
            <PasswordControls
              length={length}
              onLengthChange={setLength}
              useUpper={useUpper}
              onUseUpperChange={setUseUpper}
              useLower={useLower}
              onUseLowerChange={setUseLower}
              useDigits={useDigits}
              onUseDigitsChange={setUseDigits}
              useSymbols={useSymbols}
              onUseSymbolsChange={setUseSymbols}
              excludeAmbiguous={excludeAmbiguous}
              onExcludeAmbiguousChange={setExcludeAmbiguous}
              pronounceable={pronounceable}
              onPronounceableChange={setPronounceable}
            />

            <OutputSection
              masked={masked}
              setMasked={setMasked}
              value={output}
              onCopy={copy}
              onRegenerate={generate}
            />

            <StrengthEntropy bits={passwordEntropy} zScore={zScore} zCrack={zCrack} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Passphrase */}
      <TabsContent value="passphrase">
        <Card>
          <CardContent className="p-4 space-y-4">
            <PassphraseControls
              wordCount={wordCount}
              onWordCountChange={setWordCount}
              separator={separator}
              onSeparatorChange={setSeparator}
              capitalize={capitalize}
              onCapitalizeChange={setCapitalize}
              addNumber={addNumber}
              onAddNumberChange={setAddNumber}
              addSymbol={addSymbol}
              onAddSymbolChange={setAddSymbol}
            />

            <OutputSection
              masked={masked}
              setMasked={setMasked}
              value={output}
              onCopy={copy}
              onRegenerate={generate}
            />

            <StrengthEntropy bits={passphraseEntropy} extra={`Wordlist: ${wordlist.length} words`} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Key-like (Premium) */}
      <TabsContent value="keylike">
        <Card>
          <CardContent className="p-4 space-y-4">
            {!isPremiumUser && (
              <Alert>
                <AlertDescription className="text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  Key-like generation is a premium feature.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  aria-label="Key-like type"
                  className="border rounded-md text-sm px-2 py-1 bg-background"
                  value={keyType}
                  onChange={(e) => setKeyType(e.target.value as KeyLikeType)}
                  disabled={premiumDisabled}
                >
                  <option value="hex">Hex (64 chars)</option>
                  <option value="base58">Base58 (44–58)</option>
                  <option value="base64">Base64 (43–86)</option>
                  <option value="uuid">UUID v4</option>
                  <option value="bech32">Bech32-like</option>
                  <option value="pem">PEM-like block</option>
                </select>
              </div>
              <div className="self-end">
                {!isPremiumUser ? (
                  <Button disabled className="w-full justify-center">
                    <Crown className="w-4 h-4 mr-2" /> Generate
                  </Button>
                ) : (
                  <Button onClick={generate} className="w-full justify-center">Generate</Button>
                )}
              </div>
            </div>

            <Disclaimer />

            {keyType === 'pem' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">PEM-like block</label>
                <Textarea
                  aria-label="PEM-like block"
                  value={pemText}
                  onChange={(e) => setPemText(e.target.value)}
                  className="font-mono min-h-[180px]"
                  disabled={premiumDisabled}
                />
              </div>
            ) : null}

            {keyType !== 'pem' && (
              <OutputSection
                masked={masked}
                setMasked={setMasked}
                value={output}
                onCopy={copy}
                onRegenerate={generate}
                disabled={premiumDisabled}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function OutputSection({ value, onCopy, onRegenerate, masked, setMasked, disabled }: { value: string; onCopy: () => void; onRegenerate: () => void; masked: boolean; setMasked: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          aria-label="Generated value"
          type={masked ? 'password' : 'text'}
          value={value}
          readOnly
          className="font-mono"
        />
        <Button variant="secondary" onClick={() => setMasked(!masked)} aria-label={masked ? 'Unmask' : 'Mask'} disabled={disabled}>
          {masked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button variant="outline" onClick={onRegenerate} disabled={disabled}>
          <RotateCcw className="w-4 h-4 mr-1" /> Regenerate
        </Button>
        <Button onClick={onCopy} disabled={disabled}>
          <Copy className="w-4 h-4 mr-1" /> Copy
        </Button>
      </div>
    </div>
  )
}

function StrengthEntropy({ bits, zScore, zCrack, extra }: { bits: number; zScore?: number | null; zCrack?: string | null; extra?: string }) {
  const label = bits >= 80 ? 'Strong' : bits >= 60 ? 'Good' : bits >= 40 ? 'Fair' : 'Weak'
  return (
    <div className="flex items-center gap-3 text-sm">
      <Badge variant="secondary">Entropy: {Math.round(bits)} bits</Badge>
      <span className="text-gray-600 dark:text-gray-400">Strength: {label}{typeof zScore === 'number' ? ` (zxcvbn: ${zScore}/4)` : ''}</span>
      {zCrack ? <span className="text-gray-500">Est. crack: {zCrack}</span> : null}
      {extra ? <span className="text-gray-500">{extra}</span> : null}
    </div>
  )
}

function Disclaimer() {
  return (
    <Alert>
      <AlertDescription className="text-sm">
        These are NOT real private keys; for appearance/testing only.
      </AlertDescription>
    </Alert>
  )
}


