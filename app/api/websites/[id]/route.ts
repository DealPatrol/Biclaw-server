import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const websiteId = params.id

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

    // Fetch website (ensure it belongs to user's organization)
    const result = await query(
      `SELECT id, name, url, domain, last_audited_at as "lastAuditedAt", status
       FROM websites 
       WHERE id = $1 AND organization_id = $2`,
      [websiteId, orgId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Website not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ website: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Get website error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
