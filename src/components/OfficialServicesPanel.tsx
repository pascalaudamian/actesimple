import React, { useMemo, useState } from 'react';
import { Building2, CheckCircle2, ExternalLink, FileText, Search, ShieldCheck, WalletCards } from 'lucide-react';
import { Procedure } from '../types.ts';
import { Language } from '../i18n/translations.ts';

interface OfficialServicesPanelProps {
  procedures: Procedure[];
  lang: Language;
  onSelectProcedure: (procedure: Procedure) => void;
  onOpenDossiers: () => void;
}

export const OfficialServicesPanel: React.FC<OfficialServicesPanelProps> = ({ procedures, lang, onSelectProcedure, onOpenDossiers }) => {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isRo = lang === 'ro';
  const services = useMemo(() => procedures.filter((procedure) => procedure.status === 'published' && procedure.sources?.length), [procedures]);
  const filtered = services.filter((procedure) => `${procedure.title} ${procedure.competent_authority} ${procedure.short_description}`.toLowerCase().includes(query.toLowerCase()));
  const selected = filtered.find((procedure) => procedure.id === selectedId) ?? filtered[0];
  const officialUrl = selected?.sources?.[0]?.url;

  return (
    <section className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700 mb-4"><ShieldCheck className="w-3.5 h-3.5" /> {isRo ? 'Catalog verificat editorial' : 'Editorially verified catalog'}</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">{isRo ? 'Servicii oficiale' : 'Official services'}</h1>
            <p className="mt-3 text-slate-600 leading-relaxed">{isRo ? 'Găsește procedura, pregătește-ți dosarul și continuă pe portalul instituției. ActeSimple oferă orientare, nu este un portal guvernamental.' : 'Find the procedure, prepare your dossier, and continue on the institution’s portal. ActeSimple provides guidance, not government submission.'}</p>
          </div>
          <button onClick={onOpenDossiers} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-800 hover:border-blue-400 hover:text-blue-700 transition"><WalletCards className="w-4 h-4 text-blue-600" /> {isRo ? 'Dosarele mele' : 'My dossiers'}</button>
        </div>

        <div className="relative max-w-xl mb-8"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isRo ? 'Ce procedură cauți?' : 'What procedure are you looking for?'} className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600" /></div>

        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
          <div className="space-y-3">{filtered.map((procedure) => <button key={procedure.id} onClick={() => setSelectedId(procedure.id)} className={`w-full text-left rounded-2xl border p-4 transition ${selected?.id === procedure.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300'}`}><span className="text-[11px] uppercase tracking-wider font-bold text-blue-700">{procedure.category}</span><h2 className="mt-1 font-bold text-slate-900 leading-snug">{procedure.title}</h2><p className="mt-1 text-xs text-slate-500 line-clamp-2">{procedure.short_description}</p></button>)}</div>
          {selected && <article className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Building2 className="w-4 h-4 text-blue-600" /> {selected.competent_authority}</div><h2 className="mt-3 text-2xl font-extrabold text-slate-950 leading-tight">{selected.title}</h2></div><span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700"><CheckCircle2 className="w-3 h-3" /> {isRo ? 'Verificat' : 'Verified'}</span></div>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">{selected.short_description} {isRo ? 'Depunerea are loc pe platforma oficială, dacă procedura permite acest lucru. ActeSimple nu confirmă depunerea.' : 'Submission takes place on the official platform where available. ActeSimple does not confirm submission.'}</p>
            <div className="grid sm:grid-cols-3 gap-3 mt-6"><div className="rounded-xl bg-slate-50 p-3"><span className="text-[11px] text-slate-500">{isRo ? 'Documente' : 'Documents'}</span><strong className="block mt-1 text-sm text-slate-900">{selected.documents.length} {isRo ? 'necesare' : 'required'}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="text-[11px] text-slate-500">{isRo ? 'Taxe' : 'Fees'}</span><strong className="block mt-1 text-sm text-slate-900">{selected.total_fee}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="text-[11px] text-slate-500">{isRo ? 'Ultima verificare' : 'Last checked'}</span><strong className="block mt-1 text-sm text-slate-900">{selected.last_verified_at}</strong></div></div>
            <div className="flex flex-wrap gap-3 mt-7"><button onClick={() => onSelectProcedure(selected)} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 text-white px-4 py-2.5 text-sm font-bold hover:bg-blue-800 transition"><FileText className="w-4 h-4" /> {isRo ? 'Vezi procedura' : 'View procedure'}</button><button onClick={() => onSelectProcedure(selected)} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 px-4 py-2.5 text-sm font-bold hover:bg-blue-100 transition">{isRo ? 'Pregătește documentele' : 'Prepare documents'}</button>{officialUrl && <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-slate-400 transition">{isRo ? 'Continuă pe portalul oficial' : 'Continue on official portal'} <ExternalLink className="w-4 h-4" /></a>}</div>
            <p className="mt-6 text-xs text-slate-500 border-t border-slate-100 pt-4">{isRo ? 'Sursa oficială este responsabilă pentru condițiile și rezultatul cererii.' : 'The official institution is responsible for requirements and application outcomes.'}</p>
          </article>}
        </div>
      </div>
    </section>
  );
};
