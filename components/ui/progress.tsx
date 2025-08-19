"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

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
                  <Progress value={progress} />
                  <div className="text-xs text-center mt-1">{Math.round(progress)}%</div>
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