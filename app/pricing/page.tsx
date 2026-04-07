'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowLeft } from 'lucide-react'

const PLANS = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for freelancers and small projects',
    features: [
      'Up to 5 websites',
      'Monthly audits',
      'Basic reports',
      'Email support',
      '6 audit types',
    ],
  },
  {
    name: 'Pro',
    price: '$79',
    description: 'For growing agencies and teams',
    features: [
      'Up to 25 websites',
      'Weekly audits',
      'Advanced reports',
      'Priority support',
      'Competitor tracking',
      'Custom branding',
      'Team members (up to 5)',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Unlimited websites',
      'Real-time monitoring',
      'Custom reports',
      '24/7 support',
      'API access',
      'Advanced analytics',
      'Custom integrations',
      'Unlimited team members',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-20">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Always flexible to scale.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-8 ${
                plan.popular
                  ? 'border-primary bg-primary/5 ring-1 ring-primary md:scale-105'
                  : 'border-border bg-background'
              }`}
            >
              {plan.popular && (
                <div className="text-sm font-semibold text-primary mb-4">
                  MOST POPULAR
                </div>
              )}

              <h2 className="text-2xl font-bold text-foreground mb-2">
                {plan.name}
              </h2>
              <p className="text-foreground/60 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                {plan.price !== 'Custom' && (
                  <span className="text-foreground/60">/month</span>
                )}
              </div>

              <Button className="w-full mb-8" variant={plan.popular ? 'default' : 'outline'}>
                Get Started
              </Button>

              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I change plans anytime?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, American Express) through Stripe.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! All new accounts get a 14-day free trial on the Starter plan, no credit card required.',
              },
              {
                q: 'What if I need more websites?',
                a: 'You can add additional websites for $5/month each on any plan, or upgrade to the next tier.',
              },
              {
                q: 'Do you offer annual billing?',
                a: 'Yes! Save 20% when you pay annually. Contact our sales team for enterprise pricing.',
              },
              {
                q: 'Can I get a refund?',
                a: 'We offer a 30-day money-back guarantee if you&apos;re not satisfied with our service.',
              },
            ].map((item, index) => (
              <div key={index} className="border border-border rounded-lg p-6 bg-background">
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-foreground/60">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Ready to optimize your website?
          </h2>
          <Link href="/auth/signup">
            <Button size="lg">Start Your Free Trial Today</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
