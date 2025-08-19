'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, Settings, User as UserIcon, CreditCard, Shield, Trash2 } from 'lucide-react'
import Link from 'next/link'
import SettingsTabs from './SettingsTabs'
import ProfileForm from './ProfileForm'
import SubscriptionCard from './SubscriptionCard'
import SecuritySettings from './SecuritySettings'
import AccountDeletion from './AccountDeletion'

interface Profile {
  id: string
  email: string
  name: string
  avatar_url?: string
  plan: 'free' | 'premium'
  created_at: string
  updated_at: string
}

interface UserPreferences {
  id: string
  user_id: string
  timezone: string
  theme: 'light' | 'dark' | 'system'
  language: string
  email_notifications: Record<string, boolean>
  developer_preferences: Record<string, any>
  created_at: string
  updated_at: string
}

interface SettingsLayoutProps {
  user: User
  profile: Profile | null
  preferences: UserPreferences | null
  isPremiumUser: boolean
}

type TabType = 'profile' | 'subscription' | 'security' | 'account'

const tabs = [
  {
    id: 'profile' as TabType,
    label: 'Profile',
    icon: UserIcon,
    description: 'Manage your profile information and preferences'
  },
  {
    id: 'subscription' as TabType,
    label: 'Subscription',
    icon: CreditCard,
    description: 'Manage your subscription and billing'
  },
  {
    id: 'security' as TabType,
    label: 'Security',
    icon: Shield,
    description: 'Password, 2FA, and security settings'
  },
  {
    id: 'account' as TabType,
    label: 'Account',
    icon: Trash2,
    description: 'Data export and account deletion'
  }
]

export default function SettingsLayout({ 
  user, 
  profile, 
  preferences, 
  isPremiumUser 
}: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileForm 
            user={user}
            profile={profile}
            preferences={preferences}
            isPremiumUser={isPremiumUser}
          />
        )
      case 'subscription':
        return (
          <SubscriptionCard 
            user={user}
            profile={profile}
            isPremiumUser={isPremiumUser}
          />
        )
      case 'security':
        return (
          <SecuritySettings 
            user={user}
            isPremiumUser={isPremiumUser}
          />
        )
      case 'account':
        return (
          <AccountDeletion 
            user={user}
            isPremiumUser={isPremiumUser}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Navigation */}
        <div className="lg:col-span-1">
          <SettingsTabs 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {(() => {
                  const activeTabData = tabs.find(tab => tab.id === activeTab)
                  const Icon = activeTabData?.icon
                  return Icon ? <Icon className="w-5 h-5" /> : null
                })()}
                <span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
