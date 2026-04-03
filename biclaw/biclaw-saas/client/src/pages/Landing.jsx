import { useNavigate } from 'react-router-dom';
import { C, Btn } from '../components/UI.jsx';

const FEATURES = [
  { emoji: '🧠', name: 'MAX', desc: 'CEO Proxy — synthesizes all reports into one executive decision and 30-day battle plan' },
  { emoji: '📈', name: 'VIGOR', desc: 'SEO audits, TrendScout feed, content calendar, growth playbook' },
  { emoji: '⚙️', name: 'FIDUS', desc: 'Infrastructure health, cost monitoring, ops hardening checklist' },
  { emoji: '🔬', name: 'OPTIMO', desc: 'Conversion audit, landing page score, A/B test queue' },
  { emoji: '📨', name: 'MERCURY', desc: 'ICP definition, cold email sequences, prospect qualification' },
];

const PLANS = [
  { name: 'Free', price: '$0', audits: '3 audits/mo', agents: '2 agents', cta: 'Start Free', highlight: false },
  { name: 'Starter', price: '$99/mo', audits: '20 audits/mo', agents: 'All 5 agents', cta: 'Start Starter', highlight: false },
  { name: 'Pro', price: '$199/mo', audits: '100 audits/mo', agents: 'All 5 agents + exports', cta: 'Start Pro', highlight: true },
  { name: 'Agency', price: '$299/mo', audits: 'Unlimited', agents: 'Everything + white-label', cta: 'Start Agency', highlight: false },
];

export default function Landing() {
  const nav = useNavigate();
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${C.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: C.bg, zIndex: 100 }}>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '18px', fontWeight: '900', color: C.cyan, letterSpacing: '4px', textShadow: `0 0 16px ${C.cyan}88` }}>BI-CLAW</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Btn variant="ghost" small onClick={() => nav('/login')}>Sign In</Btn>
          <Btn variant="primary" small onClick={() => nav('/register')}>Get Started Free</Btn>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: 'clamp(60px,10vw,120px) 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${C.border}22 1px,transparent 1px),linear-gradient(90deg,${C.border}22 1px,transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${C.cyan}11`, border: `1px solid ${C.cyan}33`, borderRadius: '100px', padding: '6px 18px', marginBottom: '24px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.cyan, animation: 'pulse 2s infinite', boxShadow: `0 0 8px ${C.cyan}` }} />
            <span style={{ fontSize: '11px', color: C.cyan, fontFamily: "'Share Tech Mono',monospace", letterSpacing: '2px' }}>FULL VERTICAL AI TEAM — THE COO ECOSYSTEM</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,6vw,72px)', fontFamily: "'Orbitron',sans-serif", fontWeight: '900', color: '#fff', marginBottom: '20px', lineHeight: 1.1, letterSpacing: '-1px' }}>
            Your Business Gets<br />
            <span style={{ color: C.cyan, textShadow: `0 0 30px ${C.cyan}88` }}>5 AI Specialists</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px,2vw,20px)', color: C.textDim, maxWidth: '600px', margin: '0 auto 36px', lineHeight: 1.7 }}>
            Paste your website URL. In minutes, get a full audit from a growth expert, ops engineer, conversion optimizer, sales strategist, and an AI CEO who synthesizes it all into one action plan.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Btn onClick={() => nav('/register')} style={{ padding: '14px 32px', fontSize: '14px', animation: 'glow 3s infinite' }}>▶ Start Free — No Credit Card</Btn>
            <Btn variant="ghost" onClick={() => nav('/login')} style={{ padding: '14px 32px', fontSize: '14px' }}>Sign In →</Btn>
          </div>
        </div>
      </div>

      {/* AGENTS */}
      <div style={{ padding: '0 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontFamily: "'Orbitron',sans-serif", fontSize: '22px', color: '#fff', marginBottom: '40px', letterSpacing: '2px' }}>Meet Your Team</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '16px' }}>
          {FEATURES.map(f => (
            <div key={f.name} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{f.emoji}</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '14px', color: C.cyan, marginBottom: '6px', letterSpacing: '2px' }}>{f.name}</div>
              <div style={{ fontSize: '13px', color: C.textDim, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: '0 24px 80px', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontFamily: "'Orbitron',sans-serif", fontSize: '22px', color: '#fff', marginBottom: '40px', letterSpacing: '2px' }}>How It Works</h2>
        {['Paste your website URL or describe your business', 'All 5 agents analyze your project simultaneously', 'MAX synthesizes everything into one executive brief', 'Get your 30-day action plan and export the report'].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${C.cyan}22`, border: `1px solid ${C.cyan}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Orbitron',sans-serif", fontSize: '13px', color: C.cyan }}>{i + 1}</div>
            <div style={{ fontSize: '15px', color: C.text, paddingTop: '4px', lineHeight: 1.6 }}>{step}</div>
          </div>
        ))}
      </div>

      {/* PRICING */}
      <div style={{ padding: '0 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontFamily: "'Orbitron',sans-serif", fontSize: '22px', color: '#fff', marginBottom: '40px', letterSpacing: '2px' }}>Pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px' }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background: p.highlight ? `${C.cyan}0a` : C.bgCard, border: `1px solid ${p.highlight ? C.cyan : C.border}`, borderRadius: '10px', padding: '24px', textAlign: 'center', boxShadow: p.highlight ? `0 0 24px ${C.cyan}22` : 'none' }}>
              {p.highlight && <div style={{ fontSize: '9px', color: C.cyan, letterSpacing: '2px', marginBottom: '8px', fontFamily: "'Share Tech Mono',monospace" }}>MOST POPULAR</div>}
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '16px', color: '#fff', marginBottom: '8px' }}>{p.name}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: C.cyan, marginBottom: '4px' }}>{p.price}</div>
              <div style={{ fontSize: '12px', color: C.textDim, marginBottom: '6px' }}>{p.audits}</div>
              <div style={{ fontSize: '12px', color: C.textDim, marginBottom: '20px' }}>{p.agents}</div>
              <Btn full onClick={() => nav('/register')} variant={p.highlight ? 'primary' : 'ghost'} style={{ fontSize: '11px', padding: '10px' }}>{p.cta}</Btn>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '24px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.textMuted, letterSpacing: '2px' }}>
          BI-CLAW · FULL VERTICAL AI TEAM · POWERED BY CLAUDE · biclaw.app
        </div>
      </div>
    </div>
  );
}
