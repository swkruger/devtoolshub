'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Activity,
  Loader2
} from 'lucide-react'

interface UsageAnalyticsProps {
  isPremiumUser: boolean
}

interface UsageData {
  totalUsage: number
  monthlyUsage: number
  monthlyLimit: number
  toolUsage: {
    [key: string]: number
  }
  recentActivity: {
    tool: string
    timestamp: string
    action: string
  }[]
}

export default function UsageAnalytics({ isPremiumUser }: UsageAnalyticsProps) {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isPremiumUser) {
      fetchUsageData()
    } else {
      setIsLoading(false)
    }
  }, [isPremiumUser])

  const fetchUsageData = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockData: UsageData = {
        totalUsage: 1250,
        monthlyUsage: 450,
        monthlyLimit: 1000,
        toolUsage: {
          'JSON Formatter': 180,
          'Regex Tester': 120,
          'JWT Decoder': 80,
          'Image Compressor': 70
        },
        recentActivity: [
          {
            tool: 'JSON Formatter',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            action: 'Formatted JSON data'
          },
          {
            tool: 'Regex Tester',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            action: 'Tested email validation pattern'
          },
          {
            tool: 'JWT Decoder',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            action: 'Decoded authentication token'
          }
        ]
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUsageData(mockData)
    } catch (error) {
      console.error('Error fetching usage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isPremiumUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-4">
              Upgrade to Premium to access detailed usage analytics and insights.
            </p>
            <Badge variant="secondary">Available with Premium Plan</Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading usage data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No usage data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const usagePercentage = (usageData.monthlyUsage / usageData.monthlyLimit) * 100
  const topTools = Object.entries(usageData.toolUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Monthly Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Usage</p>
              <p className="text-2xl font-bold">{usageData.monthlyUsage.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Monthly Limit</p>
              <p className="text-2xl font-bold">{usageData.monthlyLimit.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Usage Progress</span>
              <span>{usagePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {usageData.monthlyLimit - usageData.monthlyUsage} operations remaining this month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tool Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTools.map(([tool, usage]) => (
              <div key={tool} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="font-medium">{tool}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{usage.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {((usage / usageData.monthlyUsage) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usageData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{activity.tool}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Total Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{usageData.totalUsage.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Operations</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{Object.keys(usageData.toolUsage).length}</p>
              <p className="text-sm text-muted-foreground">Tools Used</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
