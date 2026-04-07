'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart3, Zap, Shield, TrendingUp, Users, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">Biclaw</div>
          <div className="flex gap-4 items-center">
            <Link href="/pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
          Compete with the Top 1% of Websites
        </h1>
        <p className="text-xl text-foreground/60 mb-8 max-w-2xl mx-auto text-balance">
          Biclaw analyzes your website across 6 dimensions — SEO, performance, security, design, content, and competitor benchmarking — to keep you ahead of the competition.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              Start Free Analysis <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg">View Pricing</Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Comprehensive Website Audits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: BarChart3,
              title: 'SEO Audit',
              description: 'Meta tags, keywords, crawlability, and schema markup analysis',
            },
            {
              icon: Zap,
              title: 'Performance Analysis',
              description: 'Core Web Vitals, page load time, and optimization recommendations',
            },
            {
              icon: Shield,
              title: 'Security Scan',
              description: 'SSL certificates, headers, compliance (GDPR/CCPA), vulnerabilities',
            },
            {
              icon: TrendingUp,
              title: 'Content Analysis',
              description: 'Readability, keyword optimization, and content quality scoring',
            },
            {
              icon: Users,
              title: 'Design/UX Audit',
              description: 'Accessibility, responsiveness, and user experience scoring',
            },
            {
              icon: CheckCircle,
              title: 'Competitor Benchmarking',
              description: 'Compare your site against competitors and industry leaders',
            },
          ].map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="border border-border rounded-lg p-6 bg-background hover:shadow-lg transition-shadow">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground/60">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Simple, Transparent Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Starter',
              price: '$29',
              description: 'Perfect for freelancers',
              features: ['5 websites', 'Monthly audits', 'Basic reports', 'Email support'],
            },
            {
              name: 'Pro',
              price: '$79',
              description: 'For growing agencies',
              features: ['25 websites', 'Weekly audits', 'Advanced reports', 'Priority support', 'Competitor tracking'],
              popular: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              description: 'For large teams',
              features: ['Unlimited websites', 'Real-time monitoring', 'Custom reports', '24/7 support', 'API access'],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-8 ${
                plan.popular
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-background'
              }`}
            >
              {plan.popular && (
                <div className="text-sm font-semibold text-primary mb-2">MOST POPULAR</div>
              )}
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-foreground/60 mb-4">{plan.description}</p>
              <div className="text-4xl font-bold text-foreground mb-6">
                {plan.price}
                {plan.price !== 'Custom' && <span className="text-lg text-foreground/60">/mo</span>}
              </div>
              <Button
                className="w-full mb-6"
                variant={plan.popular ? 'default' : 'outline'}
              >
                Get Started
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-foreground/60">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6 text-foreground">
          Ready to optimize your website?
        </h2>
        <p className="text-lg text-foreground/60 mb-8">
          Start your first free analysis today. No credit card required.
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="gap-2">
            Start Your Free Analysis <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-foreground/60">
          <p>&copy; 2024 Biclaw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
