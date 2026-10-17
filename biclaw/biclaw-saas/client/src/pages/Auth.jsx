import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { C, Btn, Input, Card } from '../components/UI.jsx';

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(${C.border}18 1px,transparent 1px),linear-gradient(90deg,${C.border}18 1px,transparent 1px)`, backgroundSize: '50px 50px', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '24px', fontWeight: '900', color: C.cyan, letterSpacing: '4px', textShadow: `0 0 20px ${C.cyan}88`, marginBottom: '8px' }}>BI-CLAW</div>
          <h1 style={{ fontSize: '20px', color: '#fff', fontWeight: '600', marginBottom: '6px' }}>{title}</h1>
          <p style={{ fontSize: '13px', color: C.textDim }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      await login(email, password);
      nav('/dashboard');
    } catch (e) {
      setError(e.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your BI-CLAW dashboard">
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" error={error} />
        <Btn full onClick={submit} disabled={loading || !email || !password}>
          {loading ? 'Signing in...' : '→ Sign In'}
        </Btn>
        <div style={{ textAlign: 'center', fontSize: '12px', color: C.textDim }}>
          No account? <Link to="/register" style={{ color: C.cyan }}>Create one free →</Link>
        </div>
      </Card>
    </AuthLayout>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.company);
      nav('/onboarding');
    } catch (e) {
      setError(e.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const valid = form.name && form.email && form.password.length >= 8;

  return (
    <AuthLayout title="Create your account" subtitle="Free to start — no credit card required">
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input label="Your Name" value={form.name} onChange={set('name')} placeholder="Jane Smith" />
        <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="8+ characters" />
        <Input label="Company (optional)" value={form.company} onChange={set('company')} placeholder="Acme Inc." />
        {error && <div style={{ fontSize: '12px', color: C.red }}>{error}</div>}
        <Btn full onClick={submit} disabled={loading || !valid}>
          {loading ? 'Creating account...' : '▶ Create Free Account'}
        </Btn>
        <div style={{ textAlign: 'center', fontSize: '12px', color: C.textDim }}>
          Already have an account? <Link to="/login" style={{ color: C.cyan }}>Sign in →</Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
