import { Router } from 'express';
import db from '../lib/db.js';
import { authMiddleware, checkPlanLimit, PLAN_LIMITS } from '../middleware/auth.js';

const router = Router();

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const HEADERS = {
  'Content-Type': 'application/json',
  'anthropic-version': '2023-06-01',
  'anthropic-beta': 'web-search-2025-03-05',
  'x-api-key': process.env.ANTHROPIC_API_KEY,
};

// Agent definitions
const AGENTS = {
  max: {
    name: 'MAX', emoji: '🧠', color: '#00F5FF',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: `You are MAX — the orchestrator and CEO Proxy of the BI-CLAW AI team.
Output EXACTLY:
## EXECUTIVE SUMMARY
2-3 sentences on what this project is and its current state.
## CROSS-TEAM SYNTHESIS
Integrate findings from all sub-agents into one coherent picture.
## PRIORITY DECISION
The single #1 action this project must take right now.
## APPROVAL / RISK GATE
**GREENLIGHT:** What you approve. **BLOCK:** What must be fixed first.
## 30-DAY BATTLE PLAN
- Week 1: ... - Week 2: ... - Week 3: ... - Week 4: ...
## CONFIDENCE SCORE
Rate: X/10. Reasoning: one sentence.`,
  },
  vigor: {
    name: 'VIGOR', emoji: '📈', color: '#39FF14',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: `You are VIGOR — Head of Marketing and Growth.
Output EXACTLY:
## SEO AUDIT
Specific issues: title tags, meta, keywords, technical SEO.
## CONTENT GAPS
What's missing that would drive organic traffic.
## TRENDSCOUT REPORT
Top 5 trending topics in this niche right now.
## GROWTH PLAYBOOK
1. **[Action]** — details 2. **[Action]** — details 3. **[Action]** — details
## BLOG CALENDAR (4 WEEKS)
- Week 1: [title] | [title] - Week 2: [title] | [title] - Week 3: [title] | [title] - Week 4: [title] | [title]
## CONFIDENCE SCORE
Rate: X/10. Reasoning: one sentence.`,
  },
  fidus: {
    name: 'FIDUS', emoji: '⚙️', color: '#FF6B35',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: `You are FIDUS — Site Reliability Engineer.
Output EXACTLY:
## INFRASTRUCTURE ASSESSMENT
Current setup, hosting, deployment pipeline.
## RELIABILITY RISKS
Single points of failure, downtime risks.
## DATABASE HEALTH
Schema issues, query performance, indexing.
## COST ANALYSIS
LLM/API/hosting costs, estimated monthly burn: $X
## OPS HARDENING CHECKLIST
1. [Fix] — severity: HIGH/MED/LOW (repeat x5)
## CONFIDENCE SCORE
Rate: X/10. Reasoning: one sentence.`,
  },
  optimo: {
    name: 'OPTIMO', emoji: '🔬', color: '#BF5FFF',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: `You are OPTIMO — Head of CRO.
Output EXACTLY:
## CONVERSION AUDIT
Current funnel weaknesses, drop-off points, friction.
## LANDING PAGE SCORE
- Headline: X/10 - CTA: X/10 - Social Proof: X/10 - Overall: X/10
## A/B TEST QUEUE
1. Test: [what] | Hypothesis: [result] | Variant: [desc] (x3)
## IDEAL FUNNEL
Optimized conversion funnel step by step.
## QUICK WINS
Changes today with estimated impact %.
## CONFIDENCE SCORE
Rate: X/10. Reasoning: one sentence.`,
  },
  mercury: {
    name: 'MERCURY', emoji: '📨', color: '#FFD700',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: `You are MERCURY — Sales Operations. HARD CAP: 20 sends/day.
Output EXACTLY:
## ICP DEFINITION
Ideal Customer Profile: demographics, pain points, buying triggers.
## OUTREACH AUDIT
Current sales mechanisms. What's missing.
## COLD EMAIL SEQUENCE
**Email 1 — Day 1:** Subject: [line] Body: [100 words max]
**Email 2 — Day 3:** Subject: [line] Body: [75 words max]
**Email 3 — Day 7:** Subject: [line] Body: [50 words max]
## PROSPECT SCORING
Score leads 1-10 based on: [criteria]
## REVENUE QUICK WINS
Top 3 actions for revenue in 30 days.
## CONFIDENCE SCORE
Rate: X/10. Reasoning: one sentence.`,
  },
};

// ── SCAN URL ──
router.post('/scan', authMiddleware, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  try {
    const response = await fetch(ANTHROPIC_API, {
      method: 'POST', headers: HEADERS,
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: 'You are a web scanner. Search the URL. Respond ONLY with valid JSON (no markdown): {"title":"...","description":"...","tech_hints":"...","content_summary":"400+ word detailed summary"}',
        messages: [{ role: 'user', content: `Scan: ${url}` }],
      }),
    });
    const data = await response.json();
    const tb = data.content?.find(b => b.type === 'text');
    if (!tb) throw new Error('No content from scan');
    const parsed = JSON.parse(tb.text.replace(/```json|```/g, '').trim());
    res.json({ ...parsed, tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0) });
  } catch (err) {
    res.status(500).json({ error: 'Scan failed: ' + err.message });
  }
});

// ── RUN SINGLE AGENT ──
router.post('/run', authMiddleware, checkPlanLimit, async (req, res) => {
  const { agentId, prompt } = req.body;
  const agent = AGENTS[agentId];
  if (!agent) return res.status(400).json({ error: 'Unknown agent' });

  // Check plan allows this agent
  const allowed = req.planLimit.agents;
  if (!allowed.includes(agentId)) {
    return res.status(403).json({ error: `${agent.name} requires a paid plan`, upgradeRequired: true });
  }

  try {
    const response = await fetch(ANTHROPIC_API, {
      method: 'POST', headers: HEADERS,
      body: JSON.stringify({ model: agent.model, max_tokens: 1000, system: agent.systemPrompt, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await response.json();
    const text = data.content?.map(b => b.text || '').join('') || '';
    const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
    res.json({ text, tokens, agentId });
  } catch (err) {
    res.status(500).json({ error: `${agent.name} failed: ${err.message}` });
  }
});

// ── SAVE SESSION ──
router.post('/sessions', authMiddleware, (req, res) => {
  try {
    const { target, siteTitle, siteTech, responses, tokenCount } = req.body;
    const costUsd = (tokenCount / 1000) * 0.003;
    const result = db.prepare(
      'INSERT INTO sessions (user_id, target, site_title, site_tech, responses, token_count, cost_usd) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, target, siteTitle || '', siteTech || '', JSON.stringify(responses), tokenCount || 0, costUsd);

    // Increment audit count
    db.prepare('UPDATE users SET audits_this_month = audits_this_month + 1 WHERE id = ?').run(req.user.id);

    // Save trendscout from vigor if present
    const vigorText = responses?.vigor || '';
    const topicMatch = vigorText.match(/TRENDSCOUT REPORT([\s\S]*?)(?=##|$)/i);
    if (topicMatch) {
      const topics = topicMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim()).join('|||');
      const existing = db.prepare('SELECT id FROM trendscout WHERE user_id = ?').get(req.user.id);
      if (existing) {
        db.prepare('UPDATE trendscout SET topics = ?, updated_at = ? WHERE user_id = ?').run(topics, new Date().toISOString(), req.user.id);
      } else {
        db.prepare('INSERT INTO trendscout (user_id, topics) VALUES (?, ?)').run(req.user.id, topics);
      }
    }

    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Save failed' });
  }
});

// ── GET SESSIONS ──
router.get('/sessions', authMiddleware, (req, res) => {
  const sessions = db.prepare('SELECT id, target, site_title, site_tech, token_count, cost_usd, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.user.id);
  res.json({ sessions });
});

// ── GET SINGLE SESSION ──
router.get('/sessions/:id', authMiddleware, (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  session.responses = JSON.parse(session.responses || '{}');
  res.json({ session });
});

// ── A/B TESTS ──
router.get('/ab', authMiddleware, (req, res) => {
  const tests = db.prepare('SELECT * FROM ab_tests WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ tests });
});

router.post('/ab', authMiddleware, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const result = db.prepare('INSERT INTO ab_tests (user_id, name) VALUES (?, ?)').run(req.user.id, name);
  res.json({ id: result.lastInsertRowid, name, status: 'running' });
});

router.put('/ab/:id', authMiddleware, (req, res) => {
  const { status, notes } = req.body;
  db.prepare('UPDATE ab_tests SET status = ?, notes = ? WHERE id = ? AND user_id = ?').run(status, notes || '', req.params.id, req.user.id);
  res.json({ success: true });
});

router.delete('/ab/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM ab_tests WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// ── TRENDSCOUT ──
router.get('/trends', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM trendscout WHERE user_id = ?').get(req.user.id);
  if (!row) return res.json({ topics: [], updatedAt: null });
  res.json({ topics: (row.topics || '').split('|||').filter(Boolean), updatedAt: row.updated_at });
});

// ── USAGE STATS ──
router.get('/usage', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT plan, audits_this_month, audits_reset_at FROM users WHERE id = ?').get(req.user.id);
  const limit = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
  const totalCost = db.prepare('SELECT COALESCE(SUM(cost_usd), 0) as total FROM sessions WHERE user_id = ?').get(req.user.id);
  res.json({
    plan: user.plan,
    auditsUsed: user.audits_this_month,
    auditsLimit: limit.auditsPerMonth,
    auditsRemaining: Math.max(0, limit.auditsPerMonth - user.audits_this_month),
    resetAt: user.audits_reset_at,
    totalCostUsd: totalCost.total.toFixed(4),
  });
});

export default router;
