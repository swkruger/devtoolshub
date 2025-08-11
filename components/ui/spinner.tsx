import React from 'react'
import { Loader2 } from 'lucide-react'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  ariaLabel?: string
}

export function Spinner({ size = 'sm', className = '', ariaLabel = 'Loading' }: SpinnerProps) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <Loader2
      className={`${sizeClass} animate-spin ${className}`}
      aria-label={ariaLabel}
      role="status"
      aria-live="polite"
    />
  )
}


