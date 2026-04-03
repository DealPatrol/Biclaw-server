import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import billingRoutes from './routes/billing.js';
import agentRoutes from './routes/agents.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Stripe webhook needs raw body
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/agents', agentRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`\n  🤖 BI-CLAW Server running on http://localhost:${PORT}`);
  console.log(`  📡 Accepting requests from: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});
