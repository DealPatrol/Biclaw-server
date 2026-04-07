import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user details
    const userResult = await query(
      'SELECT id, email, full_name FROM users WHERE id = $1',
      [user.userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: userResult.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
