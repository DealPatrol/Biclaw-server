import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { query } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { message: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const organizationId = session.metadata?.organizationId
  const planTier = session.metadata?.planTier
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!organizationId || !planTier) {
    console.error('Missing required metadata in checkout session')
    return
  }

  // Update subscription in database
  await query(
    `UPDATE subscriptions 
     SET stripe_customer_id = $1, stripe_subscription_id = $2, plan_tier = $3, status = $4
     WHERE organization_id = $5`,
    [customerId, subscriptionId, planTier, 'active', organizationId]
  )

  console.log(`Subscription activated for organization ${organizationId}`)
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string

  // Find organization by customer ID
  const result = await query(
    `UPDATE subscriptions 
     SET plan_tier = $1, status = $2, current_period_start = $3, current_period_end = $4
     WHERE stripe_customer_id = $5
     RETURNING organization_id`,
    [
      subscription.metadata?.planTier || 'starter',
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      customerId,
    ]
  )

  if (result.rows.length > 0) {
    console.log(
      `Subscription updated for organization ${result.rows[0].organization_id}`
    )
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string

  // Update subscription status to canceled
  const result = await query(
    `UPDATE subscriptions 
     SET status = $1
     WHERE stripe_customer_id = $2
     RETURNING organization_id`,
    ['canceled', customerId]
  )

  if (result.rows.length > 0) {
    console.log(
      `Subscription canceled for organization ${result.rows[0].organization_id}`
    )
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  console.log(`Payment succeeded for customer ${customerId}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  console.log(`Payment failed for customer ${customerId}`)

  // Update subscription status to past_due
  await query(
    `UPDATE subscriptions 
     SET status = $1
     WHERE stripe_customer_id = $2`,
    ['past_due', customerId]
  )
}
