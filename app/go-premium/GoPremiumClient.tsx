'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Crown, 
  CheckCircle, 
  XCircle, 
  ArrowUpRight, 
  Calendar,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Zap,
  Shield,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice, getPlanFeatures, SUBSCRIPTION_PLANS, PlanType } from '@/lib/stripe'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'

interface Profile {
  id: string
  email: string
  name: string
  avatar_url?: string
  plan: 'free' | 'premium'
  stripe_customer_id?: string
}

interface GoPremiumClientProps {
  user: User
  profile: Profile | null
  isPremiumUser: boolean
}

interface SubscriptionData {
  currentPlan: PlanType
  subscription: any
  customer: any
  billingHistory: any[]
  plans: typeof SUBSCRIPTION_PLANS
}

const PREMIUM_BENEFITS = [
  { icon: Zap, title: "Advanced Features", description: "Access all premium tools and functionality" },
  { icon: Sparkles, title: "Enhanced Performance", description: "Faster processing and larger file support" },
  { icon: Shield, title: "Priority Support", description: "Get help when you need it most" },
  { icon: Clock, title: "Data Sync", description: "Save your work across all devices" }
]

export default function GoPremiumClient({ user, profile, isPremiumUser }: GoPremiumClientProps) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isManagingBilling, setIsManagingBilling] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Helper function to format subscription date
  const formatSubscriptionDate = (timestamp: any): string => {
    try {
      if (!timestamp) {
        return 'the end of your current billing period'
      }
      
      // Handle both number and string timestamps
      const numericTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp
      
      if (isNaN(numericTimestamp)) {
        return 'the end of your current billing period'
      }
      
      const date = new Date(numericTimestamp * 1000)
      
      if (isNaN(date.getTime())) {
        return 'the end of your current billing period'
      }
      
      return date.toLocaleDateString()
    } catch (error) {
      return 'the end of your current billing period'
    }
  }

  useEffect(() => {
    fetchSubscriptionData()
    
    // Check for success URL parameter and show success message
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const sessionId = urlParams.get('session_id')
    
    if (success === 'true' && sessionId) {
      toast.success('Payment successful! Your subscription has been activated.')
      
      // Immediately try to sync subscription status
      setTimeout(async () => {
        const synced = await syncSubscriptionStatus()
        if (synced) {
          toast.success('Subscription status updated successfully!')
          // Redirect to dashboard after successful upgrade
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        }
      }, 1000)
      
      // Poll for subscription updates (webhook might take a moment)
      let pollCount = 0
      const maxPolls = 10
      const pollInterval = setInterval(async () => {
        pollCount++
        
        // Try to sync subscription status first
        const synced = await syncSubscriptionStatus()
        if (!synced) {
          // If sync fails, just fetch data normally
          fetchSubscriptionData()
        }
        
        // Stop polling after max attempts or if user becomes premium
        if (pollCount >= maxPolls || subscriptionData?.currentPlan === 'premium') {
          clearInterval(pollInterval)
          // Redirect to dashboard
          window.location.href = '/dashboard'
        }
      }, 2000) // Poll every 2 seconds
      
      // Clean up URL parameters
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      
      // Cleanup interval on unmount
      return () => clearInterval(pollInterval)
    }
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/settings/subscription')
      if (!response.ok) {
        throw new Error('Failed to fetch subscription data')
      }
      const data = await response.json()
      setSubscriptionData(data)
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      toast.error('Failed to load subscription information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      toast.info('Creating checkout session...')
      
      const response = await fetch('/api/settings/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_checkout_session', plan: 'premium' })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      toast.success('Redirecting to payment...')
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error('Failed to start upgrade process')
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleManageBilling = async () => {
    setIsManagingBilling(true)
    try {
      const response = await fetch('/api/settings/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_portal_session' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create billing portal session')
      }

      if (data.url) {
        window.open(data.url, '_blank')
        toast.success('Billing portal opened in new tab')
      } else {
        throw new Error('No portal URL received')
      }
    } catch (error) {
      console.error('Error creating billing portal session:', error)
      
      // Show specific error messages based on the error
      if (error instanceof Error) {
        if (error.message.includes('No subscription found')) {
          toast.error('No subscription found. Please upgrade to premium first.')
        } else if (error.message.includes('Customer not found')) {
          toast.error('Subscription not found in Stripe. Please contact support.')
        } else if (error.message.includes('Billing portal not configured')) {
          toast.error('Billing portal not configured. Please contact support.')
        } else {
          toast.error(error.message || 'Failed to open billing portal')
        }
      } else {
        toast.error('Failed to open billing portal')
      }
    } finally {
      setIsManagingBilling(false)
    }
  }

  const handleCancelSubscription = () => {
    setShowCancelModal(true)
  }

  const confirmCancelSubscription = async () => {
    setIsCancelling(true)
    try {
      const response = await fetch('/api/settings/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_subscription' })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      toast.success('Subscription cancelled successfully. You will remain premium until the end of your billing period.')
      await fetchSubscriptionData() // Refresh data
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Failed to cancel subscription')
    } finally {
      setIsCancelling(false)
    }
  }

  const syncSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/fix-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        await fetchSubscriptionData() // Refresh data
        return true
      }
      return false
    } catch (error) {
      console.error('Error syncing subscription:', error)
      return false
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3">Loading subscription information...</span>
      </div>
    )
  }

  const currentPlan = subscriptionData?.currentPlan || 'free'
  const subscription = subscriptionData?.subscription
  const customer = subscriptionData?.customer
  const billingHistory = subscriptionData?.billingHistory || []

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {new URLSearchParams(window.location.search).get('success') === 'true' && (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Payment successful! Your subscription is being activated. Please wait a moment for the status to update.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-amber-800 dark:text-amber-200">
            Upgrade to Premium
          </CardTitle>
          <p className="text-lg text-amber-700 dark:text-amber-300">
            Unlock all premium features and enhance your development workflow
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-baseline justify-center gap-2 mb-6">
            <span className="text-4xl font-bold text-amber-800 dark:text-amber-200">
              ${SUBSCRIPTION_PLANS.premium.price / 100}
            </span>
            <span className="text-lg text-amber-700 dark:text-amber-300">/month</span>
          </div>
          <Button 
            onClick={handleUpgrade} 
            disabled={isUpgrading}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-3"
          >
            {isUpgrading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Upgrade Now
              </div>
            )}
          </Button>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
            Cancel anytime • 30-day money-back guarantee
          </p>
        </CardContent>
      </Card>

      {/* Premium Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Premium Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {PREMIUM_BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">{benefit.title}</h4>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {currentPlan === 'premium' ? (
                  <>
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Premium Plan
                  </>
                ) : (
                  'Free Plan'
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentPlan === 'premium' ? (
                  <>
                    ${SUBSCRIPTION_PLANS.premium.price / 100}/month
                    {subscription && (
                      <span className="ml-2">
                        • {subscription.cancel_at_period_end ? 'Access until' : 'Next billing'}: {formatSubscriptionDate(subscription.current_period_end)}
                      </span>
                    )}
                  </>
                ) : (
                  'No monthly charge'
                )}
              </p>
            </div>
            <Badge variant={currentPlan === 'premium' ? 'default' : 'secondary'}>
              {currentPlan === 'premium' ? (
                subscription?.cancel_at_period_end ? 'Cancelled' : 'Active'
              ) : 'Free'}
            </Badge>
          </div>

          {currentPlan === 'premium' && subscription && (
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {subscription.cancel_at_period_end ? (
                  <>
                    Your premium subscription is active until {formatSubscriptionDate(subscription.current_period_end)}. 
                    It will not renew after this date.
                  </>
                ) : (
                  'Your premium subscription is active and will automatically renew'
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {currentPlan === 'free' ? (
              <Button onClick={handleUpgrade} disabled={isUpgrading} className="flex items-center gap-2">
                {isUpgrading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
                Upgrade to Premium
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleManageBilling} 
                  disabled={isManagingBilling}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isManagingBilling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Manage Billing
                </Button>
                {!subscription?.cancel_at_period_end && (
                  <Button 
                    onClick={handleCancelSubscription} 
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Subscription
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => (
              <div
                key={planKey}
                className={`p-4 rounded-lg border ${
                  planKey === currentPlan
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    {planKey === 'premium' && <Crown className="h-4 w-4 text-yellow-500" />}
                    {plan.name}
                  </h4>
                  <div className="text-right">
                    <div className="font-bold">
                      {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                    </div>
                    {plan.price > 0 && <div className="text-xs text-muted-foreground">per month</div>}
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium mb-1">Limitations:</div>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <XCircle className="h-3 w-3" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      {currentPlan === 'premium' && billingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">
                      {new Date(invoice.created * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.description || 'Premium Subscription'}
                    </div>
                    {invoice.period_start && invoice.period_end && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(invoice.period_start * 1000).toLocaleDateString()} - {new Date(invoice.period_end * 1000).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {invoice.amount_paid ? formatPrice(invoice.amount_paid) : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.status === 'paid' ? 'Paid' : invoice.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {billingHistory.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" onClick={handleManageBilling}>
                  View All Invoices
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancel Subscription Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelSubscription}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? You will keep all premium features until the end of your current billing period, but your subscription will not renew automatically."
        confirmText="Cancel Subscription"
        cancelText="Keep Subscription"
        variant="destructive"
        icon={<AlertTriangle className="h-5 w-5" />}
      />
    </div>
  )
}
