import React from 'react';
import { Procedure } from '../types.ts';
import { Language, translations } from '../i18n/translations.ts';
import { X, Bookmark, ChevronRight, CheckCircle2, ExternalLink, FileText } from 'lucide-react';

interface SavedChecklistsModalProps {
  savedItems: Array<{ procedureId: string; checkedDocsCount: number; lastUpdated: string }>;
  procedures: Procedure[];
  onSelectProcedure: (p: Procedure) => void;
  onClose: () => void;
  lang: Language;
}

export const SavedChecklistsModal: React.FC<SavedChecklistsModalProps> = ({
  savedItems,
  procedures,
  onSelectProcedure,
  onClose,
  lang,
}) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t.myDossiers}</h3>
              <p className="text-xs text-slate-500">
                {lang === 'ro' ? 'Salvate automat în memoria browserului tău' : 'Automatically saved in your browser storage'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of saved */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {savedItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <p className="font-medium">
                {lang === 'ro' ? 'Nu ai niciun dosar început încă.' : 'You have no dossiers in progress yet.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'ro'
                  ? 'Deschide orice procedură și bifează un act pentru a-l salva automat aici!'
                  : 'Open any procedure and check a document to automatically save it here!'}
              </p>
            </div>
          ) : (
            savedItems.map((item) => {
              const proc = procedures.find((p) => p.id === item.procedureId);
              if (!proc) return null;

              const title = lang === 'en' && proc.title_en ? proc.title_en : proc.title;

              return (
                <div
                  key={item.procedureId}
                  onClick={() => {
                    onSelectProcedure(proc);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                      {proc.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-700 transition">
                      {title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {item.checkedDocsCount} {lang === 'ro' ? 'acte bifate' : 'docs checked'}
                        </span>
                      </span>
                      <span className="text-slate-400">·</span>
                      <span>{lang === 'ro' ? 'Ciornă' : 'Draft'}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" />{lang === 'ro' ? 'Documente pregătite' : 'Prepared documents'}</span>
                      {proc.officialUrl && <a href={proc.officialUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900"><ExternalLink className="w-3 h-3" />{lang === 'ro' ? 'Sursa oficială' : 'Official source'}</a>}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          {lang === 'ro'
            ? 'Nu este nevoie să-ți creezi cont. Progresul rămâne salvat pe acest dispozitiv.'
            : 'No account required. Your progress remains saved on this device.'}
        </div>

      </div>
    </div>
  );
};
