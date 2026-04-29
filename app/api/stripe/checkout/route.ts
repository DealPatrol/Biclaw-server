import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { planTier } = await req.json()

    if (!planTier) {
      return NextResponse.json(
        { message: 'Plan tier is required' },
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

    // Get user email
    const userResult = await query(
      `SELECT email FROM users WHERE id = $1`,
      [user.userId]
    )

    const userEmail = userResult.rows[0].email

    // Define pricing
    const pricing: Record<string, { price: number; name: string }> = {
      starter: { price: 2900, name: 'Biclaw Starter' },
      pro: { price: 7900, name: 'Biclaw Pro' },
      enterprise: { price: 29900, name: 'Biclaw Enterprise' },
    }

    if (!pricing[planTier]) {
      return NextResponse.json(
        { message: 'Invalid plan tier' },
        { status: 400 }
      )
    }

    // Create or get Stripe customer
    let customerId: string
    const subscriptionResult = await query(
      `SELECT stripe_customer_id FROM subscriptions WHERE organization_id = $1`,
      [orgId]
    )

    if (
      subscriptionResult.rows.length > 0 &&
      subscriptionResult.rows[0].stripe_customer_id
    ) {
      customerId = subscriptionResult.rows[0].stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          organizationId: orgId,
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pricing[planTier].name,
              description: `${planTier.charAt(0).toUpperCase() + planTier.slice(1)} plan`,
            },
            unit_amount: pricing[planTier].price,
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        organizationId: orgId,
        planTier,
      },
    })

    return NextResponse.json({ sessionId: session.id }, { status: 200 })
  } catch (error) {
    console.error('Create checkout error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
