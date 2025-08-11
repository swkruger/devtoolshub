"use client"

import { useEffect, useId } from 'react'
import { Slider } from '@radix-ui/react-slider'
import * as SliderPrimitive from '@radix-ui/react-slider'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Button } from '@/components/ui/button'
import { Crown, Shuffle, Copy, Eye, EyeOff, RotateCcw, Key, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordControlsProps {
  length: number
  onLengthChange: (val: number) => void
  useUpper: boolean
  onUseUpperChange: (val: boolean) => void
  useLower: boolean
  onUseLowerChange: (val: boolean) => void
  useDigits: boolean
  onUseDigitsChange: (val: boolean) => void
  useSymbols: boolean
  onUseSymbolsChange: (val: boolean) => void
  excludeAmbiguous: boolean
  onExcludeAmbiguousChange: (val: boolean) => void
  pronounceable: boolean
  onPronounceableChange: (val: boolean) => void
}

export function PasswordControls(props: PasswordControlsProps) {
  const sliderId = useId()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label htmlFor={sliderId} className="text-sm font-medium">Length: {props.length}</label>
        <SliderPrimitive.Root
          id={sliderId}
          className="relative flex items-center select-none touch-none h-5"
          min={8}
          max={128}
          step={1}
          value={[props.length]}
          onValueChange={(v) => props.onLengthChange(v[0])}
          aria-label="Password length"
        >
          <SliderPrimitive.Track className="bg-muted relative grow rounded-full h-1">
            <SliderPrimitive.Range className="absolute h-full bg-primary rounded-full" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block w-4 h-4 bg-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </SliderPrimitive.Root>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <LabeledSwitch label="Uppercase" checked={props.useUpper} onCheckedChange={props.onUseUpperChange} />
        <LabeledSwitch label="Lowercase" checked={props.useLower} onCheckedChange={props.onUseLowerChange} />
        <LabeledSwitch label="Digits" checked={props.useDigits} onCheckedChange={props.onUseDigitsChange} />
        <LabeledSwitch label="Symbols" checked={props.useSymbols} onCheckedChange={props.onUseSymbolsChange} />
        <LabeledSwitch label="Exclude ambiguous" checked={props.excludeAmbiguous} onCheckedChange={props.onExcludeAmbiguousChange} />
        <LabeledSwitch label="Pronounceable" checked={props.pronounceable} onCheckedChange={props.onPronounceableChange} />
      </div>
    </div>
  )
}

function LabeledSwitch({ label, checked, onCheckedChange, disabled }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean }) {
  const id = useId()
  return (
    <div className={cn('flex items-center justify-between gap-2 p-2 rounded-md border', disabled ? 'opacity-50' : '')}>
      <label htmlFor={id} className="text-sm">{label}</label>
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="w-10 h-6 bg-muted rounded-full relative data-[state=checked]:bg-primary outline-none"
      >
        <SwitchPrimitive.Thumb className="block w-5 h-5 bg-white rounded-full translate-x-0.5 data-[state=checked]:translate-x-[1.35rem] transition-transform" />
      </SwitchPrimitive.Root>
    </div>
  )
}

interface PassphraseControlsProps {
  wordCount: number
  onWordCountChange: (v: number) => void
  separator: string
  onSeparatorChange: (v: string) => void
  capitalize: boolean
  onCapitalizeChange: (v: boolean) => void
  addNumber: boolean
  onAddNumberChange: (v: boolean) => void
  addSymbol: boolean
  onAddSymbolChange: (v: boolean) => void
}

export function PassphraseControls(props: PassphraseControlsProps) {
  const sliderId = useId()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label htmlFor={sliderId} className="text-sm font-medium">Word Count: {props.wordCount}</label>
        <SliderPrimitive.Root
          id={sliderId}
          className="relative flex items-center select-none touch-none h-5"
          min={3}
          max={12}
          step={1}
          value={[props.wordCount]}
          onValueChange={(v) => props.onWordCountChange(v[0])}
          aria-label="Word count"
        >
          <SliderPrimitive.Track className="bg-muted relative grow rounded-full h-1">
            <SliderPrimitive.Range className="absolute h-full bg-primary rounded-full" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block w-4 h-4 bg-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </SliderPrimitive.Root>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SeparatorPicker value={props.separator} onChange={props.onSeparatorChange} />
        <LabeledSwitch label="Capitalize" checked={props.capitalize} onCheckedChange={props.onCapitalizeChange} />
        <LabeledSwitch label="Number suffix" checked={props.addNumber} onCheckedChange={props.onAddNumberChange} />
        <LabeledSwitch label="Symbol suffix" checked={props.addSymbol} onCheckedChange={props.onAddSymbolChange} />
      </div>
    </div>
  )
}

function SeparatorPicker({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-2 p-2 rounded-md border', disabled ? 'opacity-50' : '')}>
      <label className="text-sm">Separator</label>
      <select
        aria-label="Separator"
        className="border rounded-md text-sm px-2 py-1 bg-background"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="-">-</option>
        <option value="_">_</option>
        <option value=".">.</option>
        <option value=" ">space</option>
        <option value="custom">custom</option>
      </select>
    </div>
  )
}


