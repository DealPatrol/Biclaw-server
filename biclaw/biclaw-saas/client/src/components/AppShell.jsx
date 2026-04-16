import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { C, Btn } from './UI.jsx';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', emoji: '🤖' },
  { path: '/billing',   label: 'Billing',   emoji: '💳' },
  { path: '/settings',  label: 'Settings',  emoji: '⚙️' },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter',sans-serif" }}>
      {/* Top nav */}
      <nav style={{ borderBottom: `1px solid ${C.border}`, padding: '0 24px', display: 'flex', alignItems: 'center', gap: '0', position: 'sticky', top: 0, background: '#010c05', zIndex: 100, height: '52px' }}>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '16px', fontWeight: '900', color: C.cyan, letterSpacing: '4px', textShadow: `0 0 12px ${C.cyan}66`, marginRight: '32px', flexShrink: 0 }}>BI-CLAW</div>

        {NAV_ITEMS.map(item => (
          <button key={item.path} onClick={() => nav(item.path)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${loc.pathname === item.path ? C.cyan : 'transparent'}`, color: loc.pathname === item.path ? C.cyan : C.textDim, padding: '0 16px', height: '52px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Share Tech Mono',monospace", letterSpacing: '1px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{item.emoji}</span>{item.label}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '11px', color: C.textDim }}>
            {user?.name} · <span style={{ color: C.cyan, fontFamily: "'Share Tech Mono',monospace", fontSize: '10px' }}>{user?.plan?.toUpperCase()}</span>
          </div>
          <Btn small variant="ghost" onClick={() => { logout(); nav('/'); }}>Sign Out</Btn>
        </div>
      </nav>

      {children}
    </div>
  );
}
