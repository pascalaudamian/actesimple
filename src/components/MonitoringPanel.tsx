import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Clock3, ExternalLink, Radar, ShieldCheck, X } from 'lucide-react';
import type { Procedure } from '../types.ts';
import type { MonitoringChange } from '../server/monitoring.ts';
const OFFICIAL_MONITOR_TARGETS = [
  { id: 'igi', institution: 'IGI', url: 'https://igi.mai.gov.ro', cadenceHours: 24 },
  { id: 'mae', institution: 'MAE', url: 'https://evisa.mae.ro', cadenceHours: 24 },
  { id: 'anaf', institution: 'ANAF', url: 'https://www.anaf.ro', cadenceHours: 24 },
  { id: 'roepas', institution: 'ROePAS', url: 'https://www.roe-pas.ro', cadenceHours: 24 },
];
import { monitoringApi } from '../services/monitoringApi.ts';

export const MonitoringPanel: React.FC<{ procedures: Procedure[] }> = ({ procedures }) => {
  const [changes, setChanges] = useState<MonitoringChange[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const refresh = async () => setChanges(await monitoringApi.getChanges());
  useEffect(() => { refresh().catch(() => undefined); }, []);
  const scan = async () => { setBusy(true); setMessage(''); try { setChanges(await monitoringApi.runScan(procedures)); setMessage('Scanarea s-a încheiat. Toate diferențele sunt în așteptarea revizuirii.'); } catch (error) { setMessage(error instanceof Error ? error.message : 'Scanare eșuată.'); } finally { setBusy(false); } };
  const review = async (id: string, decision: 'approve' | 'reject') => { setBusy(true); try { const updated = await monitoringApi.review(id, decision); setChanges((items) => items.map((item) => item.id === updated.id ? updated : item)); } finally { setBusy(false); } };
  return <section className="mb-8 rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-xl">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><div className="mb-2 flex items-center gap-2 text-cyan-300"><Radar className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Motor automat de monitorizare</span></div><h2 className="text-2xl font-black tracking-tight">Surse oficiale, diferențe explicate, control editorial</h2><p className="mt-2 max-w-3xl text-sm text-slate-300">Verificarea detectează schimbări, dar nu publică automat taxe, termene, eligibilitate sau norme juridice.</p></div>
      <button onClick={scan} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"><Radar className="h-4 w-4" />{busy ? 'Se verifică...' : 'Rulează verificarea'}</button>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-4">{OFFICIAL_MONITOR_TARGETS.map((target) => <a key={target.id} href={target.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10"><div className="flex items-center justify-between"><span className="font-bold">{target.institution}</span><ExternalLink className="h-3.5 w-3.5 text-cyan-300" /></div><span className="mt-1 block text-[11px] text-slate-400">Verificare la {target.cadenceHours}h</span></a>)}</div>
    {message && <div className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3 text-sm text-cyan-100">{message}</div>}
    <div className="mt-5 space-y-3">{changes.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-slate-400">Nu există diferențe detectate. Pornește o verificare pentru a compara sursele.</div> : changes.map((change) => <article key={change.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-amber-400/15 px-2 py-1 text-[11px] font-bold text-amber-200">{change.kind === 'tax' ? 'TAXĂ' : change.kind === 'term' ? 'TERMEN' : 'TEXT'}</span><span className="text-xs text-slate-400">{change.institution} · {change.procedureTitle}</span></div><p className="mt-2 text-sm font-semibold">{change.summary}</p><p className="mt-1 text-xs text-slate-400">{change.previousValue} → {change.proposedValue}</p></div><div className="flex items-center gap-2 text-xs text-slate-400">{change.risk === 'high' ? <AlertTriangle className="h-4 w-4 text-amber-300" /> : <ShieldCheck className="h-4 w-4 text-emerald-300" />}{change.status === 'detected' ? 'Necesită aprobare' : change.status === 'approved' ? 'Aprobat' : 'Respins'}</div></div>{change.status === 'detected' && <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => review(change.id, 'approve')} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white"><Check className="h-3.5 w-3.5" />Înregistrează aprobarea editorială</button><button onClick={() => review(change.id, 'reject')} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-slate-200"><X className="h-3.5 w-3.5" />Respinge</button></div>}</article>)}</div>
    <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400"><Clock3 className="h-3.5 w-3.5" />Jurnalul păstrează detectarea și decizia editorială pentru audit.</div>
  </section>;
};
