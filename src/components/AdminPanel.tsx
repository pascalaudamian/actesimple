import React, { useState, useEffect } from 'react';
import {
  Procedure,
  DocumentItem,
  StepItem,
  CategoryId,
  ProcedureStatus,
  DocumentType,
  AuditLogEntry,
  VerificationStatus,
} from '../types.ts';
import { api, getStoredAdminToken } from '../services/api.ts';
import { CATEGORIES } from '../data/seedProcedures.ts';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  X,
  Save,
  Lock,
  LogOut,
  ListOrdered,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  History,
  Check,
  Globe,
} from 'lucide-react';

interface AdminPanelProps {
  procedures: Procedure[];
  onRefresh: () => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  procedures,
  onRefresh,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verification confirmation modal state
  const [verifyingProcedure, setVerifyingProcedure] = useState<Procedure | null>(null);
  const [verifierName, setVerifierName] = useState<string>('Specialist Verificare ActeSimple');
  const [verificationNotes, setVerificationNotes] = useState<string>('');
  const [verificationConfirmed, setVerificationConfirmed] = useState<boolean>(false);

  // Audit logs modal
  const [showAuditLogs, setShowAuditLogs] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Filter within admin
  const [adminCategory, setAdminCategory] = useState<string>('all');
  const [adminStatus, setAdminStatus] = useState<string>('all');
  const [adminSearch, setAdminSearch] = useState<string>('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isAuth = await api.checkAdminAuth();
    setIsAuthenticated(isAuth);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await api.adminLogin(passwordInput);
      if (res.success) {
        setIsAuthenticated(true);
        setPasswordInput('');
        showSuccess('Autentificat cu succes în panoul de administrare.');
      } else {
        setLoginError(res.error || 'Parolă incorectă.');
      }
    } catch {
      setLoginError('Eroare la comunicarea cu serverul.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await api.adminLogout();
    setIsAuthenticated(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4500);
  };

  // Open real verification confirmation dialog
  const handleOpenVerifyModal = (proc: Procedure) => {
    setVerifyingProcedure(proc);
    setVerifierName('Specialist Juridic ActeSimple');
    setVerificationNotes(
      proc.verification_notes ||
        `Verificat cu portalul oficial ${proc.competent_authority}. Cerințele și taxele de ${proc.total_fee} sunt conforme cu legislația curentă.`
    );
    setVerificationConfirmed(false);
  };

  // Confirm verification
  const handleConfirmVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingProcedure) return;

    if (!verificationConfirmed) {
      showError('Trebuie să bifați confirmarea responsabilității de verificare.');
      return;
    }

    try {
      setLoadingAction('verify');
      await api.verifyProcedure(verifyingProcedure.id, {
        verifier_name: verifierName.trim(),
        verification_notes: verificationNotes.trim(),
        verified_at: new Date().toISOString().slice(0, 10),
        is_confirmed_correct: true,
      });
      showSuccess(`Verificarea oficială a procedurii "${verifyingProcedure.title}" a fost înregistrată!`);
      setVerifyingProcedure(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Eroare la înregistrarea verificării.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Delete Procedure
  const handleDelete = async (procId: string, title: string) => {
    if (!window.confirm(`Confirmați ștergerea definitivă a procedurii "${title}" din baza de date?`)) return;
    try {
      setLoadingAction(procId);
      await api.deleteProcedure(procId);
      showSuccess('Procedura a fost ștearsă.');
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Eroare la ștergerea procedurii.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Reset to initial seed
  const handleResetSeed = async () => {
    if (!window.confirm('ATENȚIE: Această acțiune va reseta toate procedurile la datele demonstrative oficiale inițiale! Confirmați?')) return;
    try {
      setLoadingAction('reset');
      await api.resetSeedData();
      showSuccess('Baza de date a fost resetată cu succes!');
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Nu s-a putut reseta baza de date.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Open audit logs
  const handleOpenAuditLogs = async () => {
    setShowAuditLogs(true);
    const logs = await api.getAuditLogs();
    setAuditLogs(logs);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newProc: Procedure = {
      id: '',
      slug: '',
      title: '',
      short_description: '',
      full_description: '',
      category: 'identitate',
      status: 'published',
      estimated_time: '3 - 7 zile lucrătoare',
      difficulty: 'usor',
      total_fee: 'Gratuit',
      competent_authority: '',
      authority_city_note: '',
      is_online_available: false,
      last_verified_at: today,
      verification_status: 'verified',
      verified_by: 'Administrator ActeSimple',
      verification_notes: 'Verificare inițială la adăugare.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_popular: false,
      keywords: [],
      synonyms: [],
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          procedure_id: '',
          name: 'Cerere tipizată',
          type: 'formular',
          is_mandatory: true,
          description: 'Completată și semnată de solicitant.',
          order_index: 1,
        },
        {
          id: `doc-${Date.now()}-2`,
          procedure_id: '',
          name: 'Actul de identitate',
          type: 'original',
          is_mandatory: true,
          description: 'În original și copie xerox simplă.',
          order_index: 2,
        },
      ],
      steps: [
        {
          id: `step-${Date.now()}-1`,
          procedure_id: '',
          step_number: 1,
          title: 'Programare sau accesare portal',
          description: 'Verifică dacă instituția solicită programare online prealabilă.',
        },
        {
          id: `step-${Date.now()}-2`,
          procedure_id: '',
          step_number: 2,
          title: 'Depunerea dosarului',
          description: 'Prezintă documentele la ghișeu sau încarcă-le pe portal.',
        },
      ],
      sources: [
        {
          id: `src-${Date.now()}-1`,
          procedure_id: '',
          institution_name: 'Site-ul oficial al autorității',
          url: 'https://gov.ro',
          last_verified_at: today,
        },
      ],
    };
    setIsCreating(true);
    setEditingProcedure(newProc);
  };

  // Open Edit Modal
  const handleOpenEdit = (proc: Procedure) => {
    setIsCreating(false);
    setEditingProcedure(JSON.parse(JSON.stringify(proc)));
  };

  // Save procedure from modal
  const handleSaveProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProcedure) return;

    if (!editingProcedure.title.trim()) {
      showError('Titlul procedurii este obligatoriu.');
      return;
    }

    try {
      setLoadingAction('save');
      if (isCreating) {
        await api.createProcedure(editingProcedure);
        showSuccess('Procedura a fost adăugată cu succes în baza de date!');
      } else {
        await api.updateProcedure(editingProcedure.id, editingProcedure);
        showSuccess('Modificările au fost salvate cu succes!');
      }
      setEditingProcedure(null);
      setIsCreating(false);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Eroare la salvarea procedurii.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Filtered procedures in table
  const filteredProcedures = procedures.filter((p) => {
    if (adminCategory !== 'all' && p.category !== adminCategory) return false;
    if (adminStatus !== 'all' && p.status !== adminStatus) return false;
    if (adminSearch.trim().length > 0) {
      const q = adminSearch.toLowerCase().trim();
      return (
        p.title.toLowerCase().includes(q) ||
        p.competent_authority.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().slice(0, 10);
  const needsReviewCount = procedures.filter(
    (p) => p.last_verified_at < sixMonthsAgo || p.verification_status === 'needs_review'
  ).length;

  // --- 1. RENDER LOGIN SCREEN IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-500/20">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 text-center tracking-tight">
            Acces Administrativ Securizat
          </h2>
          <p className="text-xs text-slate-500 text-center mt-1 mb-6">
            Autentificare necesară pentru modificarea procedurilor, atestarea verificărilor și gestionarea surselor oficiale.
          </p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Parolă Administrator
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Introduceți parola..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Parola este securizată server-side și protejată împotriva atacurilor de forță brută.
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 text-xs font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Înapoi
              </button>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-1/2 py-2.5 text-xs font-bold rounded-xl text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 transition flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isLoggingIn ? 'Se verifică...' : 'Autentificare'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. RENDER FULL AUTHENTICATED ADMIN PANEL ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Bar with session status & logout */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Autentificat Administrator
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Panou de Administrare ActeSimple
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Validare date cu Zod, audit logging și confirmare atestată a verificării oficiale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAuditLogs}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition"
            title="Vezi jurnalul de audit al modificărilor"
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Jurnal Audit</span>
          </button>

          <button
            onClick={handleResetSeed}
            disabled={loadingAction === 'reset'}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition"
            title="Reîncarcă datele demonstrative oficiale"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Restabilește Seed</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adaugă Procedură</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition"
            title="Deconectare administrator"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200 transition"
            title="Închide panoul"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Proceduri</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{procedures.length}</div>
          <span className="text-[11px] text-slate-400">În catalog</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700">Verificate Recent</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {procedures.length - needsReviewCount}
          </div>
          <span className="text-[11px] text-emerald-600">Ultimele 6 luni</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-amber-700">Necesită Revizuire</span>
          <div className="text-2xl font-black text-amber-800 mt-1">{needsReviewCount}</div>
          <span className="text-[11px] text-amber-600">&gt; 6 luni fără check</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-blue-700">Disponibile Online</span>
          <div className="text-2xl font-black text-blue-900 mt-1">
            {procedures.filter((p) => p.is_online_available).length}
          </div>
          <span className="text-[11px] text-slate-400">Hub MAI / MyONRC</span>
        </div>
      </div>

      {/* Filters in admin */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Filtrează după titlu, autoritate, slug..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={adminCategory}
            onChange={(e) => setAdminCategory(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
          >
            <option value="all">Toate categoriile</option>
            {CATEGORIES.filter((c) => c.id !== 'toate').map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={adminStatus}
            onChange={(e) => setAdminStatus(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
          >
            <option value="all">Toate statusurile</option>
            <option value="published">Publicat</option>
            <option value="draft">Schiță (Draft)</option>
            <option value="needs_review">Necesită revizuire</option>
          </select>
        </div>
      </div>

      {/* Procedures Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Titlu Procedură</th>
                <th className="py-3.5 px-3">Categorie</th>
                <th className="py-3.5 px-3">Autoritate</th>
                <th className="py-3.5 px-3">Ultima Verificare</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProcedures.map((proc) => {
                const isOverdue = proc.last_verified_at < sixMonthsAgo;
                return (
                  <tr key={proc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 line-clamp-1">{proc.title}</span>
                        {proc.is_online_available && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                            Online
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{proc.documents?.length || 0} documente</span>
                        <span>•</span>
                        <span>{proc.steps?.length || 0} pași</span>
                        <span>•</span>
                        <span className="font-medium text-emerald-700">{proc.total_fee}</span>
                        {proc.verified_by && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-500">Verificat de: {proc.verified_by}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 uppercase">
                        {proc.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 text-xs max-w-xs truncate">
                      {proc.competent_authority}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold text-xs ${
                            isOverdue ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {proc.last_verified_at}
                        </span>
                        {isOverdue && (
                          <span
                            className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold"
                            title="A trecut mai mult de 6 luni de la verificare"
                          >
                            &gt; 6 luni!
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          proc.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : proc.status === 'needs_review'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {proc.status === 'published'
                          ? 'Publicat'
                          : proc.status === 'needs_review'
                          ? 'De revizuit'
                          : 'Schiță'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Real Verification confirmation modal button */}
                        <button
                          onClick={() => handleOpenVerifyModal(proc)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1"
                          title="Atestă verificarea juridică și oficială cu note"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verifică</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(proc)}
                          className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition"
                          title="Editează procedura"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(proc.id, proc.title)}
                          disabled={loadingAction === proc.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Șterge procedura"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProcedures.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                    Nicio procedură găsită conform filtrelor selectate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL 1: REAL VERIFICATION CONFIRMATION --- */}
      {verifyingProcedure && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Atestare Verificare Oficială
                </h3>
              </div>
              <button
                onClick={() => setVerifyingProcedure(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 mb-4 leading-relaxed">
              Înregistrați atestarea că informațiile juridice, documentele și taxele pentru <strong>"{verifyingProcedure.title}"</strong> au fost reverificate direct cu sursele oficiale.
            </p>

            <form onSubmit={handleConfirmVerification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nume Persoană Verificator *
                </label>
                <input
                  type="text"
                  required
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note &amp; Observații Verificare (sursă verificată, acte normative) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-emerald-950 font-medium">
                  <input
                    type="checkbox"
                    required
                    checked={verificationConfirmed}
                    onChange={(e) => setVerificationConfirmed(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                  />
                  <span>
                    Confirm pe propria răspundere că am verificat această procedură cu legislația și site-ul oficial competent și că datele sunt corecte la zi.
                  </span>
                </label>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setVerifyingProcedure(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition border border-slate-200"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === 'verify' || !verificationConfirmed}
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 transition flex items-center gap-1.5 shadow-md shadow-emerald-700/20 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Atestă Verificarea Oficială</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: AUDIT LOGS MODAL --- */}
      {showAuditLogs && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-700" />
                <h3 className="text-lg font-bold text-slate-900">Jurnal de Audit &amp; Trasabilitate</h3>
              </div>
              <button
                onClick={() => setShowAuditLogs(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {auditLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Nicio intrare în jurnalul de audit.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                        [{log.action}] {log.entity_type}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString('ro-RO')}
                      </span>
                    </div>
                    <div className="font-medium text-slate-700">{log.details}</div>
                    <div className="text-[11px] text-slate-500 italic">Efectuat de: {log.user}</div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 text-right bg-slate-50">
              <button
                onClick={() => setShowAuditLogs(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: PROCEDURE EDIT / CREATE MODAL --- */}
      {editingProcedure && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isCreating ? 'Adaugă Procedură Nouă' : `Editare: ${editingProcedure.title}`}
                </h3>
                <p className="text-xs text-slate-500">
                  Validează cerințele, documentele, pașii și sursele oficiale.
                </p>
              </div>
              <button
                onClick={() => setEditingProcedure(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProcedure} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* General Info */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm border-b pb-2">
                  1. Informații Generale &amp; Clasificare
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Titlu Procedură *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProcedure.title}
                      onChange={(e) =>
                        setEditingProcedure({ ...editingProcedure, title: e.target.value })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Categorie
                    </label>
                    <select
                      value={editingProcedure.category}
                      onChange={(e) =>
                        setEditingProcedure({
                          ...editingProcedure,
                          category: e.target.value as CategoryId,
                        })
                      }
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      {CATEGORIES.filter((c) => c.id !== 'toate').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status Publicare
                    </label>
                    <select
                      value={editingProcedure.status}
                      onChange={(e) =>
                        setEditingProcedure({
                          ...editingProcedure,
                          status: e.target.value as ProcedureStatus,
                        })
                      }
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="published">Publicat (activ)</option>
                      <option value="draft">Schiță (Draft)</option>
                      <option value="needs_review">Necesită revizuire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Autoritate Competentă
                    </label>
                    <input
                      type="text"
                      value={editingProcedure.competent_authority}
                      onChange={(e) =>
                        setEditingProcedure({
                          ...editingProcedure,
                          competent_authority: e.target.value,
                        })
                      }
                      placeholder="Ex: Direcția Generală de Pașapoarte"
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Taxă Totală Verificată
                    </label>
                    <input
                      type="text"
                      value={editingProcedure.total_fee}
                      onChange={(e) =>
                        setEditingProcedure({
                          ...editingProcedure,
                          total_fee: e.target.value,
                        })
                      }
                      placeholder="Ex: 7 Lei / 258 Lei / Gratuit"
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Timp Estimat de Procesare
                    </label>
                    <input
                      type="text"
                      value={editingProcedure.estimated_time}
                      onChange={(e) =>
                        setEditingProcedure({
                          ...editingProcedure,
                          estimated_time: e.target.value,
                        })
                      }
                      placeholder="Ex: 3 - 5 zile lucrătoare"
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Data Verificării Oficiale
                    </label>
                    <input
                      type="date"
                      value={editingProcedure.last_verified_at}
                      onChange={(e) =>
                        setEditingProcedure({
                          ...editingProcedure,
                          last_verified_at: e.target.value,
                        })
                      }
                      className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sinonime &amp; Denumiri Populare (separate prin virgulă)
                    </label>
                    <input
                      type="text"
                      value={(editingProcedure.synonyms || []).join(', ')}
                      onChange={(e) =>
                        setEditingProcedure({
                          ...editingProcedure,
                          synonyms: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Ex: buletin, carte identitate, buletin expirat, ci"
                      className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Descriere Scurtă
                    </label>
                    <textarea
                      rows={2}
                      value={editingProcedure.short_description}
                      onChange={(e) =>
                        setEditingProcedure({
                          ...editingProcedure,
                          short_description: e.target.value,
                        })
                      }
                      className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div className="flex items-center gap-6 sm:col-span-2 pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProcedure.is_online_available}
                        onChange={(e) =>
                          setEditingProcedure({
                            ...editingProcedure,
                            is_online_available: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        Procedură disponibilă integral online (fără prezență fizică obligatorie)
                      </span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProcedure.is_popular}
                        onChange={(e) =>
                          setEditingProcedure({
                            ...editingProcedure,
                            is_popular: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        Afișează ca Procedură Populară
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Documents Management */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">
                    2. Documente Necesare ({editingProcedure.documents?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newDoc: DocumentItem = {
                        id: `doc-${Date.now()}`,
                        procedure_id: editingProcedure.id,
                        name: 'Document nou',
                        type: 'original',
                        is_mandatory: true,
                        description: '',
                        order_index: (editingProcedure.documents?.length || 0) + 1,
                      };
                      setEditingProcedure({
                        ...editingProcedure,
                        documents: [...(editingProcedure.documents || []), newDoc],
                      });
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                  >
                    + Adaugă Document
                  </button>
                </div>

                <div className="space-y-3">
                  {(editingProcedure.documents || []).map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-500">#{idx + 1}</span>
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={doc.name}
                            onChange={(e) => {
                              const updated = [...editingProcedure.documents];
                              updated[idx].name = e.target.value;
                              setEditingProcedure({ ...editingProcedure, documents: updated });
                            }}
                            placeholder="Denumire document..."
                            className="flex-1 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                          <select
                            value={doc.type}
                            onChange={(e) => {
                              const updated = [...editingProcedure.documents];
                              updated[idx].type = e.target.value as DocumentType;
                              setEditingProcedure({ ...editingProcedure, documents: updated });
                            }}
                            className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="original">Original</option>
                            <option value="copie">Copie xerox</option>
                            <option value="formular">Formular tipizat</option>
                            <option value="dovada_plata">Chitanță plată</option>
                            <option value="legalizat">Copie legalizată</option>
                          </select>
                        </div>

                        <label className="inline-flex items-center gap-1 text-xs text-slate-700 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={doc.is_mandatory}
                            onChange={(e) => {
                              const updated = [...editingProcedure.documents];
                              updated[idx].is_mandatory = e.target.checked;
                              setEditingProcedure({ ...editingProcedure, documents: updated });
                            }}
                          />
                          <span>Obligatoriu</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingProcedure.documents.filter((_, i) => i !== idx);
                            setEditingProcedure({ ...editingProcedure, documents: updated });
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          value={doc.description}
                          onChange={(e) => {
                            const updated = [...editingProcedure.documents];
                            updated[idx].description = e.target.value;
                            setEditingProcedure({ ...editingProcedure, documents: updated });
                          }}
                          placeholder="Observații (ex: original + copie)..."
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                        />
                        <input
                          type="text"
                          value={doc.download_url || ''}
                          onChange={(e) => {
                            const updated = [...editingProcedure.documents];
                            updated[idx].download_url = e.target.value;
                            setEditingProcedure({ ...editingProcedure, documents: updated });
                          }}
                          placeholder="URL formular PDF oficial..."
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps Management */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">
                    3. Pașii de Urmat ({editingProcedure.steps?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newStep: StepItem = {
                        id: `step-${Date.now()}`,
                        procedure_id: editingProcedure.id,
                        step_number: (editingProcedure.steps?.length || 0) + 1,
                        title: 'Pas nou',
                        description: '',
                      };
                      setEditingProcedure({
                        ...editingProcedure,
                        steps: [...(editingProcedure.steps || []), newStep],
                      });
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                  >
                    + Adaugă Pas
                  </button>
                </div>

                <div className="space-y-3">
                  {(editingProcedure.steps || []).map((step, idx) => (
                    <div
                      key={step.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-500">Pas {idx + 1}</span>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const updated = [...editingProcedure.steps];
                            updated[idx].title = e.target.value;
                            setEditingProcedure({ ...editingProcedure, steps: updated });
                          }}
                          placeholder="Titlul pasului..."
                          className="flex-1 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingProcedure.steps.filter((_, i) => i !== idx);
                            updated.forEach((s, i) => (s.step_number = i + 1));
                            setEditingProcedure({ ...editingProcedure, steps: updated });
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={step.description}
                        onChange={(e) => {
                          const updated = [...editingProcedure.steps];
                          updated[idx].description = e.target.value;
                          setEditingProcedure({ ...editingProcedure, steps: updated });
                        }}
                        placeholder="Descrierea acțiunii la acest pas..."
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => setEditingProcedure(null)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition border border-slate-200"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === 'save'}
                  className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isCreating ? 'Creează Procedură' : 'Salvează Modificările'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
