'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3, Zap, Shield, TrendingUp, Users, CheckCircle, Loader2 } from 'lucide-react'

interface Website {
  id: string
  name: string
  url: string
  domain: string
  lastAuditedAt: string | null
  status: string
}

export default function DashboardPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const response = await fetch('/api/websites')
        if (!response.ok) throw new Error('Failed to fetch websites')
        const data = await response.json()
        setWebsites(data.websites || [])
      } catch (err) {
        console.error('Error fetching websites:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWebsites()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-foreground/60">Manage and analyze your websites</p>
        </div>
        <Link href="/dashboard/websites/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Website
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Websites', value: websites.length, icon: BarChart3 },
          { label: 'Audits This Month', value: '0', icon: Zap },
          { label: 'Avg Score', value: '—', icon: TrendingUp },
          { label: 'Issues Found', value: '0', icon: Shield },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="border border-border rounded-lg p-6 bg-background">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-foreground/60">{stat.label}</p>
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Websites List */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground">Your Websites</h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : websites.length === 0 ? (
          <div className="border border-border rounded-lg p-12 text-center bg-background">
            <BarChart3 className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No websites yet</h3>
            <p className="text-foreground/60 mb-6">
              Add your first website to get started with comprehensive audits.
            </p>
            <Link href="/dashboard/websites/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Website
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {websites.map((website) => (
              <Link key={website.id} href={`/dashboard/websites/${website.id}`}>
                <div className="border border-border rounded-lg p-6 bg-background hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {website.name || website.domain}
                      </h3>
                      <p className="text-sm text-foreground/60">{website.url}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground/60">Last audited</p>
                      <p className="font-medium text-foreground">
                        {website.lastAuditedAt
                          ? new Date(website.lastAuditedAt).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      Active
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
