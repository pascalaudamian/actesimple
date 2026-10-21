import React from 'react';
import { FileCheck, Bookmark, Settings, Search, Compass, Globe } from 'lucide-react';
import { Language, translations } from '../i18n/translations.ts';

interface NavbarProps {
  lang: Language;
  onToggleLang: (newLang: Language) => void;
  onGoHome: () => void;
  onOpenAdmin: () => void;
  onOpenSaved: () => void;
  onOpenWizard: () => void;
  savedCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAdminActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onGoHome,
  onOpenAdmin,
  onOpenSaved,
  onOpenWizard,
  savedCount,
  searchQuery,
  setSearchQuery,
  isAdminActive,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={onGoHome}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Acte<span className="text-blue-700">Simple</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {lang.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none hidden sm:block">
                {t.brandSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Search in header */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher */}
            <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => onToggleLang('ro')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  lang === 'ro'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Comută în limba Română"
              >
                🇷🇴 RO
              </button>
              <button
                onClick={() => onToggleLang('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  lang === 'en'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                🇬🇧 EN
              </button>
            </div>

            {/* Orientation Assistant CTA */}
            <button
              onClick={onOpenWizard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100/90 border border-blue-200 transition"
              title={lang === 'ro' ? 'Asistent de orientare pentru cetățeni străini' : 'Orientation assistant for foreign citizens'}
            >
              <Compass className="w-4 h-4 text-blue-700" />
              <span className="hidden lg:inline">{t.startWizardCta.split('(')[0].trim()}</span>
              <span className="lg:hidden">{lang === 'ro' ? 'Asistent' : 'Assistant'}</span>
            </button>

            {/* My Checklists */}
            <button
              onClick={onOpenSaved}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 transition border border-slate-200"
              title={t.myDossiers}
            >
              <Bookmark className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">{t.myDossiers}</span>
              {savedCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-bold text-white bg-blue-600 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Admin toggle */}
            <button
              onClick={onOpenAdmin}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition border ${
                isAdminActive
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'text-slate-700 bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 border-amber-200'
              }`}
            >
              <Settings className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">{t.adminPanel}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
