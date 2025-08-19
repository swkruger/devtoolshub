'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

type TabType = 'profile' | 'subscription' | 'security' | 'account'

interface Tab {
  id: TabType
  label: string
  icon: LucideIcon
  description: string
}

interface SettingsTabsProps {
  tabs: Tab[]
  activeTab: TabType
  onTabChange: (tabId: TabType) => void
}

export default function SettingsTabs({ tabs, activeTab, onTabChange }: SettingsTabsProps) {
  const handleKeyDown = (event: React.KeyboardEvent, tabId: TabType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onTabChange(tabId)
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      
      {/* Desktop: Vertical tabs */}
      <div className="hidden lg:block space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3 text-left",
                isActive && "bg-secondary text-secondary-foreground"
              )}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-label={`${tab.label} settings`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{tab.label}</span>
                  <span className="text-xs text-muted-foreground hidden xl:block">
                    {tab.description}
                  </span>
                </div>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Mobile: Horizontal scrollable tabs */}
      <div className="lg:hidden">
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "flex-shrink-0 whitespace-nowrap",
                  isActive && "bg-secondary text-secondary-foreground"
                )}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-label={`${tab.label} settings`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
