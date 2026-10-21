import React from 'react';
import { Search, ShieldCheck, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface HeroSearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectTag: (term: string) => void;
  totalProcedures: number;
}

const POPULAR_TAGS = [
  { label: 'Carte de identitate', query: 'carte identitate' },
  { label: 'Pașaport electronic', query: 'pasaport' },
  { label: 'Înmatriculare auto', query: 'inmatriculare' },
  { label: 'Înființare SRL', query: 'srl' },
  { label: 'Cazier judiciar', query: 'cazier' },
  { label: 'Permis conducere', query: 'permis' },
  { label: 'Viza de flotant', query: 'flotant' },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  setSearchQuery,
  onSelectTag,
  totalProcedures,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white pt-8 pb-10 border-b border-slate-200">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-400/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Romanian Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-4 border border-blue-200 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>Informații verificate conform legislației din România 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Toate actele și pașii necesari. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
            Fără drumuri inutile la ghișeu.
          </span>
        </h1>

        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Află exact ce documente îți trebuie, unde mergi, cât costă și bifează-le direct în checklistul tău personal, fără cont.
        </p>

        {/* Big Search Input */}
        <div className="mt-6 sm:mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-lg shadow-blue-900/5 rounded-2xl bg-white border border-slate-200 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition">
            <Search className="w-5 h-5 text-slate-400 ml-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută o procedură sau un document (ex: buletin, pașaport, talon, contract, cazier)..."
              className="w-full py-4 pl-3 pr-12 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none rounded-2xl"
              autoFocus={false}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full hover:bg-slate-100 transition"
                aria-label="Șterge căutarea"
              >
                ✕
              </button>
            )}
          </div>

          {/* Popular Search Pills */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
            <span className="text-slate-500 font-medium">Proceduri populare:</span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag.query}
                onClick={() => onSelectTag(tag.query)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-medium transition shadow-2xs"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature benefits */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 max-w-2xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs sm:text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Checklist interactiv salvat pe telefon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Actualizat cu tarifele oficiale 2026</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>100% gratuit &amp; fără înregistrare</span>
          </div>
        </div>

      </div>
    </section>
  );
};
