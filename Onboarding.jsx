import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';
import { C, Btn, Card } from '../components/UI.jsx';

const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'project', label: 'Your Project' },
  { id: 'plan', label: 'Choose Plan' },
];

const PLAN_OPTIONS = [
  { id: 'free', name: 'Free', price: '$0', desc: '3 audits/month · 2 agents', note: 'Great for trying it out' },
  { id: 'starter', name: 'Starter', price: '$99/mo', desc: '20 audits/month · All 5 agents', note: 'Best for small businesses' },
  { id: 'pro', name: 'Pro', price: '$199/mo', desc: '100 audits/month · Priority + exports', note: 'Best for growing teams' },
  { id: 'agency', name: 'Agency', price: '$299/mo', desc: 'Unlimited · White-label + all features', note: 'Best for agencies' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [projectUrl, setProjectUrl] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const nav = useNavigate();

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const finish = async () => {
    setLoading(true);
    try {
      if (selectedPlan !== 'free') {
        const { url } = await api.checkout(selectedPlan);
        window.location.href = url;
      } else {
        nav('/dashboard', { state: { firstRun: true, projectUrl, projectDesc } });
      }
    } catch (e) {
      nav('/dashboard');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(${C.border}15 1px,transparent 1px),linear-gradient(90deg,${C.border}15 1px,transparent 1px)`, backgroundSize: '50px 50px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '560px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '20px', fontWeight: '900', color: C.cyan, letterSpacing: '4px', textShadow: `0 0 16px ${C.cyan}88`, marginBottom: '6px' }}>BI-CLAW</div>
          <div style={{ fontSize: '13px', color: C.textDim }}>Hey {user?.name?.split(' ')[0]} 👋 — let's get you set up</div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i <= step ? `${C.cyan}22` : '#0a1a0e', border: `1px solid ${i <= step ? C.cyan : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: i <= step ? C.cyan : C.textMuted, fontFamily: "'Share Tech Mono',monospace", flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: '11px', color: i === step ? C.text : C.textDim, fontFamily: "'Share Tech Mono',monospace', whiteSpace: 'nowrap'" }}>{s.label}</span>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: '1px', background: i < step ? C.cyan + '55' : C.border }} />}
            </div>
          ))}
        </div>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <Card style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤖</div>
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '12px' }}>Welcome to BI-CLAW</h2>
            <p style={{ fontSize: '14px', color: C.textDim, lineHeight: 1.7, marginBottom: '20px' }}>
              You're about to get a full AI team working on your business. Here's what happens:
            </p>
            {['You paste your website URL', 'Our 5 AI agents audit your project', 'You get a full report with a 30-day action plan', 'Export, share, and track your progress over time'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${C.cyan}22`, border: `1px solid ${C.cyan}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: C.cyan, flexShrink: 0, fontFamily: "'Share Tech Mono',monospace" }}>{i + 1}</div>
                <span style={{ fontSize: '13px', color: C.text, paddingTop: '2px' }}>{item}</span>
              </div>
            ))}
            <Btn full onClick={next} style={{ marginTop: '8px' }}>Let's go →</Btn>
          </Card>
        )}

        {/* Step 1 — Project */}
        {step === 1 && (
          <Card style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', color: '#fff', marginBottom: '6px' }}>Tell us about your project</h2>
              <p style={{ fontSize: '13px', color: C.textDim }}>This helps your agents hit the ground running on your first audit.</p>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: C.textDim, letterSpacing: '2px', display: 'block', marginBottom: '6px', fontFamily: "'Share Tech Mono',monospace" }}>WEBSITE URL (if live)</label>
              <input value={projectUrl} onChange={e => setProjectUrl(e.target.value)} placeholder="https://mybusiness.com" style={{ width: '100%', background: '#050f06', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '10px 14px', color: C.text, fontSize: '13px', fontFamily: "'Share Tech Mono',monospace" }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: C.textDim, letterSpacing: '2px', display: 'block', marginBottom: '6px', fontFamily: "'Share Tech Mono',monospace" }}>WHAT DOES YOUR BUSINESS DO?</label>
              <textarea value={projectDesc} onChange={e => setProjectDesc(e.target.value)} placeholder="e.g. We sell online courses for freelance designers..." rows={3} style={{ width: '100%', background: '#050f06', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '10px 14px', color: C.text, fontSize: '13px', fontFamily: "'Inter',sans-serif", resize: 'none', lineHeight: 1.6 }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Btn variant="ghost" onClick={back}>← Back</Btn>
              <Btn full onClick={next}>Continue →</Btn>
            </div>
          </Card>
        )}

        {/* Step 2 — Plan */}
        {step === 2 && (
          <Card style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '18px', color: '#fff', marginBottom: '6px' }}>Choose your plan</h2>
            <p style={{ fontSize: '13px', color: C.textDim, marginBottom: '20px' }}>You can upgrade anytime from your dashboard.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {PLAN_OPTIONS.map(p => (
                <div key={p.id} onClick={() => setSelectedPlan(p.id)} style={{ padding: '14px 16px', background: selectedPlan === p.id ? `${C.cyan}0a` : '#050f06', border: `1px solid ${selectedPlan === p.id ? C.cyan : C.border}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${selectedPlan === p.id ? C.cyan : C.border}`, background: selectedPlan === p.id ? C.cyan : 'transparent', flexShrink: 0, transition: 'all 0.15s' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>{p.name}</span>
                      <span style={{ fontSize: '16px', color: selectedPlan === p.id ? C.cyan : C.textDim, fontFamily: "'Share Tech Mono',monospace" }}>{p.price}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: C.textDim }}>{p.desc}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: C.textMuted, textAlign: 'right', minWidth: '80px' }}>{p.note}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Btn variant="ghost" onClick={back}>← Back</Btn>
              <Btn full onClick={finish} disabled={loading}>
                {loading ? 'Setting up...' : selectedPlan === 'free' ? '▶ Launch Dashboard' : `▶ Start ${PLAN_OPTIONS.find(p => p.id === selectedPlan)?.name} — Checkout`}
              </Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
