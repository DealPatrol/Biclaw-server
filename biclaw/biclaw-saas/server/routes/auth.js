import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ── REGISTER ──
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, company } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ error: 'Email, password, and name are required' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) return res.status(409).json({ error: 'An account with that email already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const result = db.prepare(
      'INSERT INTO users (email, password, name, company, plan) VALUES (?, ?, ?, ?, ?)'
    ).run(email.toLowerCase(), hashed, name, company || '', 'free');

    const user = db.prepare('SELECT id, email, name, company, plan, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── LOGIN ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(new Date().toISOString(), user.id);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── GET CURRENT USER ──
router.get('/me', authMiddleware, (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// ── UPDATE PROFILE ──
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, company } = req.body;
    db.prepare('UPDATE users SET name = ?, company = ? WHERE id = ?')
      .run(name || req.user.name, company || '', req.user.id);
    const updated = db.prepare('SELECT id, email, name, company, plan, audits_this_month FROM users WHERE id = ?').get(req.user.id);
    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

export default router;
