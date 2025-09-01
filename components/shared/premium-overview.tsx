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
    <Card className="mt-6 bg-background/50 border-border/50">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
          <Crown className="w-4 h-4 text-amber-500" aria-hidden="true" />
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((feature, index) => (
            <div key={index} className="p-3 rounded-md border border-border bg-muted/50 hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Crown className="w-3 h-3 text-amber-500" aria-hidden="true" />
                {feature}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


