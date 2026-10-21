import React, { useState } from 'react';
import { Procedure, DocumentType } from '../types.ts';
import { useChecklist } from '../hooks/useChecklist.ts';
import { Language, translations } from '../i18n/translations.ts';
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
  Globe,
  FileText,
} from 'lucide-react';

interface ProcedureDetailProps {
  procedure: Procedure;
  lang: Language;
  onBack: () => void;
  onCategoryClick?: (category: string) => void;
}

export const ProcedureDetail: React.FC<ProcedureDetailProps> = ({
  procedure,
  lang,
  onBack,
  onCategoryClick,
}) => {
  const t = translations[lang];

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

  const displayTitle = lang === 'en' && procedure.title_en ? procedure.title_en : procedure.title;
  const displayFullDesc = lang === 'en' && procedure.full_description_en ? procedure.full_description_en : (procedure.full_description || procedure.short_description);
  const displayAuthority = lang === 'en' && procedure.competent_authority_en ? procedure.competent_authority_en : procedure.competent_authority;
  const displayAuthorityNote = lang === 'en' && procedure.authority_city_note_en ? procedure.authority_city_note_en : procedure.authority_city_note;
  const displayFee = lang === 'en' && procedure.total_fee_en ? procedure.total_fee_en : procedure.total_fee;
  const displayTime = lang === 'en' && procedure.estimated_time_en ? procedure.estimated_time_en : procedure.estimated_time;
  const proTips = (lang === 'en' && procedure.pro_tips_en && procedure.pro_tips_en.length > 0) ? procedure.pro_tips_en : (procedure.pro_tips || []);

  const handleCopy = () => {
    const text = generateShareText(displayTitle);
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
    if (!dateStr) return lang === 'ro' ? 'Recent' : 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getDocTypeBadge = (type: DocumentType) => {
    switch (type) {
      case 'original':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            {lang === 'ro' ? 'Original' : 'Original'}
          </span>
        );
      case 'copie':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            {lang === 'ro' ? 'Copie xerox' : 'Photocopy'}
          </span>
        );
      case 'formular':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            {lang === 'ro' ? 'Formular tipizat' : 'Standard Form'}
          </span>
        );
      case 'dovada_plata':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {lang === 'ro' ? 'Chitanță plată' : 'Payment Receipt'}
          </span>
        );
      case 'legalizat':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            {lang === 'ro' ? 'Copie legalizată / Apostilat' : 'Notarized / Apostilled'}
          </span>
        );
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
          <span>{t.backToProcedures}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition"
            title="Copiază lista pentru WhatsApp sau Notițe"
          >
            {copiedToast ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
            <span>{copiedToast ? t.copiedToast : t.copySummaryBtn}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition"
            title="Tipărește checklist-ul pentru dosar"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{t.printDossierBtn}</span>
          </button>

          <button
            onClick={resetChecklist}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition"
            title="Resetează toate bifările pentru această procedură"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.resetChecklistBtn}</span>
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
              {lang === 'ro' ? 'Procedură Populară' : 'Popular Procedure'}
            </span>
          )}
          {procedure.is_online_available && (
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>{t.onlineAvailableTag}</span>
            </span>
          )}
          <div className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-800 border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {t.verifiedOfficial}: {formatVerifiedDate(procedure.last_verified_at)}
              {procedure.verified_by ? ` (de ${procedure.verified_by})` : ''}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          {displayTitle}
        </h1>

        {/* Translation Status Notice */}
        {lang === 'en' && !procedure.title_en && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Available in Romanian only (English translation pending legal review)</span>
              <span className="text-[11px] text-amber-800">
                This guide is provided in the original Romanian official wording. It has not yet been translated into an accredited English version.
              </span>
            </div>
          </div>
        )}

        {/* Official Romanian Legal Designation banner if in English */}
        {lang === 'en' && procedure.title_en && (
          <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
            <Building2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Official Romanian Legal Title: </span>
              <span className="font-semibold">{procedure.title}</span>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Note: Official forms, stamps, and Romanian public counters use the official Romanian title. English translations are provided for orientation.
              </p>
            </div>
          </div>
        )}

        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          {displayFullDesc}
        </p>

        {/* Civic Transparency Notice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>{lang === 'ro' ? 'Notă civică:' : 'Civic notice:'}</strong> {t.civicDisclaimer}
          </span>
        </div>

        {/* Fact badges grid */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.competentAuthority}</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900 line-clamp-2">
              {displayAuthority}
            </div>
            {displayAuthorityNote && (
              <div className="text-[11px] text-slate-500 mt-0.5">{displayAuthorityNote}</div>
            )}
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.totalFees}</span>
            </div>
            <div className="mt-1 text-sm font-bold text-emerald-700">
              {displayFee}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {lang === 'ro' ? 'Plătibil online / ghișeu' : 'Payable online / counter'}
            </div>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.estimatedTime}</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {displayTime}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {lang === 'ro' ? 'De la depunerea dosarului' : 'From dossier submission'}
            </div>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.documentsToPrepare}</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {procedure.documents?.length || 0} {lang === 'ro' ? 'documente' : 'documents'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {procedure.steps?.length || 0} {lang === 'ro' ? 'pași de parcurs' : 'steps to complete'}
            </div>
          </div>
        </div>

        {/* Conditions & Exceptions */}
        {((procedure.conditions && procedure.conditions.length > 0) ||
          (procedure.exceptions && procedure.exceptions.length > 0)) && (
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            {procedure.conditions && procedure.conditions.length > 0 && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <h4 className="font-bold text-blue-950 text-sm mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>{lang === 'ro' ? 'Condiții de eligibilitate:' : 'Eligibility Conditions:'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-blue-900">
                  {((lang === 'en' && procedure.conditions_en && procedure.conditions_en.length > 0)
                    ? procedure.conditions_en
                    : procedure.conditions
                  ).map((cond, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-blue-600">✓</span>
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {procedure.exceptions && procedure.exceptions.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                <h4 className="font-bold text-rose-950 text-sm mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>{lang === 'ro' ? 'Excepții & cazuri particulare:' : 'Exceptions & Derogations:'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-rose-900">
                  {((lang === 'en' && procedure.exceptions_en && procedure.exceptions_en.length > 0)
                    ? procedure.exceptions_en
                    : procedure.exceptions
                  ).map((ex, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-rose-600">•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Pro-tips callout banner */}
        {proTips.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-950 mb-1.5">
              <Lightbulb className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{t.proTipTitle}</span>
            </div>
            <ul className="text-xs sm:text-sm space-y-1 list-disc list-inside text-amber-900 font-medium">
              {proTips.map((tip, idx) => (
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
                {t.personalChecklistTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.checklistProgressText.replace('{checked}', String(docProgress.checked)).replace('{total}', String(docProgress.total))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={checkAllDocs}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
            >
              {t.checkAllDocsBtn}
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
            <span>{t.dossierCompleteNotice}</span>
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
            <span>{t.tabDocs} ({procedure.documents?.length || 0})</span>
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
            <span>{t.tabSteps} ({procedure.steps?.length || 0})</span>
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
            <span>{t.tabFees}</span>
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
            <span>{t.tabFaq}</span>
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
            <span>{t.tabSources}</span>
          </button>
        </nav>
      </div>

      {/* --- TAB CONTENT 1: DOCUMENTE & CHECKLIST --- */}
      {activeTab === 'documente' && (
        <div className="space-y-6">
          {/* Sub-filter pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium px-2">{t.docFilterLabel}</span>
              <button
                onClick={() => setDocFilter('toate')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  docFilter === 'toate'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.docFilterAll} ({procedure.documents?.length || 0})
              </button>
              <button
                onClick={() => setDocFilter('obligatorii')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  docFilter === 'obligatorii'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.docFilterMandatory}
              </button>
              <button
                onClick={() => setDocFilter('ramase')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  docFilter === 'ramase'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.docFilterPending} ({procedure.documents.length - state.checkedDocumentIds.length})
              </button>
            </div>

            <div className="text-xs text-slate-500 italic pr-2">
              💡 {t.docTipCheck}
            </div>
          </div>

          {/* Documents list */}
          <div className="space-y-3">
            {filteredDocs.map((doc, idx) => {
              const isChecked = state.checkedDocumentIds.includes(doc.id);
              const docName = lang === 'en' && doc.name_en ? doc.name_en : doc.name;
              const docDesc = lang === 'en' && doc.description_en ? doc.description_en : doc.description;
              const docWhere = lang === 'en' && doc.where_to_get_en ? doc.where_to_get_en : doc.where_to_get;

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
                          {t.mandatoryBadge}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {t.optionalBadge}
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-base font-bold transition leading-snug ${
                        isChecked ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {docName}
                    </h4>

                    {/* Show Romanian title as sub-note if in English */}
                    {lang === 'en' && doc.name_en && (
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        RO: {doc.name}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {docDesc}
                    </p>

                    {/* Where to get note */}
                    {docWhere && (
                      <div className="mt-2 text-xs text-blue-900 bg-blue-50/80 px-2.5 py-1.5 rounded-lg inline-block border border-blue-100">
                        <strong>{t.whereToGetLabel}</strong> {docWhere}
                      </div>
                    )}

                    {/* Downloadable official form button */}
                    {doc.download_url && (
                      <div className="mt-3 pt-2">
                        <a
                          href={doc.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{doc.download_label || t.downloadFormBtn}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom document adder */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl mt-6 print:hidden">
            <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-700" />
              <span>{t.addCustomDocTitle}</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              {t.addCustomDocSub}
            </p>

            <form onSubmit={handleAddCustomDoc} className="flex gap-2">
              <input
                type="text"
                value={newCustomDocName}
                onChange={(e) => setNewCustomDocName(e.target.value)}
                placeholder={t.addCustomDocPlaceholder}
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={!newCustomDocName.trim()}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition shrink-0"
              >
                {t.addCustomDocBtn}
              </button>
            </form>

            {/* Custom documents list */}
            {state.customDocuments.length > 0 && (
              <div className="mt-4 space-y-2 pt-3 border-t border-slate-200">
                {state.customDocuments.map((cd) => (
                  <div
                    key={cd.id}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs"
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1"
                      onClick={() => toggleCustomDoc(cd.id)}
                    >
                      {cd.is_checked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                      )}
                      <span className={cd.is_checked ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'}>
                        {cd.name}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteCustomDoc(cd.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition"
                      title="Șterge documentul din listă"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Appointment & Notes Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl mt-6 print:hidden">
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{t.personalNotesTitle}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.appointmentDateLabel}
                </label>
                <input
                  type="text"
                  value={state.appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  placeholder={t.appointmentDatePlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  {t.appointmentLocationLabel}
                </label>
                <input
                  type="text"
                  value={state.appointmentLocation}
                  onChange={(e) => setAppointmentLocation(e.target.value)}
                  placeholder={t.appointmentLocationPlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="mt-3 text-xs">
              <label className="block text-slate-500 font-semibold mb-1">
                {t.personalNotesLabel}
              </label>
              <textarea
                value={state.personalNotes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.personalNotesPlaceholder}
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 2: PAȘII DE URMAT --- */}
      {activeTab === 'pasi' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-xs text-blue-900">
            <span>
              <strong>{t.stepProgressLabel}</strong> {stepProgress.checked} din {stepProgress.total} pași finalizați.
            </span>
          </div>

          <div className="space-y-4">
            {(procedure.steps || []).map((step) => {
              const isChecked = state.checkedStepNumbers.includes(step.step_number);
              const stepTitle = lang === 'en' && step.title_en ? step.title_en : step.title;
              const stepDesc = lang === 'en' && step.description_en ? step.description_en : step.description;
              const stepTip = lang === 'en' && step.tip_en ? step.tip_en : step.tip;

              return (
                <div
                  key={step.id}
                  onClick={() => toggleStep(step.step_number)}
                  className={`p-5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start gap-4 ${
                    isChecked
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Step counter button */}
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition ${
                        isChecked
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isChecked ? <Check className="w-4 h-4" /> : step.step_number}
                    </div>
                  </div>

                  {/* Step text */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-base font-bold ${
                        isChecked ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {stepTitle}
                    </h4>

                    {/* Step description */}
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {stepDesc}
                    </p>

                    {/* Location or tool note */}
                    {step.location_or_tool && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{step.location_or_tool}</span>
                      </div>
                    )}

                    {/* Practical tip */}
                    {stepTip && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>{t.stepTipRecommendation}</strong> {stepTip}
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
                          onClick={(e) => e.stopPropagation()}
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
              <span>{t.feesExplanationTitle}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              {t.feesExplanationSub}
            </p>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {t.totalEstimatedCost}
                </span>
                <div className="text-2xl font-extrabold text-emerald-900 mt-0.5">
                  {displayFee}
                </div>
              </div>
              <div className="text-xs text-emerald-700 font-medium text-right max-w-xs">
                {lang === 'ro' ? 'Tarife oficiale stabilite prin acte normative' : 'Official statutory tariffs established by law'}
              </div>
            </div>

            <h4 className="font-bold text-slate-900 text-sm mb-3">{t.feesOfficialNotice}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <span>1. Online pe Ghișeul.ro</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                    {lang === 'ro' ? 'Recomandat' : 'Recommended'}
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {lang === 'ro'
                    ? 'Fără comision, plata se confirmă instant cu cardul bancar. Poți salva chitanța în format PDF sau o poți arăta direct pe telefon.'
                    : 'Zero commission, instant payment with any card. You can save the PDF receipt or show it on your mobile.'}
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
                  2. {lang === 'ro' ? 'La CEC Bank sau Trezoreria Statului' : 'At CEC Bank or State Treasury'}
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {lang === 'ro'
                    ? 'Pentru taxele consulare IGI și MAE, chitanțele emise de Trezorerie sau CEC Bank se anexează în original la dosar.'
                    : 'For IGI immigration and MAE fees, Treasury or CEC Bank original bank counter receipts are attached to dossier.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">
                  3. {lang === 'ro' ? 'Automatele de plată SelfPay' : 'SelfPay Payment Terminals'}
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {lang === 'ro'
                    ? 'Disponibile în supermarketuri și centre comerciale. Se eliberează chitanță tipărită acceptată la ghișeu.'
                    : 'Available in malls and supermarkets across Romania. Issues printed receipt accepted at counters.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">
                  4. {lang === 'ro' ? 'Internet Banking (Ordin de plată)' : 'Internet Banking Transfer'}
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {lang === 'ro'
                    ? 'Virament în contul IBAN al Trezoreriei Municipiului/Județului. Menționează obligatoriu CNP-ul solicitantului.'
                    : 'Direct IBAN transfer to State Treasury account. Always state the applicant personal CNP in details.'}
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
                {lang === 'ro' ? 'Întrebări frecvente și răspunsuri practice:' : 'Frequently asked questions & practical advice:'}
              </h3>
              {procedure.faq.map((item, idx) => {
                const q = lang === 'en' && item.question_en ? item.question_en : item.question;
                const a = lang === 'en' && item.answer_en ? item.answer_en : item.answer;

                return (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-start gap-2">
                      <span className="text-blue-700 font-mono">Q:</span>
                      <span>{q}</span>
                    </h4>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 pl-6 leading-relaxed">
                      {a}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              {lang === 'ro' ? 'Sfaturile principale sunt incluse în lista de pași și documente.' : 'Key guidelines are integrated inside the steps and document checklists.'}
            </div>
          )}

          {proTips.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <h4 className="font-bold text-amber-950 text-base mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-700" />
                <span>{lang === 'ro' ? 'Capcane și atenționări verificate:' : 'Verified pitfalls and key caveats:'}</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-amber-900">
                {proTips.map((tip, idx) => (
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

      {/* --- TAB CONTENT 5: SURSE OFICIALE & VERIFICARE (RIGOROUS CIVIC COMPLIANCE) --- */}
      {activeTab === 'surse' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
              <span>{t.sourcesTitle}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              {t.sourcesSub}
            </p>

            <div className="space-y-4">
              {procedure.sources?.map((src) => {
                const issuing = src.issuing_institution || src.institution_name;
                const srcLangBadge = src.source_language === 'multilingual'
                  ? 'RO / EN / EU'
                  : src.source_language === 'en'
                  ? 'English'
                  : 'Română';

                return (
                  <div
                    key={src.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                          {srcLangBadge}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {issuing}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-base">
                        {src.institution_name}
                      </h4>

                      {src.notes && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{src.notes}</p>
                      )}

                      {/* Verification Audit Dates */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>
                            <strong>{lang === 'ro' ? 'Ultima consultare:' : 'Last consulted:'}</strong>{' '}
                            {formatVerifiedDate(src.last_consulted_at || src.last_verified_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            <strong>{lang === 'ro' ? 'Verificare editorială:' : 'Editorial verification:'}</strong>{' '}
                            {formatVerifiedDate(src.editorial_verified_at || src.last_verified_at)}
                          </span>
                        </div>
                        <div className="col-span-full text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5 mt-0.5">
                          <span>
                            <strong>{lang === 'ro' ? 'Verificator:' : 'Verifier:'}</strong> {src.verified_by || procedure.verified_by || (lang === 'ro' ? 'Specialist ActeSimple' : 'ActeSimple Specialist')}
                          </span>
                          <span className="text-emerald-700 font-semibold">
                            ✓ {src.verification_result || (lang === 'ro' ? 'Conformitate legală validată' : 'Legally validated')}
                          </span>
                        </div>
                      </div>

                      {/* URL display */}
                      <div className="mt-2 text-[11px] text-slate-400 font-mono truncate">
                        {src.url}
                      </div>
                    </div>

                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition shrink-0"
                    >
                      <span>{t.checkOfficialSiteBtn}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs leading-relaxed">
              <strong>{lang === 'ro' ? 'Notă de transparență civică:' : 'Civic transparency note:'}</strong>{' '}
              {t.legalDisclaimerBottom}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
