import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';
import { C, Btn, Tag, Spinner, SectionLabel } from '../components/UI.jsx';
import AppShell from '../components/AppShell.jsx';

const AGENTS = {
  max:     { name: 'MAX',     emoji: '🧠', color: '#00F5FF', tag: 'main',      role: 'Orchestrator · CEO Proxy' },
  vigor:   { name: 'VIGOR',   emoji: '📈', color: '#39FF14', tag: 'growth',    role: 'Growth · SEO · TrendScout' },
  fidus:   { name: 'FIDUS',   emoji: '⚙️', color: '#FF6B35', tag: 'ops',       role: 'Ops · Infra · DB · Cost' },
  optimo:  { name: 'OPTIMO',  emoji: '🔬', color: '#BF5FFF', tag: 'optimizer', role: 'CRO · A/B · Landing · Funnel' },
  mercury: { name: 'MERCURY', emoji: '📨', color: '#FFD700', tag: 'sales',     role: 'Sales · Cold Email · Outreach' },
};
const SUB_ORDER = ['vigor', 'fidus', 'optimo', 'mercury'];

function extractConfidence(text) {
  const m = text?.match(/confidence[^\n]*?(\d+)\s*\/\s*10/i);
  return m ? parseInt(m[1]) : null;
}

function ConfBar({ score, color }) {
  if (!score) return null;
  const c = score >= 8 ? C.green : score >= 6 ? C.gold : C.red;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '40px', height: '3px', background: '#0a2014', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${(score / 10) * 100}%`, height: '100%', background: c }} />
      </div>
      <span style={{ fontSize: '9px', color: c, fontFamily: "'Share Tech Mono',monospace" }}>{score}/10</span>
    </div>
  );
}

function MD({ text, color }) {
  if (!text) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: '4px' }} />;
        if (line.startsWith('## ')) return <h2 key={i} style={{ color, margin: '14px 0 4px', fontSize: '11px', fontFamily: "'Share Tech Mono',monospace", letterSpacing: '2px', textTransform: 'uppercase', borderBottom: `1px solid ${color}33`, paddingBottom: '3px' }}>{line.slice(3)}</h2>;
        if (line.match(/^\d+\.\s/)) {
          const num = line.match(/^(\d+)\./)[1];
          const rest = line.replace(/^\d+\.\s*/, '');
          const bm = rest.match(/^\*\*(.+?)\*\*\s*[-—]?\s*(.*)/s);
          return <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
            <span style={{ color, fontSize: '10px', minWidth: '14px', fontFamily: "'Share Tech Mono',monospace" }}>{num}.</span>
            <span style={{ color: '#90c4a8', fontSize: '12px', lineHeight: '1.6' }}>{bm ? <><strong style={{ color: '#d0ffe8' }}>{bm[1]}</strong>{bm[2] ? ` — ${bm[2]}` : ''}</> : rest}</span>
          </div>;
        }
        if (line.startsWith('- ')) {
          const rest = line.slice(2);
          const bm = rest.match(/^\*\*(.+?)\*\*\s*[-—]?\s*(.*)/s);
          return <div key={i} style={{ display: 'flex', gap: '7px' }}>
            <span style={{ color, fontSize: '8px', marginTop: '5px' }}>▶</span>
            <span style={{ color: '#90c4a8', fontSize: '12px', lineHeight: '1.6' }}>{bm ? <><strong style={{ color: '#d0ffe8' }}>{bm[1]}</strong>{bm[2] ? ` — ${bm[2]}` : ''}</> : rest}</span>
          </div>;
        }
        if (line.startsWith('```')) return null;
        const html = line.replace(/\*\*(.+?)\*\*/g, (_, m) => `<strong style="color:#d0ffe8">${m}</strong>`);
        return <p key={i} dangerouslySetInnerHTML={{ __html: html }} style={{ margin: 0, color: '#6a9e84', fontSize: '12px', lineHeight: '1.7' }} />;
      })}
    </div>
  );
}

function TermLog({ logs }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs]);
  return (
    <div ref={ref} style={{ background: '#000a04', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', height: '120px', overflowY: 'auto', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px' }}>
      {!logs.length && <span style={{ color: C.textMuted }}>▸ SYSTEM READY</span>}
      {logs.map((l, i) => (
        <div key={i} style={{ color: l.type === 'error' ? C.red : l.type === 'success' ? C.green : l.type === 'max' ? C.cyan : l.type === 'warn' ? C.gold : C.textDim, marginBottom: '2px' }}>
          <span style={{ color: C.textMuted }}>[{l.time}] </span>{l.msg}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const firstRun = location.state?.firstRun;
  const initUrl = location.state?.projectUrl || '';

  const [input, setInput] = useState(initUrl);
  const [urlStatus, setUrlStatus] = useState(null);
  const [sitePreview, setSitePreview] = useState(null);
  const [scanContent, setScanContent] = useState(null);
  const [activeAgent, setActiveAgent] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [allLoading, setAllLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [tokenCount, setTokenCount] = useState(0);
  const [usage, setUsage] = useState(null);
  const [trends, setTrends] = useState(null);
  const [abTests, setAbTests] = useState([]);
  const [newAB, setNewAB] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showSessionList, setShowSessionList] = useState(false);
  const [error, setError] = useState('');
  const outputRef = useRef(null);
  const debounce = useRef(null);

  const isUrl = /^https?:\/\//i.test(input.trim()) || /^www\./.test(input.trim());

  const addLog = useCallback((msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(p => [...p.slice(-60), { msg, type, time }]);
  }, []);

  useEffect(() => {
    api.usage().then(d => setUsage(d)).catch(() => {});
    api.getTrends().then(d => setTrends(d)).catch(() => {});
    api.getABTests().then(d => setAbTests(d.tests || [])).catch(() => {});
    api.getSessions().then(d => setSessions(d.sessions || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isUrl) { setScanContent(null); setSitePreview(null); setUrlStatus(null); return; }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => scanUrl(input.trim().startsWith('http') ? input.trim() : 'https://' + input.trim()), 800);
    return () => clearTimeout(debounce.current);
  }, [input, isUrl]);

  const scanUrl = async (url) => {
    setUrlStatus('fetching'); setScanContent(null); setSitePreview(null); setResponses({}); setActiveAgent(null);
    addLog(`Scanning: ${url}`, 'max');
    try {
      const d = await api.scan(url);
      setScanContent(d.content_summary);
      setSitePreview({ url, title: d.title, snippet: d.description, tech: d.tech_hints });
      setTokenCount(p => p + (d.tokens || 0));
      setUrlStatus('fetched');
      addLog(`✓ Target acquired: ${d.title}`, 'success');
    } catch (e) {
      setUrlStatus('failed');
      addLog('✗ Scan failed', 'error');
    }
  };

  const buildPrompt = useCallback(() => {
    const trendCtx = trends?.topics?.length ? `\n\nTRENDSCOUT FEED:\n${trends.topics.join('\n')}` : '';
    if (scanContent && sitePreview) return `PROJECT URL: ${sitePreview.url}\nTITLE: ${sitePreview.title}\nSTACK: ${sitePreview.tech}\nDESCRIPTION: ${sitePreview.snippet}\n\nCONTENT:\n${scanContent}${trendCtx}`;
    return input + trendCtx;
  }, [scanContent, sitePreview, input, trends]);

  const runAgent = async (agentId) => {
    setLoading(p => ({ ...p, [agentId]: true }));
    addLog(`${AGENTS[agentId].name} analyzing...`, agentId === 'max' ? 'max' : 'info');
    try {
      const { text, tokens } = await api.runAgent(agentId, buildPrompt());
      setTokenCount(p => p + (tokens || 0));
      setResponses(p => ({ ...p, [agentId]: text }));
      addLog(`✓ ${AGENTS[agentId].name} complete (${extractConfidence(text) ?? '??'}/10)`, 'success');
      return text;
    } catch (e) {
      if (e.upgradeRequired) { addLog(`⚠ ${AGENTS[agentId].name} requires upgrade`, 'warn'); setError('upgrade'); }
      else addLog(`✗ ${AGENTS[agentId].name} failed`, 'error');
      return null;
    } finally { setLoading(p => ({ ...p, [agentId]: false })); }
  };

  const handleAgentClick = async (agentId) => {
    if (!input.trim() && !scanContent) return;
    setActiveAgent(agentId);
    if (!responses[agentId]) await runAgent(agentId);
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  };

  const deployAll = async () => {
    if (!input.trim() && !scanContent) return;
    setAllLoading(true); setResponses({}); setError('');
    addLog('═══ MISSION START — COO ECOSYSTEM DEPLOYING ═══', 'max');
    const fresh = {};
    for (const id of SUB_ORDER) {
      setActiveAgent(id);
      const text = await runAgent(id);
      if (text) fresh[id] = text;
    }
    // MAX synthesis
    setActiveAgent('max');
    setLoading(p => ({ ...p, max: true }));
    addLog('MAX synthesizing all reports...', 'max');
    try {
      const subReports = SUB_ORDER.map(id => `\n\n=== ${AGENTS[id].name} ===\n${fresh[id] || '(no data)'}`).join('');
      const { text, tokens } = await api.runAgent('max', `${buildPrompt()}\n\nSUB-AGENT REPORTS:${subReports}\n\nSynthesize.`);
      fresh['max'] = text;
      setResponses(p => ({ ...p, max: text }));
      setTokenCount(p => p + (tokens || 0));
      addLog('✓ MAX executive brief complete', 'max');
    } catch (e) { addLog('✗ MAX synthesis failed', 'error'); }
    finally { setLoading(p => ({ ...p, max: false })); }

    // Save session
    try {
      await api.saveSession({ target: sitePreview?.url || input, siteTitle: sitePreview?.title, siteTech: sitePreview?.tech, responses: fresh, tokenCount });
      addLog('Session saved to memory', 'success');
      const d = await api.getSessions(); setSessions(d.sessions || []);
      const u = await api.usage(); setUsage(u);
      const t = await api.getTrends(); setTrends(t);
    } catch {}

    setAllLoading(false);
    addLog('═══ MISSION COMPLETE ═══', 'max');
  };

  const exportMD = () => {
    let md = `# BI-CLAW MISSION REPORT\nTarget: ${sitePreview?.url || input}\nGenerated: ${new Date().toLocaleString()}\n\n---\n\n`;
    Object.entries(AGENTS).forEach(([id, a]) => {
      if (responses[id]) md += `# ${a.emoji} ${a.name} — ${a.role}\n\n${responses[id]}\n\n---\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `biclaw-${Date.now()}.md`; a.click();
  };

  const loadSession = async (id) => {
    const { session } = await api.getSession(id);
    setResponses(session.responses || {});
    setSitePreview(session.site_title ? { url: session.target, title: session.site_title, tech: session.site_tech } : null);
    setInput(session.target);
    setActiveAgent('max');
    setShowSessionList(false);
    addLog(`Session loaded from ${new Date(session.created_at).toLocaleString()}`, 'success');
  };

  const addAB = async () => {
    if (!newAB.trim()) return;
    const t = await api.createABTest(newAB); setAbTests(p => [t, ...p]); setNewAB('');
  };

  const completedCount = Object.keys(responses).length;
  const curAgent = activeAgent ? AGENTS[activeAgent] : null;
  const curResponse = activeAgent ? responses[activeAgent] : null;
  const canDeploy = (input.trim() || scanContent) && !allLoading && urlStatus !== 'fetching';
  const costUsd = ((tokenCount / 1000) * 0.003).toFixed(4);

  return (
    <AppShell>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 60px', fontFamily: "'Inter',sans-serif" }}>

        {/* Welcome banner for new users */}
        {firstRun && (
          <div style={{ background: `${C.cyan}0a`, border: `1px solid ${C.cyan}33`, borderRadius: '10px', padding: '16px 20px', marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
            <div style={{ fontSize: '14px', color: C.cyan, fontWeight: '600', marginBottom: '4px' }}>👋 Welcome to BI-CLAW!</div>
            <div style={{ fontSize: '13px', color: C.textDim }}>Your dashboard is ready. Paste your website URL below and hit Deploy to run your first full audit.</div>
          </div>
        )}

        {/* Usage bar */}
        {usage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,10,5,0.8)', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '8px 14px', marginBottom: '14px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Tag color={C.cyan}>{usage.plan.toUpperCase()}</Tag>
              <span style={{ fontSize: '11px', color: C.textDim, fontFamily: "'Share Tech Mono',monospace" }}>{usage.auditsUsed}/{usage.auditsLimit === 999 ? '∞' : usage.auditsLimit} audits this month</span>
              <div style={{ width: '60px', height: '3px', background: '#0a2014', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((usage.auditsUsed / (usage.auditsLimit || 1)) * 100, 100)}%`, height: '100%', background: C.green }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: C.textMuted, fontFamily: "'Share Tech Mono',monospace" }}>💰 ${costUsd} session</span>
              {usage.plan === 'free' && <Btn small variant="gold" onClick={() => window.location.href = '/billing'}>⬆ Upgrade</Btn>}
            </div>
          </div>
        )}

        {/* Upgrade error */}
        {error === 'upgrade' && (
          <div style={{ background: `${C.gold}0a`, border: `1px solid ${C.gold}44`, borderRadius: '8px', padding: '12px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: C.gold }}>⚠ Some agents require a paid plan</span>
            <Btn small variant="gold" onClick={() => window.location.href = '/billing'}>View Plans →</Btn>
          </div>
        )}

        {/* Trends feed */}
        {trends?.topics?.length > 0 && (
          <div style={{ background: `${C.green}08`, border: `1px solid ${C.green}22`, borderRadius: '8px', padding: '8px 14px', marginBottom: '14px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '9px', color: C.green + '88', fontFamily: "'Share Tech Mono',monospace", letterSpacing: '1px', flexShrink: 0 }}>📡 TRENDSCOUT</span>
            <span style={{ fontSize: '9px', color: C.textMuted }}>Updated {new Date(trends.updatedAt).toLocaleDateString()}</span>
            {trends.topics.slice(0, 3).map((t, i) => <span key={i} style={{ fontSize: '9px', color: C.textDim, background: `${C.green}10`, padding: '2px 7px', borderRadius: '3px' }}>{t.replace(/^-\s*/, '').slice(0, 45)}</span>)}
          </div>
        )}

        {/* Input */}
        <div style={{ background: 'rgba(0,16,8,0.95)', border: `1px solid ${urlStatus === 'fetched' ? C.green + '55' : urlStatus === 'fetching' ? C.cyan + '55' : C.border}`, borderRadius: '10px', padding: '14px 18px', marginBottom: '12px', transition: 'border-color 0.3s' }}>
          <div style={{ fontSize: '9px', color: C.textMuted, letterSpacing: '2px', fontFamily: "'Share Tech Mono',monospace", marginBottom: '7px' }}>{isUrl ? '▶ TARGET URL' : '▶ MISSION BRIEF'}</div>
          <textarea value={input} onChange={e => { setInput(e.target.value); if (!/^https?:\/\//i.test(e.target.value)) { setResponses({}); setActiveAgent(null); } }} placeholder={'https://mybusiness.com\n\nor describe your business...'} rows={2} style={{ width: '100%', background: 'transparent', border: 'none', color: C.text, fontSize: '13px', fontFamily: "'Share Tech Mono',monospace", lineHeight: '1.5', resize: 'none' }} />
          {isUrl && urlStatus === 'fetching' && <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}><Spinner color={C.cyan} /><span style={{ fontSize: '10px', color: C.cyan, fontFamily: "'Share Tech Mono',monospace" }}>Scanning...</span></div>}
          {urlStatus === 'fetched' && sitePreview && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${C.border}`, animation: 'fadeIn 0.3s' }}>
              <div style={{ fontSize: '9px', color: C.green, letterSpacing: '2px', fontFamily: "'Share Tech Mono',monospace", marginBottom: '3px' }}>✓ TARGET ACQUIRED</div>
              <div style={{ fontSize: '13px', color: C.text, fontWeight: '600' }}>{sitePreview.title}</div>
              <div style={{ fontSize: '11px', color: C.textDim, marginTop: '2px' }}>{sitePreview.snippet}</div>
              {sitePreview.tech && <div style={{ fontSize: '9px', color: C.textMuted, marginTop: '3px', fontFamily: "'Share Tech Mono',monospace" }}>STACK: {sitePreview.tech}</div>}
            </div>
          )}
          {urlStatus === 'failed' && <div style={{ fontSize: '10px', color: C.red, marginTop: '8px' }}>⚠ Scan failed — proceeding with description</div>}
        </div>

        {/* Deploy */}
        <button onClick={deployAll} disabled={!canDeploy} style={{ width: '100%', padding: '15px', background: canDeploy ? `${C.cyan}0a` : '#050f08', border: `1px solid ${canDeploy ? C.cyan : C.border}`, borderRadius: '8px', color: canDeploy ? C.cyan : C.border, fontSize: '11px', fontFamily: "'Orbitron',sans-serif", fontWeight: '700', letterSpacing: '3px', cursor: canDeploy ? 'pointer' : 'not-allowed', transition: 'all 0.2s', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', animation: canDeploy ? 'glow 3s infinite' : 'none', textShadow: canDeploy ? `0 0 8px ${C.cyan}` : 'none' }}>
          {allLoading ? <><Spinner color={C.cyan} />SYSTEM ACTIVE — {completedCount}/5 REPORTING</> : completedCount === 5 ? <>✓ MISSION COMPLETE — RE-RUN</> : <>▶ DEPLOY FULL COO ECOSYSTEM</>}
        </button>

        {/* Architecture */}
        <div style={{ marginBottom: '20px' }}>
          {/* MAX */}
          <AgentCard agent={AGENTS.max} isActive={activeAgent === 'max'} isLoading={!!loading.max} hasResponse={!!responses.max} confidence={extractConfidence(responses.max)} onClick={() => handleAgentClick('max')} large />
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '4px 0' }}>
            {SUB_ORDER.map(id => <div key={id} style={{ width: '1px', height: '20px', background: `linear-gradient(${C.cyan}44,${AGENTS[id].color}66)` }} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
            {SUB_ORDER.map(id => <AgentCard key={id} agent={AGENTS[id]} isActive={activeAgent === id} isLoading={!!loading[id]} hasResponse={!!responses[id]} confidence={extractConfidence(responses[id])} onClick={() => handleAgentClick(id)} />)}
          </div>
        </div>

        {/* Progress */}
        {completedCount > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ height: '3px', background: '#0a2014', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(completedCount / 5) * 100}%`, background: `linear-gradient(90deg,${C.cyan},${C.green})`, transition: 'width 0.4s', boxShadow: `0 0 8px ${C.cyan}` }} />
            </div>
          </div>
        )}

        {/* Export + actions */}
        {completedCount > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', animation: 'fadeIn 0.3s' }}>
            <Btn small onClick={exportMD}>⬇ Export .MD</Btn>
            <Btn small onClick={() => window.print()} variant="green">🖨 PDF</Btn>
            <Btn small onClick={() => { navigator.clipboard.writeText(responses.max || ''); addLog('MAX report copied', 'success'); }} variant="ghost">📋 Copy MAX Report</Btn>
          </div>
        )}

        {/* Quick switch */}
        {completedCount > 1 && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {Object.entries(AGENTS).filter(([id]) => responses[id]).map(([id, a]) => (
              <button key={id} onClick={() => setActiveAgent(id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: activeAgent === id ? `${a.color}22` : 'transparent', border: `1px solid ${activeAgent === id ? a.color : C.border}`, borderRadius: '4px', cursor: 'pointer', transition: 'all 0.15s' }}>
                <span style={{ fontSize: '10px' }}>{a.emoji}</span>
                <span style={{ fontSize: '9px', color: activeAgent === id ? a.color : C.textDim, fontFamily: "'Share Tech Mono',monospace" }}>{a.name}</span>
                {extractConfidence(responses[id]) && <span style={{ fontSize: '8px', color: a.color + '88' }}>{extractConfidence(responses[id])}/10</span>}
              </button>
            ))}
          </div>
        )}

        {/* Response panel */}
        {activeAgent && (
          <div ref={outputRef} style={{ background: 'rgba(0,8,4,0.98)', border: `1px solid ${curAgent?.color}44`, borderRadius: '10px', overflow: 'hidden', animation: 'fadeIn 0.3s', marginBottom: '20px', boxShadow: `0 0 24px ${curAgent?.color}18` }}>
            <div style={{ background: `${curAgent?.color}0a`, borderBottom: `1px solid ${curAgent?.color}22`, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>{curAgent?.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '13px', fontWeight: '700', color: curAgent?.color, textShadow: `0 0 8px ${curAgent?.color}` }}>{curAgent?.name}</span>
                  {sitePreview && <span style={{ color: curAgent?.color + '55', fontSize: '10px' }}>· {sitePreview.title}</span>}
                </div>
                <div style={{ color: C.textMuted, fontSize: '9px', fontFamily: "'Share Tech Mono',monospace" }}>{curAgent?.role}</div>
              </div>
              {loading[activeAgent] ? <Spinner color={curAgent?.color} /> : curResponse && <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                <span style={{ color: curAgent?.color + '77', fontSize: '9px', fontFamily: "'Share Tech Mono',monospace" }}>✓ COMPLETE</span>
                <ConfBar score={extractConfidence(curResponse)} color={curAgent?.color} />
              </div>}
            </div>
            <div style={{ padding: '18px 20px', minHeight: '140px' }}>
              {loading[activeAgent] && !curResponse ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[90,65,80,50,70].map((w,i) => <div key={i} style={{ height: '10px', borderRadius: '2px', background: `${curAgent?.color}10`, width: `${w}%`, animation: `pulse 1.6s ${i*.1}s infinite` }} />)}
                </div>
              ) : curResponse ? <MD text={curResponse} color={curAgent?.color} /> : null}
            </div>
          </div>
        )}

        {/* A/B Tracker */}
        <details style={{ marginBottom: '14px' }}>
          <summary style={{ cursor: 'pointer', fontSize: '10px', color: C.purple, letterSpacing: '2px', fontFamily: "'Share Tech Mono',monospace", padding: '10px 14px', background: `${C.purple}08`, border: `1px solid ${C.purple}33`, borderRadius: '8px', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔬 A/B EXPERIMENT TRACKER ({abTests.length})
          </summary>
          <div style={{ background: 'rgba(0,8,4,0.9)', border: `1px solid ${C.border}`, borderRadius: '0 0 8px 8px', padding: '14px', borderTop: 'none' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input value={newAB} onChange={e => setNewAB(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAB()} placeholder="New experiment..." style={{ flex: 1, background: '#050f06', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '7px 10px', color: C.text, fontSize: '11px', fontFamily: "'Share Tech Mono',monospace" }} />
              <Btn small variant="ghost" onClick={addAB}>+ ADD</Btn>
            </div>
            {!abTests.length && <div style={{ fontSize: '11px', color: C.textMuted, textAlign: 'center', padding: '10px' }}>No experiments yet — OPTIMO will suggest tests above</div>}
            {abTests.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', background: '#050f06', borderRadius: '6px', marginBottom: '6px' }}>
                <span style={{ flex: 1, fontSize: '12px', color: C.text }}>{t.name}</span>
                <select value={t.status} onChange={async e => { await api.updateABTest(t.id, { status: e.target.value, notes: t.notes }); setAbTests(p => p.map(x => x.id === t.id ? { ...x, status: e.target.value } : x)); }} style={{ background: '#0a1a0a', border: `1px solid ${C.border}`, color: t.status === 'winner' ? C.green : t.status === 'failed' ? C.red : C.gold, fontSize: '9px', padding: '3px 6px', borderRadius: '4px', fontFamily: "'Share Tech Mono',monospace" }}>
                  <option value="running">RUNNING</option>
                  <option value="winner">WINNER</option>
                  <option value="failed">FAILED</option>
                  <option value="paused">PAUSED</option>
                </select>
                <button onClick={async () => { await api.deleteABTest(t.id); setAbTests(p => p.filter(x => x.id !== t.id)); }} style={{ background: 'none', border: 'none', color: C.red + '66', cursor: 'pointer', fontSize: '14px' }}>×</button>
              </div>
            ))}
          </div>
        </details>

        {/* Session history */}
        {sessions.length > 0 && (
          <details style={{ marginBottom: '14px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '10px', color: C.cyan, letterSpacing: '2px', fontFamily: "'Share Tech Mono',monospace", padding: '10px 14px', background: `${C.cyan}08`, border: `1px solid ${C.cyan}33`, borderRadius: '8px', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🗂 SESSION MEMORY ({sessions.length} audits)
            </summary>
            <div style={{ background: 'rgba(0,8,4,0.9)', border: `1px solid ${C.border}`, borderRadius: '0 0 8px 8px', borderTop: 'none', overflow: 'hidden' }}>
              {sessions.map(s => (
                <div key={s.id} onClick={() => loadSession(s.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = `${C.cyan}08`} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: C.text }}>{s.site_title || s.target}</div>
                    <div style={{ fontSize: '10px', color: C.textMuted }}>{new Date(s.created_at).toLocaleString()} · ${s.cost_usd?.toFixed(4) || '0.0000'}</div>
                  </div>
                  <span style={{ fontSize: '9px', color: C.cyan + '66', fontFamily: "'Share Tech Mono',monospace" }}>LOAD →</span>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Terminal */}
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel>⬛ OPERATIONS LOG</SectionLabel>
          <TermLog logs={logs} />
        </div>

        {/* Empty state */}
        {!activeAgent && !completedCount && (
          <div style={{ textAlign: 'center', padding: '30px', color: C.textMuted, fontFamily: "'Share Tech Mono',monospace" }}>
            {['▸ PASTE URL OR DESCRIBE YOUR BUSINESS', '▸ DEPLOY THE FULL COO ECOSYSTEM', '▸ MAX ORCHESTRATES · AGENTS EXECUTE'].map((t, i) => <div key={i} style={{ fontSize: '10px', letterSpacing: '2px', lineHeight: '2.5' }}>{t}</div>)}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ── Mini agent card ──
function AgentCard({ agent, isActive, isLoading, hasResponse, confidence, onClick, large }) {
  return (
    <div onClick={onClick} style={{ background: isActive ? `${agent.color}14` : 'rgba(0,10,5,0.9)', border: `1px solid ${isActive ? agent.color : hasResponse ? agent.color + '44' : C.border}`, borderRadius: '10px', padding: large ? '16px 18px' : '11px 14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: isActive ? `0 0 20px ${agent.color}33` : 'none', position: 'relative', overflow: 'hidden' }}>
      {isLoading && <div style={{ position: 'absolute', top: 0, left: '-60%', width: '60%', height: '2px', background: `linear-gradient(90deg,transparent,${agent.color},transparent)`, animation: 'scanline 1.2s ease-in-out infinite' }} />}
      <div style={{ position: 'absolute', top: 5, left: 5, width: 8, height: 8, borderTop: `1px solid ${agent.color}55`, borderLeft: `1px solid ${agent.color}55` }} />
      <div style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderTop: `1px solid ${agent.color}55`, borderRight: `1px solid ${agent.color}55` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span style={{ fontSize: large ? '22px' : '17px', flexShrink: 0 }}>{agent.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: large ? '14px' : '11px', fontWeight: '700', color: agent.color, letterSpacing: '2px', textShadow: isActive ? `0 0 8px ${agent.color}` : 'none' }}>{agent.name}</span>
            <Tag color={agent.color + '88'}>({agent.tag})</Tag>
            {isLoading && <span style={{ fontSize: '9px', color: agent.color, animation: 'blink 1s infinite', marginLeft: 'auto' }}>PROCESSING...</span>}
            {hasResponse && !isLoading && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: agent.color, boxShadow: `0 0 5px ${agent.color}`, marginLeft: 'auto' }} />}
          </div>
          <div style={{ fontSize: '9px', color: C.textDim, marginTop: '1px', fontFamily: "'Share Tech Mono',monospace" }}>{agent.role}</div>
          {confidence && <div style={{ marginTop: '5px' }}><ConfBar score={confidence} color={agent.color} /></div>}
        </div>
      </div>
    </div>
  );
}

function ConfBar({ score, color }) {
  if (!score) return null;
  const c = score >= 8 ? C.green : score >= 6 ? C.gold : C.red;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '36px', height: '3px', background: '#0a2014', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${(score / 10) * 100}%`, height: '100%', background: c }} />
      </div>
      <span style={{ fontSize: '9px', color: c, fontFamily: "'Share Tech Mono',monospace" }}>{score}/10</span>
    </div>
  );
}
