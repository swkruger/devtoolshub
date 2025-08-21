"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Crown, Star, Zap, Shield, Users, Clock, ArrowRight } from 'lucide-react'

interface PricingSectionProps {
  className?: string
  id?: string
}

export function PricingSection({ className = "", id }: PricingSectionProps) {
  const [premiumPrice, setPremiumPrice] = useState<number>(9.99)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPremiumPrice = async () => {
      try {
        const response = await fetch('/api/premium-price')
        if (response.ok) {
          const data = await response.json()
          setPremiumPrice(data.price)
        }
      } catch (error) {
        console.error('Error fetching premium price:', error)
        // Keep default price if fetch fails
      } finally {
        setIsLoading(false)
      }
    }

    fetchPremiumPrice()
  }, [])

  const freeFeatures = [
    'Access to all 9 core developer tools',
    'Basic tool functionality',
    '5 saved items per tool',
    'Community support',
    'Standard processing speed',
    'Basic error handling'
  ]

  const premiumFeatures = [
    'Everything in Free plan',
    'Unlimited saved items across all tools',
    'Advanced features and algorithms',
    'Priority support with 24h response',
    'Early access to new tools',
    'Advanced analytics and insights',
    'Custom themes and preferences',
    'API access for integrations',
    'Batch processing capabilities',
    'Enhanced security features',
    'Export/import functionality',
    'Premium keyboard shortcuts'
  ]

  return (
    <section id={id} className={`py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and upgrade when you need more power. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $0
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>

            <div className="space-y-4 mb-8">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/sign-in"
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl border border-blue-500 p-8 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-amber-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Most Popular
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="text-4xl font-bold text-white mb-2">
                {isLoading ? (
                  <div className="animate-pulse bg-white/20 h-12 w-24 mx-auto rounded"></div>
                ) : (
                  <>
                    ${premiumPrice}
                    <span className="text-lg font-normal text-blue-100">/month</span>
                  </>
                )}
              </div>
              <p className="text-blue-100">For power users and teams</p>
            </div>

            <div className="space-y-4 mb-8">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h4>
            <p className="text-gray-600">Optimized for speed with real-time processing and instant results</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h4>
            <p className="text-gray-600">Your data stays private with enterprise-grade security</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Trusted by Developers</h4>
            <p className="text-gray-600">Join thousands of developers who trust DevToolsHub daily</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll keep access until the end of your billing period.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit cards through our secure Stripe payment processing.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">Yes! Start with our free plan and upgrade to Premium whenever you need more features.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600">We offer a 30-day money-back guarantee if you're not satisfied with Premium features.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Supercharge Your Development?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of developers who have already upgraded to Premium and are coding faster than ever.
            </p>
                         <div className="flex justify-center">
               <Link
                 href="/sign-in"
                 className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
               >
                 Get Started
                 <ArrowRight className="w-4 h-4" />
               </Link>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
