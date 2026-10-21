import React from 'react';
import { Search, ShieldCheck, CheckCircle2, Clock, Sparkles, Compass, ChevronRight } from 'lucide-react';
import { Language, translations } from '../i18n/translations.ts';

interface HeroSearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectTag: (term: string) => void;
  onOpenWizard: () => void;
  totalProcedures: number;
  lang: Language;
}

const POPULAR_TAGS_RO = [
  { label: 'Carte de identitate', query: 'carte identitate' },
  { label: 'Pașaport electronic', query: 'pasaport' },
  { label: 'Rezidență UE / IGI', query: 'rezidenta' },
  { label: 'Permis de ședere', query: 'permis de sedere' },
  { label: 'Viza Tip D', query: 'viza' },
  { label: 'NIF la ANAF', query: 'nif' },
  { label: 'Înmatriculare auto', query: 'inmatriculare' },
  { label: 'Cazier judiciar', query: 'cazier' },
];

const POPULAR_TAGS_EN = [
  { label: 'EU Residence Certificate', query: 'rezidenta' },
  { label: 'Single Work Permit (IGI)', query: 'permis de sedere' },
  { label: 'Long-Stay Visa (Type D)', query: 'viza' },
  { label: 'Romanian Tax ID (NIF)', query: 'nif' },
  { label: 'Family Member Card', query: 'membru familie' },
  { label: 'Health Insurance (CAS)', query: 'sanatate' },
  { label: 'ID Card (Buletin)', query: 'carte identitate' },
  { label: 'Criminal Record Check', query: 'cazier' },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  setSearchQuery,
  onSelectTag,
  onOpenWizard,
  totalProcedures,
  lang,
}) => {
  const t = translations[lang];
  const tags = lang === 'en' ? POPULAR_TAGS_EN : POPULAR_TAGS_RO;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white pt-8 pb-10 border-b border-slate-200">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-400/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Romanian Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-4 border border-blue-200 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>{t.heroBadge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t.heroTitleLine1} <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
            {t.heroTitleLine2}
          </span>
        </h1>

        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          {t.heroSubtitle}
        </p>

        {/* Big Search Input */}
        <div className="mt-6 sm:mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-lg shadow-blue-900/5 rounded-2xl bg-white border border-slate-200 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition">
            <Search className="w-5 h-5 text-slate-400 ml-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.heroSearchPlaceholder}
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
            <span className="text-slate-500 font-medium">{t.popularProceduresLabel}</span>
            {tags.map((tag) => (
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

        {/* Orientation Assistant Highlight Card / Banner */}
        <div className="mt-6 max-w-2xl mx-auto">
          <button
            onClick={onOpenWizard}
            className="w-full group text-left p-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white shadow-lg shadow-blue-700/15 hover:shadow-xl hover:shadow-blue-700/25 transition border border-blue-600/30 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 border border-white/20 transition">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    {lang === 'ro' ? 'Modul Nou' : 'New Module'}
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-100 transition">
                  {t.startWizardCta}
                </h3>
                <p className="text-xs text-blue-200 line-clamp-1 mt-0.5">
                  {t.startWizardSub}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 group-hover:bg-white/20 text-white text-xs font-semibold transition border border-white/10">
              <span className="hidden sm:inline">{lang === 'ro' ? 'Lansează' : 'Launch'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </div>
          </button>
        </div>

        {/* Feature benefits */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 max-w-2xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs sm:text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t.badgeChecklist}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{t.badgeFees}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{t.badgeFree}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
