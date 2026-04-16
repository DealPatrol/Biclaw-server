// ── Shared BI-CLAW UI Components ──

export const C = {
  bg: '#020f08', bgCard: 'rgba(0,16,8,0.95)', bgInput: 'rgba(0,10,5,0.9)',
  border: '#0a2a14', borderHover: '#1a5a24',
  text: '#a0e8c0', textDim: '#2a6a3a', textMuted: '#1a3a20',
  cyan: '#00F5FF', green: '#39FF14', orange: '#FF6B35',
  purple: '#BF5FFF', gold: '#FFD700', red: '#FF4444',
};

export function Btn({ children, onClick, variant = 'primary', disabled, small, full, style = {} }) {
  const variants = {
    primary: { bg: `${C.cyan}18`, border: `1px solid ${C.cyan}`, color: C.cyan },
    green:   { bg: `${C.green}18`, border: `1px solid ${C.green}`, color: C.green },
    ghost:   { bg: 'transparent', border: `1px solid ${C.border}`, color: C.textDim },
    danger:  { bg: `${C.red}18`, border: `1px solid ${C.red}55`, color: C.red },
    gold:    { bg: `${C.gold}18`, border: `1px solid ${C.gold}`, color: C.gold },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...v, padding: small ? '5px 12px' : '10px 20px',
      borderRadius: '6px', fontSize: small ? '10px' : '12px',
      fontFamily: "'Share Tech Mono',monospace", letterSpacing: '1px',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
      transition: 'all 0.15s', width: full ? '100%' : 'auto',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      textShadow: disabled ? 'none' : `0 0 8px ${v.color}55`,
      ...style,
    }}>{children}</button>
  );
}

export function Input({ label, type = 'text', value, onChange, placeholder, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '10px', color: C.textDim, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Share Tech Mono',monospace" }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
        background: C.bgInput, border: `1px solid ${error ? C.red : C.border}`,
        borderRadius: '6px', padding: '10px 14px', color: C.text,
        fontSize: '13px', fontFamily: "'Share Tech Mono',monospace", width: '100%',
        outline: 'none', transition: 'border-color 0.2s',
      }} onFocus={e => e.target.style.borderColor = error ? C.red : C.cyan}
         onBlur={e => e.target.style.borderColor = error ? C.red : C.border} />
      {error && <span style={{ fontSize: '11px', color: C.red }}>{error}</span>}
    </div>
  );
}

export function Card({ children, style = {}, glow }) {
  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: '10px', padding: '20px',
      boxShadow: glow ? `0 0 20px ${glow}22` : 'none',
      ...style,
    }}>{children}</div>
  );
}

export function Tag({ children, color }) {
  return (
    <span style={{ fontSize: '8px', color: color || C.cyan, background: (color || C.cyan) + '18', padding: '2px 7px', borderRadius: '3px', letterSpacing: '1px', fontFamily: "'Share Tech Mono',monospace" }}>
      {children}
    </span>
  );
}

export function Spinner({ color }) {
  return (
    <div style={{ width: '14px', height: '14px', border: `2px solid ${(color||C.cyan)}33`, borderTop: `2px solid ${color||C.cyan}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
  );
}

export function SectionLabel({ children }) {
  return <div style={{ fontSize: '9px', color: C.textDim, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: "'Share Tech Mono',monospace", marginBottom: '10px' }}>{children}</div>;
}

export function Grid({ border, glow }) { return null; } // placeholder

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #020f08; color: #a0e8c0; font-family: 'Inter', sans-serif; min-height: 100vh; }
  input, textarea, select, button { font-family: inherit; }
  input:focus, textarea:focus, select:focus { outline: none; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #020f08; }
  ::-webkit-scrollbar-thumb { background: #0a3a20; border-radius: 2px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 8px #00F5FF33; } 50% { box-shadow: 0 0 24px #00F5FF66; } }
  @keyframes scanline { 0%,100% { left: -60%; } 100% { left: 120%; } }
  .fade-in { animation: fadeIn 0.3s ease; }
  a { color: inherit; text-decoration: none; }
`;
