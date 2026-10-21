import React, { useState } from 'react';
import { Procedure, DocumentItem, StepItem, SourceItem, CategoryId, ProcedureDifficulty, ProcedureStatus, DocumentType } from '../types.ts';
import { api } from '../services/api.ts';
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
  Building2,
  Calendar,
  ExternalLink,
  Layers,
  FileText,
  Clock,
  Sparkles,
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
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter within admin
  const [adminCategory, setAdminCategory] = useState<string>('all');
  const [adminSearch, setAdminSearch] = useState<string>('');

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // 1-Click Verification
  const handleVerifyToday = async (procId: string) => {
    try {
      setLoadingAction(procId);
      await api.verifyProcedure(procId);
      showSuccess('Procedura a fost marcată ca verificată astăzi!');
      onRefresh();
    } catch {
      showError('Nu s-a putut actualiza data verificării.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Delete Procedure
  const handleDelete = async (procId: string, title: string) => {
    if (!window.confirm(`Sigur doriți să ștergeți procedura "${title}"?`)) return;
    try {
      setLoadingAction(procId);
      await api.deleteProcedure(procId);
      showSuccess('Procedura a fost ștearsă.');
      onRefresh();
    } catch {
      showError('Eroare la ștergerea procedurii.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Reset to initial seed
  const handleResetSeed = async () => {
    if (!window.confirm('Atenție: Această acțiune va reseta toate procedurile la datele implicite din seed! Continuați?')) return;
    try {
      setLoadingAction('reset');
      await api.resetSeedData();
      showSuccess('Baza de date a fost resetată cu succes!');
      onRefresh();
    } catch {
      showError('Nu s-a putut reseta baza de date.');
    } finally {
      setLoadingAction(null);
    }
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
      last_verified_at: today,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_popular: false,
      keywords: [],
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          procedure_id: '',
          name: 'Cerere tipizată',
          type: 'formular',
          is_mandatory: true,
          description: 'Completată și semnată de titular.',
          order_index: 1,
        },
        {
          id: `doc-${Date.now()}-2`,
          procedure_id: '',
          name: 'Actul de identitate',
          type: 'original',
          is_mandatory: true,
          description: 'În original și copie simplă.',
          order_index: 2,
        },
      ],
      steps: [
        {
          id: `step-${Date.now()}-1`,
          procedure_id: '',
          step_number: 1,
          title: 'Programare sau completare formular online',
          description: 'Verifică dacă instituția solicită programare prealabilă.',
        },
        {
          id: `step-${Date.now()}-2`,
          procedure_id: '',
          step_number: 2,
          title: 'Depunerea dosarului la ghișeu',
          description: 'Prezintă documentele originale și copiile funcționarului.',
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
        showSuccess('Procedura a fost adăugată cu succes!');
      } else {
        await api.updateProcedure(editingProcedure.id, editingProcedure);
        showSuccess('Modificările au fost salvate cu succes!');
      }
      setEditingProcedure(null);
      setIsCreating(false);
      onRefresh();
    } catch {
      showError('Eroare la salvarea procedurii.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Filtered procedures in table
  const filteredProcedures = procedures.filter((p) => {
    if (adminCategory !== 'all' && p.category !== adminCategory) return false;
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

  // Calculate review stats
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().slice(0, 10);
  const needsReviewCount = procedures.filter((p) => p.last_verified_at < sixMonthsAgo).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Admin Mode
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Panou de Administrare ActeSimple
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Gestionează procedurile, cerințele de documente, pașii și verificarea oficială a datelor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSeed}
            disabled={loadingAction === 'reset'}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition"
            title="Reîncarcă procedurile demo inițiale"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restabilește Seed</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adaugă Procedură</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200 transition"
            title="Închide panoul de administrare"
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
          <span className="text-[11px] text-slate-400">În baza de date</span>
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
          <span className="text-xs font-semibold text-blue-700">Total Documente</span>
          <div className="text-2xl font-black text-blue-900 mt-1">
            {procedures.reduce((acc, p) => acc + (p.documents?.length || 0), 0)}
          </div>
          <span className="text-[11px] text-slate-400">Actele indexate</span>
        </div>
      </div>

      {/* Filters in admin */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Filtrează după titlu, instituție..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Categorie:</span>
          <select
            value={adminCategory}
            onChange={(e) => setAdminCategory(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Toate categoriile</option>
            {CATEGORIES.filter((c) => c.id !== 'toate').map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
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
                      <div className="font-bold text-slate-900 line-clamp-1">{proc.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{proc.documents?.length || 0} documente</span>
                        <span>•</span>
                        <span>{proc.steps?.length || 0} pași</span>
                        <span>•</span>
                        <span className="font-medium text-emerald-700">{proc.total_fee}</span>
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
                            Revizuire!
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          proc.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {proc.status === 'published' ? 'Publicat' : 'Schiță'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click Verify Today */}
                        <button
                          onClick={() => handleVerifyToday(proc.id)}
                          disabled={loadingAction === proc.id}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                          title="Marchează ca verificat astăzi"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                          <span>Azi</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(proc)}
                          className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition"
                          title="Editează procedura și documentele"
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
                    Nicio procedură găsită conform criteriilor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PROCEDURE EDIT / CREATE MODAL --- */}
      {editingProcedure && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isCreating ? 'Adaugă Procedură Nouă' : `Editare: ${editingProcedure.title}`}
                </h3>
                <p className="text-xs text-slate-500">
                  Modifică detaliile, actele necesare, pașii și sursele oficiale.
                </p>
              </div>
              <button
                onClick={() => setEditingProcedure(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProcedure} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* General Info */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm border-b pb-2">
                  1. Informații Generale
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
                      Status
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
                      <option value="published">Publicat</option>
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
                      Data Ultimei Verificări Oficiale
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

                  <div className="sm:col-span-2">
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
                        Afișează ca Procedură Populară pe prima pagină
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
                          placeholder="URL formular PDF (opțional)..."
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
                            // renumber
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          value={step.location_or_tool || ''}
                          onChange={(e) => {
                            const updated = [...editingProcedure.steps];
                            updated[idx].location_or_tool = e.target.value;
                            setEditingProcedure({ ...editingProcedure, steps: updated });
                          }}
                          placeholder="Unde / Pe ce site (ex: hub.mai.gov.ro)..."
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                        />
                        <input
                          type="text"
                          value={step.tip || ''}
                          onChange={(e) => {
                            const updated = [...editingProcedure.steps];
                            updated[idx].tip = e.target.value;
                            setEditingProcedure({ ...editingProcedure, steps: updated });
                          }}
                          placeholder="Sfat util / recomandare..."
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
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
