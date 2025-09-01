import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface ToolPageHeaderProps {
  icon: LucideIcon
  title: string
  description?: string
}

export function ToolPageHeader({ icon: Icon, title, description }: ToolPageHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-muted rounded-lg">
        <Icon className="w-4 h-4 text-foreground" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        ) : null}
      </div>
    </div>
  )
}


