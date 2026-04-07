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
      return NextResponse.json({ websites: [] }, { status: 200 })
    }

    const orgId = orgResult.rows[0].id

    // Fetch websites
    const websitesResult = await query(
      `SELECT id, name, url, domain, last_audited_at as "lastAuditedAt", status
       FROM websites 
       WHERE organization_id = $1 AND status = 'active'
       ORDER BY created_at DESC`,
      [orgId]
    )

    return NextResponse.json(
      { websites: websitesResult.rows },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get websites error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { url, name } = await req.json()

    if (!url) {
      return NextResponse.json(
        { message: 'URL is required' },
        { status: 400 }
      )
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

    // Extract domain from URL
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const domain = urlObj.hostname

    // Create website
    const result = await query(
      `INSERT INTO websites (organization_id, url, domain, name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, url, domain, last_audited_at as "lastAuditedAt", status`,
      [orgId, url, domain, name || domain]
    )

    return NextResponse.json(
      { website: result.rows[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create website error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
