import jwt from 'jsonwebtoken';
import db from '../lib/db.js';

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Plan limits
export const PLAN_LIMITS = {
  free:    { auditsPerMonth: 3,   agents: ['vigor','optimo'], label: 'Free' },
  starter: { auditsPerMonth: 20,  agents: ['vigor','fidus','optimo','mercury','max'], label: 'Starter' },
  pro:     { auditsPerMonth: 100, agents: ['vigor','fidus','optimo','mercury','max'], label: 'Pro' },
  agency:  { auditsPerMonth: 999, agents: ['vigor','fidus','optimo','mercury','max'], label: 'Agency' },
};

export function checkPlanLimit(req, res, next) {
  const user = req.user;
  const limit = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;

  // Reset monthly count if needed
  const now = new Date();
  const resetAt = user.audits_reset_at ? new Date(user.audits_reset_at) : null;
  if (!resetAt || now > resetAt) {
    db.prepare('UPDATE users SET audits_this_month = 0, audits_reset_at = ? WHERE id = ?')
      .run(new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(), user.id);
    req.user.audits_this_month = 0;
  }

  if (req.user.audits_this_month >= limit.auditsPerMonth) {
    return res.status(429).json({
      error: 'Monthly audit limit reached',
      limit: limit.auditsPerMonth,
      plan: user.plan,
      upgradeRequired: true,
    });
  }
  req.planLimit = limit;
  next();
}
