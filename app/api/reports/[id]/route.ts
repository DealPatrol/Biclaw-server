import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id: reportId } = await params

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

    // Fetch report (ensure it belongs to user's organization)
    const result = await query(
      `SELECT ar.id, ar.website_id, ar.audit_type, ar.status, ar.overall_score, ar.data, ar.error_message, ar.created_at, ar.completed_at
       FROM audit_reports ar
       JOIN websites w ON ar.website_id = w.id
       WHERE ar.id = $1 AND w.organization_id = $2`,
      [reportId, orgId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ report: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Get report error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
