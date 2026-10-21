import React, { useState, useEffect, useMemo } from 'react';
import { Procedure, CategoryId, CategoryMeta } from './types.ts';
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
import { Footer } from './components/Footer.tsx';
import {
  Sparkles,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>(CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('toate');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isSavedOpen, setIsSavedOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Saved user progress in localStorage
  const [savedChecklists, setSavedChecklists] = useState<
    Array<{ procedureId: string; checkedDocsCount: number; lastUpdated: string }>
  >([]);

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
      setError('Nu am putut încărca datele din server. Folosim datele locale.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  // Filtered procedures
  const filteredProcedures = useMemo(() => {
    let list = procedures;

    if (selectedCategory !== 'toate') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const descMatch = (p.short_description + ' ' + p.full_description).toLowerCase().includes(q);
        const authorityMatch = (p.competent_authority || '').toLowerCase().includes(q);
        const keywordMatch = (p.keywords || []).some((kw) => kw.toLowerCase().includes(q));
        const documentMatch = (p.documents || []).some(
          (d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
        );
        return titleMatch || descMatch || authorityMatch || keywordMatch || documentMatch;
      });
    }

    return list;
  }, [procedures, selectedCategory, searchQuery]);

  // Popular procedures for the top highlight
  const popularProcedures = useMemo(() => {
    return procedures.filter((p) => p.is_popular);
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
      
      {/* Navbar */}
      <Navbar
        onGoHome={handleBackToHome}
        onOpenAdmin={() => setIsAdminOpen(!isAdminOpen)}
        onOpenSaved={() => setIsSavedOpen(true)}
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
            onBack={handleBackToHome}
            onCategoryClick={(catId) => {
              setSelectedCategory(catId as CategoryId);
              handleBackToHome();
            }}
          />
        ) : (
          /* Home Portal View */
          <div>
            {/* Hero & Big Search */}
            <HeroSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectTag={(term) => setSearchQuery(term)}
              totalProcedures={procedures.length}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              
              {/* Category Filter Pills */}
              <div className="mb-8">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Filtrează după domeniu
                  </h2>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Resetează căutarea
                    </button>
                  )}
                </div>

                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => setSelectedCategory(cat)}
                />
              </div>

              {/* Notice if loading or offline */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-sm font-medium">Se încarcă procedurile administrative...</span>
                </div>
              )}

              {/* Popular Procedures Section (only shown when no specific search is typed and on 'toate' category) */}
              {!searchQuery && selectedCategory === 'toate' && popularProcedures.length > 0 && (
                <section className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Proceduri Populare în România
                    </h2>
                    <span className="text-xs text-slate-500 font-medium ml-1">
                      (Cele mai frecvent accesate ghiduri)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {popularProcedures.map((proc) => (
                      <ProcedureCard
                        key={proc.id}
                        procedure={proc}
                        onSelect={handleSelectProcedure}
                        userProgress={getProcedureProgress(proc.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Catalog of All Procedures */}
              <section>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-700" />
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {searchQuery
                        ? `Rezultate căutare: "${searchQuery}"`
                        : selectedCategory === 'toate'
                        ? 'Toate Procedurile Disponibile'
                        : `Proceduri: ${categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}`}
                    </h2>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {filteredProcedures.length} {filteredProcedures.length === 1 ? 'ghid' : 'ghiduri'}
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
                        userProgress={getProcedureProgress(proc.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800">
                      Nu am găsit proceduri pentru "{searchQuery}"
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                      Încearcă alte cuvinte cheie (ex: "buletin", "pasaport", "srl", "cazier", "permis") sau selectează categoria "Toate".
                    </p>
                    <div className="mt-5">
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('toate');
                        }}
                        className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition"
                      >
                        Arată toate procedurile
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Informative Civic Banner */}
              <section className="mt-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold mb-4 border border-blue-700/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                    <span>Simplificăm birocrația din România</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Ai pregătit dosarul? Nu uita să verifici programarea online!
                  </h3>

                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    Multe instituții (Evidența Populației, Serviciul de Pașapoarte, Permise &amp; Înmatriculări) funcționează cu prioritate sau exclusiv pe bază de programare pe HUB MAI sau pe site-urile primăriilor locale.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href="https://hub.mai.gov.ro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-950 font-bold text-xs sm:text-sm hover:bg-blue-50 transition shadow-sm"
                    >
                      <span>Accesează HUB MAI (Programări &amp; Cazier)</span>
                    </a>
                    <a
                      href="https://www.ghiseul.ro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800/80 text-white font-semibold text-xs sm:text-sm hover:bg-blue-800 transition border border-blue-700"
                    >
                      <span>Plăți Taxe pe Ghișeul.ro</span>
                    </a>
                  </div>
                </div>
              </section>

            </div>
          </div>
        )}

      </main>

      {/* Saved Checklists Modal */}
      {isSavedOpen && (
        <SavedChecklistsModal
          savedItems={savedChecklists}
          procedures={procedures}
          onSelectProcedure={handleSelectProcedure}
          onClose={() => setIsSavedOpen(false)}
        />
      )}

      {/* Footer */}
      <Footer />

    </div>
  );
}
