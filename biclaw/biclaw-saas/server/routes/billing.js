import { Router } from 'express';
import Stripe from 'stripe';
import db from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  starter: { priceId: process.env.STRIPE_PRICE_STARTER, name: 'Starter', price: 99 },
  pro:     { priceId: process.env.STRIPE_PRICE_PRO,     name: 'Pro',     price: 199 },
  agency:  { priceId: process.env.STRIPE_PRICE_AGENCY,  name: 'Agency',  price: 299 },
};

// ── GET PLANS ──
router.get('/plans', (req, res) => {
  res.json({
    plans: [
      { id: 'free',    name: 'Free',    price: 0,   audits: 3,   features: ['VIGOR + OPTIMO only', '3 audits/month', 'Session history'] },
      { id: 'starter', name: 'Starter', price: 99,  audits: 20,  features: ['All 5 agents', '20 audits/month', 'A/B tracker', 'Export reports', 'Scheduler'] },
      { id: 'pro',     name: 'Pro',     price: 199, audits: 100, features: ['All 5 agents', '100 audits/month', 'Priority processing', 'White-label reports', 'Slack broadcast'] },
      { id: 'agency',  name: 'Agency',  price: 299, audits: 999, features: ['Everything in Pro', 'Unlimited audits', 'Multi-project tracking', 'Priority support', 'Custom branding'] },
    ]
  });
});

// ── CREATE CHECKOUT SESSION ──
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    let customerId = req.user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: { userId: String(req.user.id) },
      });
      customerId = customer.id;
      db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, req.user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.CLIENT_URL}/billing`,
      metadata: { userId: String(req.user.id), planId },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Could not create checkout session' });
  }
});

// ── CUSTOMER PORTAL ──
router.post('/portal', authMiddleware, async (req, res) => {
  try {
    if (!req.user.stripe_customer_id)
      return res.status(400).json({ error: 'No billing account found' });

    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.stripe_customer_id,
      return_url: `${process.env.CLIENT_URL}/billing`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: 'Could not open billing portal' });
  }
});

// ── STRIPE WEBHOOK ──
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  const session = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      if (userId && planId) {
        db.prepare('UPDATE users SET plan = ?, stripe_subscription_id = ?, subscription_status = ? WHERE id = ?')
          .run(planId, session.subscription, 'active', parseInt(userId));
      }
      break;
    }
    case 'customer.subscription.updated': {
      const sub = session;
      const user = db.prepare('SELECT id FROM users WHERE stripe_subscription_id = ?').get(sub.id);
      if (user) {
        db.prepare('UPDATE users SET subscription_status = ? WHERE id = ?').run(sub.status, user.id);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const user = db.prepare('SELECT id FROM users WHERE stripe_subscription_id = ?').get(session.id);
      if (user) {
        db.prepare('UPDATE users SET plan = ?, subscription_status = ? WHERE id = ?').run('free', 'cancelled', user.id);
      }
      break;
    }
  }

  res.json({ received: true });
});

export default router;
