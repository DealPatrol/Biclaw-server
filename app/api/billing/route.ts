import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const orgResult = await query(
      `SELECT o.id FROM organizations o 
       WHERE o.user_id = $1 
       LIMIT 1`,
      [user.userId]
    )

    if (orgResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Organization not found' },
        { status: 404 }
      )
    }

    const orgId = orgResult.rows[0].id

    // Get subscription
    const subscriptionResult = await query(
      `SELECT id, plan_tier, status, current_period_start, current_period_end
       FROM subscriptions 
       WHERE organization_id = $1
       LIMIT 1`,
      [orgId]
    )

    const subscription =
      subscriptionResult.rows.length > 0
        ? subscriptionResult.rows[0]
        : null

    // Get website count
    const websiteCountResult = await query(
      `SELECT COUNT(*) as count FROM websites 
       WHERE organization_id = $1 AND status = 'active'`,
      [orgId]
    )

    const websitesCount = parseInt(
      websiteCountResult.rows[0].count
    )

    // Get audit count for current month
    const auditCountResult = await query(
      `SELECT COUNT(*) as count FROM audit_reports ar
       JOIN websites w ON ar.website_id = w.id
       WHERE w.organization_id = $1 
       AND ar.created_at >= date_trunc('month', CURRENT_DATE)`,
      [orgId]
    )

    const auditsThisMonth = parseInt(
      auditCountResult.rows[0].count
    )

    return NextResponse.json(
      {
        subscription,
        websites_count: websitesCount,
        audits_this_month: auditsThisMonth,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get billing error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
