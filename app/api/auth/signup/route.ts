import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password } = await req.json()

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const userResult = await query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email',
      [email, passwordHash, fullName]
    )

    const user = userResult.rows[0]

    // Create default organization
    const orgSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    const orgResult = await query(
      'INSERT INTO organizations (user_id, name, slug) VALUES ($1, $2, $3) RETURNING id',
      [user.id, `${fullName}'s Organization`, orgSlug]
    )

    const org = orgResult.rows[0]

    // Add user as owner of organization
    await query(
      'INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3)',
      [org.id, user.id, 'owner']
    )

    // Create subscription (free trial)
    await query(
      'INSERT INTO subscriptions (organization_id, plan_tier, status) VALUES ($1, $2, $3)',
      [org.id, 'starter', 'trialing']
    )

    // Create token and set cookie
    const token = createToken(user.id, user.email)
    await setAuthCookie(token)

    return NextResponse.json(
      { message: 'Account created successfully', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
