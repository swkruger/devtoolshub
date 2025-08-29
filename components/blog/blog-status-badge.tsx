import { cn } from '@/lib/utils'
import type { BlogStatus } from '@/lib/types/blog'

interface BlogStatusBadgeProps {
  status: BlogStatus
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  draft: {
    label: 'Draft',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
  },
  editing: {
    label: 'Editing',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
  },
  'ready to publish': {
    label: 'Ready to Publish',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  },
  published: {
    label: 'Published',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  }
}

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
}

export function BlogStatusBadge({ status, className, size = 'md' }: BlogStatusBadgeProps) {
  const config = statusConfig[status]
  
  if (!config) {
    return null
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.className,
        sizeConfig[size],
        className
      )}
    >
      {config.label}
    </span>
  )
}
