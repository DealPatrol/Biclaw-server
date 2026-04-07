'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, AlertTriangle, Share2, Download, TrendingUp, TrendingDown } from 'lucide-react'

interface AuditReport {
  id: string
  website_id: string
  audit_type: string
  status: string
  overall_score: number
  data: any
  error_message: string | null
  created_at: string
  completed_at: string | null
}

const ScoreCard = ({ score, label }: { score: number; label: string }) => {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getBadgeVariant = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'destructive'
  }

  return (
    <div className={`rounded-lg border p-6 text-center ${getColor(score)}`}>
      <div className="text-4xl font-bold mb-2">{score}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  )
}

export default function ReportPage() {
  const params = useParams()
  const reportId = params.id as string
  const [report, setReport] = useState<AuditReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(true)

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`)
        if (!response.ok) throw new Error('Failed to fetch report')
        const data = await response.json()
        setReport(data.report)

        // Stop polling if report is completed or failed
        if (data.report.status === 'completed' || data.report.status === 'failed') {
          setPolling(false)
        }
      } catch (err) {
        console.error('Error fetching report:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()

    // Poll for updates every 2 seconds if status is pending/in_progress
    if (polling) {
      pollInterval = setInterval(fetchReport, 2000)
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [reportId, polling])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/60">Report not found</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'in_progress':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'in_progress':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground capitalize">
              {report.audit_type} Audit Report
            </h1>
            <p className="text-foreground/60">
              {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(report.status)}
                <span className={`capitalize ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </CardTitle>
              <CardDescription>
                {report.status === 'completed'
                  ? 'Audit completed successfully'
                  : report.status === 'in_progress'
                  ? 'Analyzing your website...'
                  : 'Audit processing failed'}
              </CardDescription>
            </div>
            {report.status === 'completed' && (
              <ScoreCard score={report.overall_score} label="Overall Score" />
            )}
          </div>
        </CardHeader>

        {report.status === 'failed' && (
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Audit Failed</p>
                <p className="text-sm text-red-700">{report.error_message}</p>
              </div>
            </div>
          </CardContent>
        )}

        {report.status === 'in_progress' && (
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Audit In Progress</p>
                <p className="text-sm text-blue-700">Please wait while we analyze your website...</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Audit Data */}
      {report.status === 'completed' && report.data && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Key Findings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(report.data).slice(0, 6).map(([key, value]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {typeof value === 'object' ? (
                    <pre className="text-xs text-foreground/60 overflow-auto max-h-32">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-foreground font-medium">
                      {String(value)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Based on your audit results, here are our top recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: 'Improve Core Web Vitals',
                  description: 'Your page load time could be optimized by implementing lazy loading',
                  priority: 'high',
                },
                {
                  title: 'Add Missing Meta Tags',
                  description: 'Add meta description tags to improve SEO performance',
                  priority: 'medium',
                },
                {
                  title: 'Update Security Headers',
                  description: 'Implement additional security headers for better protection',
                  priority: 'low',
                },
              ].map((rec, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{rec.title}</h4>
                    <Badge
                      variant={
                        rec.priority === 'high'
                          ? 'destructive'
                          : rec.priority === 'medium'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/60">{rec.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
