"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ProgressProps {
  value?: number
  max?: number
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  indeterminate?: boolean
}

export function Progress({
  value = 0,
  max = 100,
  className,
  variant = 'default',
  size = 'md',
  showValue = false,
  indeterminate = false,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500 dark:bg-green-400'
      case 'warning':
        return 'bg-yellow-500 dark:bg-yellow-400'
      case 'error':
        return 'bg-red-500 dark:bg-red-400'
      default:
        return 'bg-blue-500 dark:bg-blue-400'
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-1'
      case 'lg':
        return 'h-3'
      default:
        return 'h-2'
    }
  }

  if (indeterminate) {
    return (
      <div className={cn("w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", getSizeStyles(), className)}>
        <div 
          className={cn(
            "h-full rounded-full animate-pulse",
            getVariantStyles()
          )}
          style={{
            width: '30%',
            animation: 'progress-indeterminate 1.5s ease-in-out infinite'
          }}
        />
        <style jsx>{`
          @keyframes progress-indeterminate {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className={cn("w-full bg-gray-200 dark:bg-gray-700 rounded-full", getSizeStyles(), className)} {...props}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          getVariantStyles()
        )}
        style={{ width: `${percentage}%` }}
      />
      {showValue && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-8 h-8'
      default:
        return 'w-6 h-6'
    }
  }

  return (
    <Loader2 className={cn("animate-spin", getSizeStyles(), className)} />
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  progress?: number
  className?: string
  children: React.ReactNode
}

export function LoadingOverlay({
  isLoading,
  message = "Loading...",
  progress,
  className,
  children
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center space-y-4 max-w-xs">
            <Spinner size="lg" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {message}
              </p>
              {progress !== undefined && (
                <div className="w-full max-w-xs">
                  <Progress value={progress} showValue />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  ...props
}: SkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded'
      case 'circular':
        return 'rounded-full'
      default:
        return 'rounded'
    }
  }

  const style = {
    width: width || undefined,
    height: height || undefined,
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse bg-gray-200 dark:bg-gray-700",
              getVariantStyles(),
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={style}
            {...props}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-700",
        getVariantStyles(),
        className
      )}
      style={style}
      {...props}
    />
  )
} 