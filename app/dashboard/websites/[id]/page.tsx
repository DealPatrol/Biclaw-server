'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BarChart3, Zap, Shield, BookOpen, Layout, TrendingUp, Play, Loader2 } from 'lucide-react'

interface Website {
  id: string
  name: string
  url: string
  domain: string
  lastAuditedAt: string | null
  status: string
}

const AUDIT_TYPES = [
  {
    id: 'seo',
    name: 'SEO Audit',
    description: 'Keywords, meta tags, crawlability, and schema markup',
    icon: BarChart3,
    color: 'bg-blue-50 text-blue-700',
  },
  {
    id: 'performance',
    name: 'Performance Audit',
    description: 'Page speed, Core Web Vitals, and optimization',
    icon: Zap,
    color: 'bg-yellow-50 text-yellow-700',
  },
  {
    id: 'security',
    name: 'Security Scan',
    description: 'SSL, GDPR/CCPA compliance, and vulnerabilities',
    icon: Shield,
    color: 'bg-red-50 text-red-700',
  },
  {
    id: 'content',
    name: 'Content Analysis',
    description: 'Readability, keyword optimization, and quality scoring',
    icon: BookOpen,
    color: 'bg-green-50 text-green-700',
  },
  {
    id: 'design',
    name: 'Design/UX Audit',
    description: 'Accessibility, responsiveness, and user experience',
    icon: Layout,
    color: 'bg-purple-50 text-purple-700',
  },
  {
    id: 'competitor',
    name: 'Competitor Benchmarking',
    description: 'Compare your site against competitors',
    icon: TrendingUp,
    color: 'bg-pink-50 text-pink-700',
  },
]

export default function WebsiteDetailPage() {
  const params = useParams()
  const websiteId = params.id as string
  const [website, setWebsite] = useState<Website | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningAudits, setRunningAudits] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const response = await fetch(`/api/websites/${websiteId}`)
        if (!response.ok) throw new Error('Failed to fetch website')
        const data = await response.json()
        setWebsite(data.website)
      } catch (err) {
        console.error('Error fetching website:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWebsite()
  }, [websiteId])

  const handleRunAudit = async (auditType: string) => {
    setRunningAudits((prev) => new Set([...prev, auditType]))

    try {
      const response = await fetch(`/api/audits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId,
          auditType,
        }),
      })

      if (!response.ok) throw new Error('Failed to start audit')
      const data = await response.json()

      // Redirect to report page
      window.location.href = `/dashboard/reports/${data.report.id}`
    } catch (err) {
      console.error('Error running audit:', err)
      setRunningAudits((prev) => {
        const next = new Set(prev)
        next.delete(auditType)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!website) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/60">Website not found</p>
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
          <h1 className="text-3xl font-bold text-foreground">{website.name}</h1>
          <p className="text-foreground/60">{website.url}</p>
        </div>
      </div>

      {/* Website Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border rounded-lg p-6 bg-background">
          <p className="text-sm text-foreground/60 mb-2">Domain</p>
          <p className="font-mono text-lg text-foreground">{website.domain}</p>
        </div>
        <div className="border border-border rounded-lg p-6 bg-background">
          <p className="text-sm text-foreground/60 mb-2">Status</p>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>
        <div className="border border-border rounded-lg p-6 bg-background">
          <p className="text-sm text-foreground/60 mb-2">Last Audited</p>
          <p className="font-medium text-foreground">
            {website.lastAuditedAt
              ? new Date(website.lastAuditedAt).toLocaleDateString()
              : 'Never'}
          </p>
        </div>
      </div>

      {/* Audit Options */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground">Run Audits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AUDIT_TYPES.map((audit) => {
            const Icon = audit.icon
            const isRunning = runningAudits.has(audit.id)

            return (
              <div
                key={audit.id}
                className="border border-border rounded-lg p-6 bg-background hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${audit.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{audit.name}</h3>
                <p className="text-sm text-foreground/60 mb-4">{audit.description}</p>
                <Button
                  size="sm"
                  disabled={isRunning}
                  onClick={() => handleRunAudit(audit.id)}
                  className="w-full gap-2"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Audit
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
