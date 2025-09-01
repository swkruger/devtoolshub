"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Crown, Star, Zap, Shield, Users, Clock, ArrowRight } from 'lucide-react'
import { useSignInModal } from '@/lib/use-sign-in-modal'
import { getClientApplicationName } from '@/lib/app-config'


interface PricingSectionProps {
  className?: string
  id?: string
}

export function PricingSection({ className = "", id }: PricingSectionProps) {
  const [backerPrice, setBackerPrice] = useState<number>(9.99)
  const [isLoading, setIsLoading] = useState(true)
  const { openModal } = useSignInModal()

  useEffect(() => {
    const fetchBackerPrice = async () => {
      try {
        const response = await fetch('/api/backer-price')
        if (response.ok) {
          const data = await response.json()
          setBackerPrice(data.price)
        }
      } catch (error) {
        console.error('Error fetching backer price:', error)
        // Keep default price if fetch fails
      } finally {
        setIsLoading(false)
      }
    }

    fetchBackerPrice()
  }, [])

  const freeFeatures = [
    'Access to all developer tools',
    'Basic tool functionality',
  ]

  const premiumFeatures = [
    'Unlimited saved items across all tools',
    'Advanced features and algorithms',
    'Early access to new tools',
    'Advanced analytics and insights',
    'Batch processing capabilities',
    'Export/import functionality',
  ]

  return (
    <section id={id} className={`py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            Support the Project
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Support the Project
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All tools are completely free forever with no ads. Become a backer to unlock advanced features and help us build more tools for the developer community.
          </p>
        </div>

        {/* Support Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $0
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">All tools free forever</p>
            </div>

            <div className="space-y-4 mb-8">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => openModal()}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl border border-blue-500 p-8 relative">

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Backer</h3>
              <div className="text-4xl font-bold text-white mb-2">
                {isLoading ? (
                  <div className="animate-pulse bg-white/20 h-12 w-24 mx-auto rounded"></div>
                ) : (
                  <>
                    ${backerPrice}
                    <span className="text-lg font-normal text-blue-100">/month</span>
                  </>
                )}
              </div>
              <p className="text-blue-100">Support the project & unlock advanced features</p>
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
            <p className="text-gray-600">Join thousands of developers who trust {getClientApplicationName()} daily</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Why should I support the project?</h4>
              <p className="text-gray-600">Your support helps us develop new tools, improve existing ones, and maintain the platform. Every backer directly contributes to making {getClientApplicationName()} better for the entire developer community.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What do I get as a backer?</h4>
              <p className="text-gray-600">Backers get unlimited saved items, advanced features, early access to new tools, and priority support. Plus, you&apos;ll help shape the future of developer tools!</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. You&apos;ll keep access until the end of your billing period, and we&apos;ll be grateful for your support!</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How does my support help the community?</h4>
              <p className="text-gray-600">Your contribution funds new tool development, server costs, and helps us keep all tools free for everyone. You&apos;re helping build a better developer ecosystem!</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Support the Project?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of developers who have become backers and are helping us build more tools for the community. Every contribution makes a difference!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => openModal()}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Become a Backer
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-sm text-gray-500">
                💝 Your support keeps {getClientApplicationName()} free for everyone
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
