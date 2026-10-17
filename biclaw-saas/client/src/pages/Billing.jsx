import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';
import { C, Btn, Card, SectionLabel, Tag } from '../components/UI.jsx';
import AppShell from '../components/AppShell.jsx';

const PLAN_FEATURES = {
  free:    { audits: 3,   agents: '2 agents (VIGOR + OPTIMO)', color: C.textDim },
  starter: { audits: 20,  agents: 'All 5 agents',              color: C.cyan },
  pro:     { audits: 100, agents: 'All 5 agents + priority',   color: C.purple },
  agency:  { audits: 999, agents: 'Unlimited + white-label',   color: C.gold },
};

export default function Billing() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    api.plans().then(d => setPlans(d.plans || []));
    api.usage().then(d => setUsage(d));
  }, []);

  const checkout = async (planId) => {
    setLoading(planId);
    try {
      const { url } = await api.checkout(planId);
      window.location.href = url;
    } catch (e) {
      alert(e.error || 'Checkout failed');
    } finally { setLoading(''); }
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { url } = await api.portal();
      window.location.href = url;
    } catch (e) {
      alert('Could not open billing portal. Make sure you have an active subscription.');
    } finally { setPortalLoading(false); }
  };

  const planColor = PLAN_FEATURES[user?.plan]?.color || C.textDim;

  return (
    <AppShell>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px', fontFamily: "'Inter',sans-serif" }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', color: '#fff', fontFamily: "'Orbitron',sans-serif", letterSpacing: '2px', marginBottom: '6px' }}>Billing</h1>
          <p style={{ fontSize: '13px', color: C.textDim }}>Manage your plan and usage</p>
        </div>

        {/* Current plan card */}
        <Card style={{ marginBottom: '24px', border: `1px solid ${planColor}44`, boxShadow: `0 0 20px ${planColor}18` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <SectionLabel>Current Plan</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '20px', color: planColor, letterSpacing: '2px' }}>{user?.plan?.toUpperCase()}</span>
                <Tag color={planColor}>{user?.subscription_status || 'active'}</Tag>
              </div>
              <div style={{ fontSize: '13px', color: C.textDim }}>{PLAN_FEATURES[user?.plan]?.agents}</div>
            </div>
            {user?.plan !== 'free' && (
              <Btn variant="ghost" small onClick={openPortal} disabled={portalLoading}>
                {portalLoading ? 'Opening...' : '⚙ Manage Subscription →'}
              </Btn>
            )}
          </div>

          {/* Usage meter */}
          {usage && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: C.textDim, fontFamily: "'Share Tech Mono',monospace" }}>AUDITS THIS MONTH</span>
                <span style={{ fontSize: '11px', color: C.text, fontFamily: "'Share Tech Mono',monospace" }}>
                  {usage.auditsUsed} / {usage.auditsLimit === 999 ? '∞' : usage.auditsLimit}
                </span>
              </div>
              <div style={{ height: '6px', background: '#0a2014', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((usage.auditsUsed / (usage.auditsLimit || 1)) * 100, 100)}%`,
                  background: usage.auditsUsed >= usage.auditsLimit ? C.red : C.green,
                  transition: 'width 0.4s',
                  boxShadow: `0 0 6px ${C.green}`,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '10px', color: C.textMuted }}>
                  {usage.auditsRemaining} remaining · resets {usage.resetAt ? new Date(usage.resetAt).toLocaleDateString() : 'next month'}
                </span>
                <span style={{ fontSize: '10px', color: C.textMuted }}>
                  Total spend: ${usage.totalCostUsd}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Plan selector */}
        <div style={{ marginBottom: '8px' }}>
          <SectionLabel>Available Plans</SectionLabel>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px', marginBottom: '32px' }}>
          {plans.map(plan => {
            const isCurrent = user?.plan === plan.id;
            const highlight = plan.id === 'pro';
            return (
              <div key={plan.id} style={{
                background: highlight ? `${C.cyan}0a` : C.bgCard,
                border: `1px solid ${isCurrent ? C.green : highlight ? C.cyan : C.border}`,
                borderRadius: '10px', padding: '20px 16px',
                display: 'flex', flexDirection: 'column', gap: '12px',
                boxShadow: highlight ? `0 0 20px ${C.cyan}18` : 'none',
                position: 'relative',
              }}>
                {highlight && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: C.cyan, color: '#000', fontSize: '8px', fontFamily: "'Share Tech Mono',monospace", padding: '2px 10px', borderRadius: '10px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
                {isCurrent && <div style={{ position: 'absolute', top: 8, right: 8 }}><Tag color={C.green}>CURRENT</Tag></div>}
                <div>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '13px', color: '#fff', marginBottom: '4px' }}>{plan.name}</div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: isCurrent ? C.green : highlight ? C.cyan : C.text, fontFamily: "'Share Tech Mono',monospace" }}>${plan.price}<span style={{ fontSize: '11px', color: C.textDim }}>{plan.price > 0 ? '/mo' : ''}</span></div>
                </div>
                <div style={{ flex: 1 }}>
                  {plan.features?.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: C.textDim, marginBottom: '5px' }}>
                      <span style={{ color: C.green, flexShrink: 0 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                {!isCurrent && plan.id !== 'free' && (
                  <Btn full small variant={highlight ? 'primary' : 'ghost'} onClick={() => checkout(plan.id)} disabled={loading === plan.id}>
                    {loading === plan.id ? 'Loading...' : `Upgrade →`}
                  </Btn>
                )}
                {isCurrent && <div style={{ fontSize: '10px', color: C.green, textAlign: 'center', fontFamily: "'Share Tech Mono',monospace" }}>✓ Active</div>}
                {!isCurrent && plan.id === 'free' && user?.plan !== 'free' && (
                  <div style={{ fontSize: '10px', color: C.textMuted, textAlign: 'center' }}>Downgrade via portal</div>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <Card>
          <SectionLabel>Common Questions</SectionLabel>
          {[
            ['Can I cancel anytime?', 'Yes — cancel from the Manage Subscription button above. Your access continues until the end of the billing period.'],
            ['What counts as an audit?', 'One full run of the COO Ecosystem (all 5 agents) counts as 1 audit. Running individual agents also counts as 1 audit.'],
            ['Is my API key safe?', 'Completely. We run the Anthropic API on our server — your clients never see any keys or technical details.'],
            ['Can I upgrade mid-month?', 'Yes — you\'ll be charged a prorated amount for the remainder of the month.'],
          ].map(([q, a], i) => (
            <div key={i} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: '600', marginBottom: '4px' }}>{q}</div>
              <div style={{ fontSize: '12px', color: C.textDim, lineHeight: 1.6 }}>{a}</div>
            </div>
          ))}
        </Card>

      </div>
    </AppShell>
  );
}
