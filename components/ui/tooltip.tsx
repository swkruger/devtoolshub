"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ children, content, side = 'top', className }: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      <div
        className={cn(
          "absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg",
          "whitespace-nowrap pointer-events-none",
          {
            'bottom-full left-1/2 transform -translate-x-1/2 mb-2': side === 'top',
            'top-full left-1/2 transform -translate-x-1/2 mt-2': side === 'bottom',
            'right-full top-1/2 transform -translate-y-1/2 mr-2': side === 'left',
            'left-full top-1/2 transform -translate-y-1/2 ml-2': side === 'right',
          },
          className
        )}
      >
        {content}
        {/* Arrow */}
        <div
          className={cn(
            "absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45",
            {
              'top-full left-1/2 -translate-x-1/2 -mt-1': side === 'top',
              'bottom-full left-1/2 -translate-x-1/2 -mb-1': side === 'bottom',
              'top-1/2 left-full -translate-y-1/2 -ml-1': side === 'left',
              'top-1/2 right-full -translate-y-1/2 -mr-1': side === 'right',
            }
          )}
        />
      </div>
    </div>
  )
} 