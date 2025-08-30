import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Crown } from 'lucide-react'

interface PremiumOverviewProps {
  features: string[]
  title?: string
  subtitle?: string
}

export function PremiumOverview({ features, title = 'Backer Features', subtitle = 'Become a backer to unlock these capabilities' }: PremiumOverviewProps) {
  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Crown className="w-4 h-4 text-yellow-500" aria-hidden="true" />
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{subtitle}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((feature, index) => (
            <div key={index} className="p-3 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Crown className="w-3 h-3 text-yellow-500" aria-hidden="true" />
                {feature}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


