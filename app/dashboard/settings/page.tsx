'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; full_name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        if (!response.ok) throw new Error('Failed to fetch user')
        const data = await response.json()
        setUser(data.user)
      } catch (err) {
        console.error('Error fetching user:', err)
        setError('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

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
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-foreground/60">Manage your account preferences</p>
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

      {/* Account Section */}
      <div className="max-w-2xl space-y-6">
        <div className="border border-border rounded-lg p-6 bg-background">
          <h2 className="text-xl font-bold text-foreground mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-4 py-2 border border-border rounded-md bg-muted text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={user?.full_name || ''}
                readOnly
                className="w-full px-4 py-2 border border-border rounded-md bg-muted text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <div className="border border-border rounded-lg p-6 bg-background">
          <h2 className="text-xl font-bold text-foreground mb-4">Billing & Plan</h2>
          <p className="text-foreground/60 mb-4">
            Manage your subscription and billing information
          </p>
          <Button variant="outline">
            Manage Billing
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-200 rounded-lg p-6 bg-red-50">
          <h2 className="text-xl font-bold text-red-900 mb-4">Danger Zone</h2>
          <p className="text-red-800 mb-4">
            These actions are permanent and cannot be undone.
          </p>
          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  )
}
