import React, { useState, useEffect, useMemo } from 'react';
import { Procedure, CategoryId, CategoryMeta, ApplicantProfile } from './types.ts';
import { Language, translations } from './i18n/translations.ts';
import { api } from './services/api.ts';
import { getAllSavedUserChecklists } from './hooks/useChecklist.ts';
import { CATEGORIES } from './data/seedProcedures.ts';
import { Navbar } from './components/Navbar.tsx';
import { HeroSearch } from './components/HeroSearch.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { ProcedureCard } from './components/ProcedureCard.tsx';
import { ProcedureDetail } from './components/ProcedureDetail.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { SavedChecklistsModal } from './components/SavedChecklistsModal.tsx';
import { OrientationWizard } from './components/OrientationWizard.tsx';
import { Footer } from './components/Footer.tsx';
import {
  Sparkles,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  Globe,
  ShieldCheck,
  Compass,
  Users,
} from 'lucide-react';

function normalizeSearch(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ş/g, 's')
    .replace(/ţ/g, 't')
    .trim();
}

const FRONTEND_SYNONYMS: Record<string, string[]> = {
  buletin: ['carte de identitate', 'buletin expirat', 'ci', 'spclep'],
  talon: ['certificat de inmatriculare', 'inmatriculare auto', 'civ', 'dgpci'],
  cazier: ['certificat de cazier judiciar', 'cazier online', 'hub mai'],
  firma: ['infiintare srl', 'srl', 'onrc', 'act constitutiv'],
  flotant: ['viza de flotant', 'stabilire resedinta', 'chirie'],
  permis: ['permis de conducere', 'carnet', 'fisa auto'],
  alocatie: ['alocatia de stat', 'copii', 'nou nascut'],
  rezidenta: ['certificat de inregistrare', 'permis de sedere', 'igi', 'residence certificate', 'residence permit'],
  sedere: ['permis de sedere', 'viza', 'igi', 'drept de sedere'],
  viza: ['viza tip d', 'eviza mae', 'viza de munca', 'visa'],
  straini: ['cetateni ue', 'non-ue', 'igi', 'permis de sedere', 'nif', 'foreign citizens'],
  nif: ['numar de identificare fiscala', 'anaf', 'cod fiscal nerezidenti', 'tax id'],
  imigrari: ['igi', 'inspectoratul general pentru imigrari', 'permis de sedere'],
  apostila: ['transcriere certificate', 'apostila de la haga', 'legalizare'],
  transcriere: ['certificat de nastere strainatate', 'casatorie strainatate', 'stare civila'],
  asigurare: ['cas', 'cnas', 'asigurare de sanatate', 'cass', 'medic de familie'],
};

// Initial language detection from URL query or localStorage
function getInitialLanguage(): Language {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam === 'en' || langParam === 'ro') {
      return langParam;
    }
    const pathname = window.location.pathname;
    if (pathname.startsWith('/en')) return 'en';
    if (pathname.startsWith('/ro')) return 'ro';

    const stored = localStorage.getItem('actesimple_lang');
    if (stored === 'en' || stored === 'ro') {
      return stored;
    }
  } catch (e) {
    console.warn('Language initialization warning:', e);
  }
  return 'ro';
}

export default function App() {
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  const t = translations[lang];

  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>(CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('toate');
  const [selectedProfile, setSelectedProfile] = useState<ApplicantProfile>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [onlineOnly, setOnlineOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isSavedOpen, setIsSavedOpen] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Saved user progress in localStorage
  const [savedChecklists, setSavedChecklists] = useState<
    Array<{ procedureId: string; checkedDocsCount: number; lastUpdated: string }>
  >([]);

  // Toggle language with URL synchronization
  const handleToggleLang = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('actesimple_lang', newLang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLang);
      window.history.replaceState({}, '', url.toString());
      document.documentElement.lang = newLang;
    } catch (e) {
      console.warn('URL sync error:', e);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [procs, cats] = await Promise.all([
        api.getProcedures(),
        api.getCategories(),
      ]);
      setProcedures(procs);
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
      setSavedChecklists(getAllSavedUserChecklists());
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(lang === 'ro' ? 'Nu am putut încărca datele din server. Folosim datele locale.' : 'Failed to fetch server data. Using local cache.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    document.documentElement.lang = lang;
  }, []);

  // Sync hash with selected procedure
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const found = procedures.find((p) => p.slug === hash || p.id === hash);
        if (found) {
          setSelectedProcedure(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        setSelectedProcedure(null);
      }
    };

    if (procedures.length > 0) {
      handleHash();
    }

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [procedures]);

  // Keep saved checklists count fresh
  useEffect(() => {
    const refreshSaved = () => {
      setSavedChecklists(getAllSavedUserChecklists());
    };
    window.addEventListener('storage', refreshSaved);
    const interval = setInterval(refreshSaved, 4000);
    return () => {
      window.removeEventListener('storage', refreshSaved);
      clearInterval(interval);
    };
  }, []);

  const handleSelectProcedure = (p: Procedure) => {
    setSelectedProcedure(p);
    window.location.hash = p.slug || p.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedProcedure(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered procedures with diacritics removal, bilingual support, profiles and synonyms
  const filteredProcedures = useMemo(() => {
    let list = procedures;

    if (selectedCategory !== 'toate') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (selectedProfile !== 'all') {
      list = list.filter((p) => {
        if (!p.target_profiles || p.target_profiles.length === 0) {
          return selectedProfile === 'romanian';
        }
        return p.target_profiles.includes(selectedProfile);
      });
    }

    if (selectedDifficulty !== 'all') {
      list = list.filter((p) => p.difficulty === selectedDifficulty);
    }

    if (onlineOnly) {
      list = list.filter((p) => p.is_online_available === true);
    }

    if (searchQuery.trim().length > 0) {
      const normQ = normalizeSearch(searchQuery);

      // Expand synonyms
      const terms = new Set<string>([normQ]);
      for (const [key, syns] of Object.entries(FRONTEND_SYNONYMS)) {
        const normKey = normalizeSearch(key);
        if (normQ.includes(normKey) || normKey.includes(normQ)) {
          syns.forEach((s) => terms.add(normalizeSearch(s)));
        }
      }

      list = list.filter((p) => {
        const titleNorm = normalizeSearch(p.title + ' ' + (p.title_en || ''));
        const descNorm = normalizeSearch(
          p.short_description +
            ' ' +
            (p.short_description_en || '') +
            ' ' +
            p.full_description +
            ' ' +
            (p.full_description_en || '')
        );
        const authNorm = normalizeSearch((p.competent_authority || '') + ' ' + (p.competent_authority_en || ''));
        const kwNorm = (p.keywords || []).map((k) => normalizeSearch(k));
        const synNorm = (p.synonyms || []).map((s) => normalizeSearch(s));
        const docNorm = (p.documents || []).map((d) =>
          normalizeSearch(d.name + ' ' + (d.name_en || '') + ' ' + d.description)
        );

        for (const term of terms) {
          if (
            titleNorm.includes(term) ||
            descNorm.includes(term) ||
            authNorm.includes(term) ||
            kwNorm.some((k) => k.includes(term)) ||
            synNorm.some((s) => s.includes(term)) ||
            docNorm.some((d) => d.includes(term))
          ) {
            return true;
          }
        }
        return false;
      });
    }

    return list;
  }, [procedures, selectedCategory, selectedProfile, selectedDifficulty, onlineOnly, searchQuery]);

  // Popular procedures for the top highlight
  const popularProcedures = useMemo(() => {
    return procedures.filter((p) => p.is_popular);
  }, [procedures]);

  // Recently verified procedures
  const recentlyVerifiedProcedures = useMemo(() => {
    return [...procedures]
      .sort((a, b) => b.last_verified_at.localeCompare(a.last_verified_at))
      .slice(0, 4);
  }, [procedures]);

  // Progress mapping for each procedure
  const getProcedureProgress = (procId: string) => {
    const item = savedChecklists.find((s) => s.procedureId === procId);
    if (!item) return undefined;
    const proc = procedures.find((p) => p.id === procId);
    const total = proc?.documents?.length || 1;
    return {
      checked: item.checkedDocsCount,
      total,
      percentage: Math.min(100, Math.round((item.checkedDocsCount / total) * 100)),
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Navbar with RO/EN Switcher and Assistant button */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        onGoHome={handleBackToHome}
        onOpenAdmin={() => setIsAdminOpen(!isAdminOpen)}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
        savedCount={savedChecklists.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdminActive={isAdminOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* If Admin Mode is active */}
        {isAdminOpen ? (
          <AdminPanel
            procedures={procedures}
            onRefresh={loadData}
            onClose={() => setIsAdminOpen(false)}
          />
        ) : selectedProcedure ? (
          /* Detailed Guide View */
          <ProcedureDetail
            procedure={selectedProcedure}
            lang={lang}
            onBack={handleBackToHome}
            onCategoryClick={(catId) => {
              setSelectedCategory(catId as CategoryId);
              handleBackToHome();
            }}
          />
        ) : (
          /* Home Portal View */
          <div>
            {/* Hero & Central Search with Orientation Assistant Banner */}
            <HeroSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectTag={(term) => setSearchQuery(term)}
              onOpenWizard={() => setIsWizardOpen(true)}
              totalProcedures={procedures.length}
              lang={lang}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              
              {/* Category Filter Pills */}
              <div className="mb-6">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    {t.categoriesTitle}
                  </h2>
                  {(searchQuery || selectedCategory !== 'toate' || selectedProfile !== 'all' || selectedDifficulty !== 'all' || onlineOnly) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('toate');
                        setSelectedProfile('all');
                        setSelectedDifficulty('all');
                        setOnlineOnly(false);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      {t.resetAllFilters}
                    </button>
                  )}
                </div>

                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => setSelectedCategory(cat)}
                  lang={lang}
                />
              </div>

              {/* Secondary Filters Bar: Applicant Profile, Difficulty & Online Service Toggle */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs mb-8 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.filterLabel}</span>
                  </span>

                  {/* Applicant Profile Selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 ml-1 font-medium">{t.filterProfile}</span>
                    <select
                      value={selectedProfile}
                      onChange={(e) => setSelectedProfile(e.target.value as ApplicantProfile)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="all">{t.filterProfileAll}</option>
                      <option value="romanian">{t.filterProfileRo}</option>
                      <option value="eu_eea_ch">{t.filterProfileEu}</option>
                      <option value="non_eu">{t.filterProfileNonEu}</option>
                      <option value="family_member">{t.filterProfileFamily}</option>
                    </select>
                  </div>

                  {/* Online only toggle */}
                  <button
                    onClick={() => setOnlineOnly(!onlineOnly)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition border ${
                      onlineOnly
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{t.filterOnlineOnly}</span>
                  </button>

                  {/* Difficulty selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 ml-1 font-medium">{t.filterDifficulty}</span>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="all">{t.filterAll}</option>
                      <option value="usor">{t.filterEasy}</option>
                      <option value="mediu">{t.filterMedium}</option>
                      <option value="complex">{t.filterComplex}</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {filteredProcedures.length} {t.proceduresFound}
                </div>
              </div>

              {/* Notice if loading or offline */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-sm font-medium">
                    {lang === 'ro' ? 'Se încarcă catalogul oficial...' : 'Loading official catalog...'}
                  </span>
                </div>
              )}

              {/* Popular Procedures Section (shown when on 'toate' without search query and no custom profile) */}
              {!searchQuery && selectedCategory === 'toate' && selectedProfile === 'all' && selectedDifficulty === 'all' && !onlineOnly && popularProcedures.length > 0 && (
                <section className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {t.popularSectionTitle}
                    </h2>
                    <span className="text-xs text-slate-500 font-medium ml-1">
                      {t.popularSectionSub}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {popularProcedures.map((proc) => (
                      <ProcedureCard
                        key={proc.id}
                        procedure={proc}
                        onSelect={handleSelectProcedure}
                        lang={lang}
                        userProgress={getProcedureProgress(proc.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Catalog of Filtered Procedures */}
              <section>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-700" />
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {searchQuery
                        ? `${lang === 'ro' ? 'Rezultate căutare' : 'Search results'}: "${searchQuery}"`
                        : selectedCategory === 'toate'
                        ? t.allProceduresTitle
                        : `${lang === 'ro' ? 'Proceduri' : 'Procedures'}: ${categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}`}
                    </h2>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {filteredProcedures.length} {filteredProcedures.length === 1 ? (lang === 'ro' ? 'ghid' : 'guide') : (lang === 'ro' ? 'ghiduri' : 'guides')}
                  </span>
                </div>

                {/* Grid */}
                {filteredProcedures.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProcedures.map((proc) => (
                      <ProcedureCard
                        key={proc.id}
                        procedure={proc}
                        onSelect={handleSelectProcedure}
                        lang={lang}
                        userProgress={getProcedureProgress(proc.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800">
                      {t.noResultsTitle}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                      {t.noResultsDesc}
                    </p>
                    <div className="mt-5">
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('toate');
                          setSelectedProfile('all');
                          setSelectedDifficulty('all');
                          setOnlineOnly(false);
                        }}
                        className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition"
                      >
                        {t.resetFiltersBtn}
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Recently Verified Procedures Section */}
              {!searchQuery && selectedCategory === 'toate' && selectedProfile === 'all' && (
                <section className="mt-16 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {t.recentlyVerifiedTitle}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-6">
                    {t.recentlyVerifiedSub}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    {recentlyVerifiedProcedures.map((proc) => {
                      const itemTitle = lang === 'en' && proc.title_en ? proc.title_en : proc.title;
                      const itemFee = lang === 'en' && proc.total_fee_en ? proc.total_fee_en : proc.total_fee;

                      return (
                        <div
                          key={proc.id}
                          onClick={() => handleSelectProcedure(proc)}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition cursor-pointer"
                        >
                          <span className="text-[10px] uppercase font-bold text-blue-700">
                            {proc.category}
                          </span>
                          <h4 className="font-bold text-slate-900 mt-1 line-clamp-1">
                            {itemTitle}
                          </h4>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>{proc.last_verified_at}</span>
                            </span>
                            <span className="font-bold text-slate-800">{itemFee}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Informative Civic Banner & Legal Disclaimer */}
              <section className="mt-12 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold mb-4 border border-blue-700/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                    <span>{lang === 'ro' ? 'Transparență & Responsabilitate Civică' : 'Civic Transparency & Reliability'}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {lang === 'ro' ? 'Informații verificate, fără speculații' : 'Verified Information directly from Official Sources'}
                  </h3>

                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {lang === 'ro'
                      ? 'ActeSimple sintetizează regulile din legislația din România și trimite direct către formularele și portalurile oficiale ale statului (IGI, eViza MAE, Ghișeul.ro, HUB MAI, ANAF, CNAS). Nu stocăm date de identitate, CNP sau pașapoarte.'
                      : 'ActeSimple compiles official procedures from Romanian statutes and connects citizens and residents directly to official public portals (IGI, eViza MAE, Ghiseul.ro, HUB MAI, ANAF, CNAS). We never store personal identity records, CNP, or passport copies.'}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsWizardOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition shadow-sm"
                    >
                      <Compass className="w-4 h-4" />
                      <span>{t.startWizardCta}</span>
                    </button>
                    <a
                      href="https://igi.mai.gov.ro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition border border-white/20"
                    >
                      <span>Portal IGI (Imigrări)</span>
                    </a>
                    <a
                      href="https://www.ghiseul.ro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition border border-white/20"
                    >
                      <span>Ghișeul.ro</span>
                    </a>
                  </div>
                </div>
              </section>

            </div>
          </div>
        )}

      </main>

      {/* Orientation Wizard Modal */}
      {isWizardOpen && (
        <OrientationWizard
          procedures={procedures}
          lang={lang}
          onSelectProcedure={handleSelectProcedure}
          onClose={() => setIsWizardOpen(false)}
          onApplyProfileFilter={(prof) => {
            setSelectedProfile(prof);
            setIsWizardOpen(false);
          }}
        />
      )}

      {/* Saved Checklists Modal */}
      {isSavedOpen && (
        <SavedChecklistsModal
          savedItems={savedChecklists}
          procedures={procedures}
          onSelectProcedure={handleSelectProcedure}
          onClose={() => setIsSavedOpen(false)}
          lang={lang}
        />
      )}

      {/* Footer */}
      <Footer lang={lang} />

    </div>
  );
}
