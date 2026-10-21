import React, { useState } from 'react';
import { Procedure, DocumentType } from '../types.ts';
import { useChecklist } from '../hooks/useChecklist.ts';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Coins,
  Building2,
  ShieldCheck,
  Printer,
  Share2,
  RotateCcw,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Check,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  HelpCircle,
} from 'lucide-react';

interface ProcedureDetailProps {
  procedure: Procedure;
  onBack: () => void;
  onCategoryClick?: (category: string) => void;
}

export const ProcedureDetail: React.FC<ProcedureDetailProps> = ({
  procedure,
  onBack,
  onCategoryClick,
}) => {
  const {
    state,
    toggleDoc,
    toggleStep,
    addCustomDoc,
    toggleCustomDoc,
    deleteCustomDoc,
    setNotes,
    setAppointmentDate,
    setAppointmentLocation,
    checkAllDocs,
    resetChecklist,
    docProgress,
    stepProgress,
    generateShareText,
  } = useChecklist(procedure.id, procedure.documents, procedure.steps);

  const [activeTab, setActiveTab] = useState<'documente' | 'pasi' | 'taxe' | 'sfaturi' | 'surse'>('documente');
  const [docFilter, setDocFilter] = useState<'toate' | 'obligatorii' | 'ramase'>('toate');
  const [newCustomDocName, setNewCustomDocName] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  const handleCopy = () => {
    const text = generateShareText(procedure.title);
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddCustomDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomDocName.trim()) {
      addCustomDoc(newCustomDocName);
      setNewCustomDocName('');
    }
  };

  const formatVerifiedDate = (dateStr: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getDocTypeBadge = (type: DocumentType) => {
    switch (type) {
      case 'original':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">Original</span>;
      case 'copie':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-300">Copie xerox</span>;
      case 'formular':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">Formular tipizat</span>;
      case 'dovada_plata':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Chitanță plată</span>;
      case 'legalizat':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">Copie legalizată</span>;
      default:
        return null;
    }
  };

  // Filtered documents
  const filteredDocs = (procedure.documents || []).filter((doc) => {
    if (docFilter === 'obligatorii') return doc.is_mandatory;
    if (docFilter === 'ramase') return !state.checkedDocumentIds.includes(doc.id);
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Top back & actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 transition px-3 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi la proceduri</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition"
            title="Copiază lista pentru WhatsApp sau Notițe"
          >
            {copiedToast ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
            <span>{copiedToast ? 'Copiat în clipboard!' : 'Copiază rezumat'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition"
            title="Tipărește checklist-ul pentru dosar"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Tipărește dosar</span>
          </button>

          <button
            onClick={resetChecklist}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition"
            title="Resetează toate bifările pentru această procedură"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Resetează</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            onClick={() => onCategoryClick && onCategoryClick(procedure.category)}
            className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition"
          >
            {procedure.category}
          </button>
          {procedure.is_popular && (
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
              Procedură Populară
            </span>
          )}
          <div className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verificat oficial: {formatVerifiedDate(procedure.last_verified_at)}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          {procedure.title}
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          {procedure.full_description || procedure.short_description}
        </p>

        {/* Fact badges grid */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Instituție competentă</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900 line-clamp-2">
              {procedure.competent_authority}
            </div>
            {procedure.authority_city_note && (
              <div className="text-[11px] text-slate-500 mt-0.5">{procedure.authority_city_note}</div>
            )}
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span>Taxe totale</span>
            </div>
            <div className="mt-1 text-sm font-bold text-emerald-700">
              {procedure.total_fee}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Plătibil online / ghișeu</div>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Timp estimat</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {procedure.estimated_time}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">De la depunerea dosarului</div>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Acte de pregătit</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {procedure.documents?.length || 0} documente
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{procedure.steps?.length || 0} pași de parcurs</div>
          </div>
        </div>

        {/* Pro-tips callout banner */}
        {procedure.pro_tips && procedure.pro_tips.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-950 mb-1.5">
              <Lightbulb className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Sfat important &amp; capcană birocratică frecventă:</span>
            </div>
            <ul className="text-xs sm:text-sm space-y-1 list-disc list-inside text-amber-900 font-medium">
              {procedure.pro_tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Interactive Progress Card (Checklist Bar) */}
      <div className="bg-white rounded-2xl border-2 border-blue-500/30 p-5 shadow-sm mb-8 print:border-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {docProgress.percentage}%
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Checklist personal: Dosarul tău de acte
              </h3>
              <p className="text-xs text-slate-500">
                Ai pregătit <span className="font-semibold text-slate-800">{docProgress.checked}</span> din{' '}
                <span className="font-semibold text-slate-800">{docProgress.total}</span> documente necesare.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={checkAllDocs}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
            >
              Bifează toate actele
            </button>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              docProgress.isComplete
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}
            style={{ width: `${docProgress.percentage}%` }}
          />
        </div>

        {docProgress.isComplete && (
          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dosar complet! Ai toate actele bifate și gata de depunere.</span>
          </div>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-200 mb-6 print:hidden">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('documente')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'documente'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Documente Necesare ({procedure.documents?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('pasi')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'pasi'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pașii de Urmat ({procedure.steps?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('taxe')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'taxe'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Taxe &amp; Plată</span>
          </button>

          <button
            onClick={() => setActiveTab('sfaturi')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'sfaturi'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Întrebări &amp; Sfaturi</span>
          </button>

          <button
            onClick={() => setActiveTab('surse')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'surse'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Surse Oficiale</span>
          </button>
        </nav>
      </div>

      {/* --- TAB CONTENT 1: DOCUMENTE & CHECKLIST --- */}
      {activeTab === 'documente' && (
        <div className="space-y-6">
          {/* Sub-filter pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium px-2">Filtru acte:</span>
              <button
                onClick={() => setDocFilter('toate')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  docFilter === 'toate'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toate ({procedure.documents?.length || 0})
              </button>
              <button
                onClick={() => setDocFilter('obligatorii')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  docFilter === 'obligatorii'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Doar obligatorii
              </button>
              <button
                onClick={() => setDocFilter('ramase')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  docFilter === 'ramase'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                De pregătit ({procedure.documents.length - state.checkedDocumentIds.length})
              </button>
            </div>

            <div className="text-xs text-slate-500 italic pr-2">
              💡 Bifează documentul când l-ai pus în dosar
            </div>
          </div>

          {/* Documents list */}
          <div className="space-y-3">
            {filteredDocs.map((doc, idx) => {
              const isChecked = state.checkedDocumentIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start gap-4 ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <div className="pt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400" />
                    )}
                  </div>

                  {/* Document details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        #{idx + 1}
                      </span>
                      {getDocTypeBadge(doc.type)}
                      {doc.is_mandatory ? (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Obligatoriu
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Opțional / în funcție de caz
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-base font-bold ${
                        isChecked ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {doc.name}
                    </h4>

                    {doc.description && (
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {doc.description}
                      </p>
                    )}

                    {doc.where_to_get && (
                      <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">De unde se obține:</span>
                        <span>{doc.where_to_get}</span>
                      </div>
                    )}

                    {/* Download button if form URL is provided */}
                    {doc.download_url && (
                      <div className="mt-3 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={doc.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{doc.download_label || 'Descarcă formular tipizat'}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 text-blue-500" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-sm">
                Niciun document nu corespunde filtrului selectat.
              </div>
            )}
          </div>

          {/* User's Custom Additional Documents Section */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 mt-8">
            <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Adaugă un document personalizat la dosar</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Poți nota alte documente specifice situației tale (ex: adeverință de la asociația de proprietari, procură notarială).
            </p>

            <form onSubmit={handleAddCustomDoc} className="flex gap-2">
              <input
                type="text"
                value={newCustomDocName}
                onChange={(e) => setNewCustomDocName(e.target.value)}
                placeholder="Ex: Copie certificat căsătorie părinți..."
                className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition"
              >
                Adaugă
              </button>
            </form>

            {state.customDocuments.length > 0 && (
              <div className="mt-4 space-y-2">
                {state.customDocuments.map((cdoc) => (
                  <div
                    key={cdoc.id}
                    className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm"
                  >
                    <div
                      className="flex items-center gap-2.5 cursor-pointer flex-1"
                      onClick={() => toggleCustomDoc(cdoc.id)}
                    >
                      {cdoc.is_checked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className={cdoc.is_checked ? 'line-through text-slate-400' : 'text-slate-800'}>
                        {cdoc.name}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteCustomDoc(cdoc.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Șterge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personal Appointment & Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-6">
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Programarea &amp; Notițele tale (salvate local pe acest dispozitiv)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Data și ora programării:
                </label>
                <input
                  type="text"
                  value={state.appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  placeholder="Ex: Joi, 28 octombrie la ora 10:15"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Locație / Ghișeu:
                </label>
                <input
                  type="text"
                  value={state.appointmentLocation}
                  onChange={(e) => setAppointmentLocation(e.target.value)}
                  placeholder="Ex: Sediul din Mall Vitan, Ghișeul 4"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Notițe personale (chitanțe, detalii, memento-uri):
                </label>
                <textarea
                  rows={2}
                  value={state.personalNotes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Am achitat taxa de 7 lei pe Ghiseul.ro. Trebuie să vin cu proprietarul locuinței și buletinul lui..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 2: PAȘII DE URMAT --- */}
      {activeTab === 'pasi' && (
        <div className="space-y-6">
          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 text-xs sm:text-sm text-blue-900 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold">Progres pași: </span>
              <span>{stepProgress.checked} din {stepProgress.total} pași parcurși</span>
            </div>
            <div className="text-xs text-blue-700 font-semibold">
              Bifează pașii pe măsură ce înaintezi
            </div>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {procedure.steps?.map((step) => {
              const isChecked = state.checkedStepNumbers.includes(step.step_number);
              return (
                <div key={step.id || step.step_number} className="relative group">
                  {/* Step bullet / checkbox */}
                  <button
                    onClick={() => toggleStep(step.step_number)}
                    className={`absolute -left-6 sm:-left-8 top-1 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition border-2 shadow-xs ${
                      isChecked
                        ? 'bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-100'
                        : 'bg-white text-slate-700 border-slate-300 group-hover:border-blue-600 group-hover:text-blue-600'
                    }`}
                  >
                    {isChecked ? <Check className="w-3.5 h-3.5" /> : step.step_number}
                  </button>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                        Pasul {step.step_number}
                      </span>
                      {step.location_or_tool && (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{step.location_or_tool}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {step.title}
                    </h4>

                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Step pro-tip */}
                    {step.tip && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Recomandare: </span>
                          <span>{step.tip}</span>
                        </div>
                      </div>
                    )}

                    {/* External booking/portal link */}
                    {step.external_link && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <a
                          href={step.external_link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 px-3.5 py-1.5 rounded-lg shadow-xs transition"
                        >
                          <span>{step.external_link.label}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 3: TAXE & PLATĂ --- */}
      {activeTab === 'taxe' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              <span>Cuantumul taxelor legale pentru această procedură</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              Toate taxele specificate mai jos sunt verificate conform reglementărilor naționale în vigoare.
            </p>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Cost Total Estimativ
                </span>
                <div className="text-2xl font-extrabold text-emerald-900 mt-0.5">
                  {procedure.total_fee}
                </div>
              </div>
              <div className="text-xs text-emerald-700 font-medium text-right max-w-xs">
                Tarife oficiale fără adaosuri de intermediere
              </div>
            </div>

            <h4 className="font-bold text-slate-900 text-sm mb-3">Unde și cum poți achita:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <span>1. Online pe Ghișeul.ro</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Recomandat</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Fără comision, plata se confirmă instant cu cardul bancar. Poți salva chitanța în format PDF sau o poți arăta direct pe telefon la ghișeu.
                </p>
                <a
                  href="https://www.ghiseul.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                >
                  <span>Accesează Ghișeul.ro</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">
                  2. La automatele de plată SelfPay sau CEC Bank
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Disponibile în supermarketuri, stații de carburant și sedii administrative. Primești chitanță tipărită pe hârtie termică ce se anexează la dosar.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">
                  3. Casieria instituției sau Direcția de Taxe Locale
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Plată în numerar sau POS la casieria SPCLEP, DITL sau trezorerie. Atenție la programul de lucru al casieriei (adesea se închide mai devreme).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">
                  4. Internet Banking / Virament în contul Trezoreriei
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Dacă plătești prin ordin de plată, asigură-te că treci la detalii CNP-ul solicitantului și denumirea exactă a taxei.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 4: SFATURI & FAQ --- */}
      {activeTab === 'sfaturi' && (
        <div className="space-y-6">
          {procedure.faq && procedure.faq.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Întrebări frecvente și răspunsuri practice:
              </h3>
              {procedure.faq.map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-start gap-2">
                    <span className="text-blue-700 font-mono">Q:</span>
                    <span>{item.question}</span>
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 pl-6 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              Sfaturile principale sunt incluse în lista de pași și documente.
            </div>
          )}

          {procedure.pro_tips && procedure.pro_tips.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <h4 className="font-bold text-amber-950 text-base mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-700" />
                <span>Capcane și atenționări verificate:</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-amber-900">
                {procedure.pro_tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-amber-700">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT 5: SURSE OFICIALE & VERIFICARE --- */}
      {activeTab === 'surse' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
              <span>Surse Oficiale Verificate</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              ActeSimple sintetizează informațiile direct de pe portalurile oficiale ale ministerelor și direcțiilor din România.
            </p>

            <div className="space-y-3">
              {procedure.sources?.map((src) => (
                <div
                  key={src.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {src.institution_name}
                    </h4>
                    {src.notes && (
                      <p className="text-xs text-slate-500 mt-0.5">{src.notes}</p>
                    )}
                    <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verificat pe: {formatVerifiedDate(src.last_verified_at)}</span>
                    </div>
                  </div>

                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-blue-700 font-semibold text-xs border border-slate-200 transition shrink-0"
                  >
                    <span>Verifică pe site-ul oficial</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs leading-relaxed">
              <strong>Notă de transparență civică:</strong> Procedurile administrative pot suferi mici variații locale în funcție de primăria sau consiliul județean de domiciliu. Vă recomandăm să verificați întotdeauna anunțurile specifice de la ghișeul local.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
