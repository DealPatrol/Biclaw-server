import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';
import { C, Btn, Input, Card, SectionLabel, Tag } from '../components/UI.jsx';
import AppShell from '../components/AppShell.jsx';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.company || '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const { user: updated } = await api.updateProfile({ name, company });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.error || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <AppShell>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 20px', fontFamily: "'Inter',sans-serif" }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', color: '#fff', fontFamily: "'Orbitron',sans-serif", letterSpacing: '2px', marginBottom: '6px' }}>Settings</h1>
          <p style={{ fontSize: '13px', color: C.textDim }}>Manage your account details</p>
        </div>

        {/* Profile */}
        <Card style={{ marginBottom: '20px' }}>
          <SectionLabel>Profile</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
            <Input label="Company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc." />
            <div>
              <div style={{ fontSize: '10px', color: C.textDim, letterSpacing: '2px', fontFamily: "'Share Tech Mono',monospace", marginBottom: '6px', textTransform: 'uppercase' }}>Email</div>
              <div style={{ fontSize: '13px', color: C.textMuted, padding: '10px 14px', background: '#050f06', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: "'Share Tech Mono',monospace" }}>{user?.email}</div>
              <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '4px' }}>Email cannot be changed</div>
            </div>
            {error && <div style={{ fontSize: '12px', color: C.red }}>{error}</div>}
            {saved && <div style={{ fontSize: '12px', color: C.green, fontFamily: "'Share Tech Mono',monospace" }}>✓ Saved successfully</div>}
            <Btn onClick={save} disabled={saving || !name.trim()}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Btn>
          </div>
        </Card>

        {/* Account info */}
        <Card style={{ marginBottom: '20px' }}>
          <SectionLabel>Account</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              ['Plan', <Tag color={C.cyan}>{user?.plan?.toUpperCase()}</Tag>],
              ['Member since', new Date(user?.created_at).toLocaleDateString()],
              ['User ID', `#${user?.id}`],
            ].map(([label, val], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ fontSize: '12px', color: C.textDim }}>{label}</span>
                <span style={{ fontSize: '12px', color: C.text, fontFamily: "'Share Tech Mono',monospace" }}>{val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Danger zone */}
        <Card style={{ border: `1px solid ${C.red}33` }}>
          <SectionLabel>Danger Zone</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#fff', marginBottom: '3px' }}>Sign out of all devices</div>
              <div style={{ fontSize: '12px', color: C.textDim }}>Clears your session on this device</div>
            </div>
            <Btn variant="danger" small onClick={logout}>Sign Out</Btn>
          </div>
        </Card>

      </div>
    </AppShell>
  );
}
