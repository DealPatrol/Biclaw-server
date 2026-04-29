'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, AlertCircle, CreditCard } from 'lucide-react'

interface Subscription {
  id: string
  plan_tier: string
  status: string
  current_period_start: string
  current_period_end: string
}

interface BillingInfo {
  subscription: Subscription
  websites_count: number
  audits_this_month: number
}

export default function BillingPage() {
  const router = useRouter()
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        const response = await fetch('/api/billing')
        if (!response.ok) throw new Error('Failed to fetch billing info')
        const data = await response.json()
        setBillingInfo(data)
      } catch (err) {
        console.error('Error fetching billing info:', err)
        setError('Failed to load billing information')
      } finally {
        setLoading(false)
      }
    }

    fetchBillingInfo()
  }, [])

  const handleUpgrade = async (planTier: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier }),
      })

      if (!response.ok) throw new Error('Failed to create checkout session')
      const data = await response.json()

      // Redirect to Stripe checkout
      window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`
    } catch (err) {
      console.error('Error creating checkout:', err)
      setError('Failed to initiate checkout')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
          <p className="text-foreground/60">Manage your plan and billing information</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Current Plan */}
      {billingInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the {billingInfo.subscription.plan_tier} plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-foreground/60">Plan</p>
                <p className="font-semibold text-foreground capitalize">
                  {billingInfo.subscription.plan_tier}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Status</p>
                <Badge variant={billingInfo.subscription.status === 'active' ? 'success' : 'destructive'}>
                  {billingInfo.subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Websites</p>
                <p className="font-semibold text-foreground">{billingInfo.websites_count}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Audits (This Month)</p>
                <p className="font-semibold text-foreground">{billingInfo.audits_this_month}</p>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 bg-background">
              <p className="text-sm text-foreground/60 mb-2">Billing Period</p>
              <p className="text-foreground">
                {new Date(billingInfo.subscription.current_period_start).toLocaleDateString()} -{' '}
                {new Date(billingInfo.subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Options */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">Upgrade Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Starter',
              price: '$29',
              features: ['5 websites', 'Monthly audits', 'Basic reports', 'Email support'],
              tier: 'starter',
            },
            {
              name: 'Pro',
              price: '$79',
              features: ['25 websites', 'Weekly audits', 'Advanced reports', 'Priority support'],
              tier: 'pro',
              recommended: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              features: ['Unlimited websites', 'Real-time audits', 'Custom reports', '24/7 support'],
              tier: 'enterprise',
            },
          ].map((plan) => (
            <Card
              key={plan.tier}
              className={plan.recommended ? 'ring-2 ring-primary' : ''}
            >
              <CardHeader>
                {plan.recommended && (
                  <Badge className="w-fit mb-2">Recommended</Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-foreground/60">/month</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm text-foreground/60">
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(plan.tier)}
                  variant={plan.recommended ? 'default' : 'outline'}
                >
                  {plan.tier === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods for billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg p-4 text-center">
            <CreditCard className="w-8 h-8 text-foreground/40 mx-auto mb-2" />
            <p className="text-foreground/60 text-sm">
              Payment methods are managed through Stripe
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
