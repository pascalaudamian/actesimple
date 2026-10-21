import React from 'react';
import { Procedure } from '../types.ts';
import { X, Bookmark, ChevronRight, CheckCircle2, FileText, Calendar } from 'lucide-react';

interface SavedChecklistsModalProps {
  savedItems: Array<{ procedureId: string; checkedDocsCount: number; lastUpdated: string }>;
  procedures: Procedure[];
  onSelectProcedure: (p: Procedure) => void;
  onClose: () => void;
}

export const SavedChecklistsModal: React.FC<SavedChecklistsModalProps> = ({
  savedItems,
  procedures,
  onSelectProcedure,
  onClose,
}) => {
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
              <h3 className="font-bold text-slate-900 text-base">Dosarele Mele în Lucru</h3>
              <p className="text-xs text-slate-500">Salvate automat în memoria browserului tău</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of saved */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {savedItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <p className="font-medium">Nu ai niciun dosar început încă.</p>
              <p className="text-xs text-slate-400 mt-1">
                Deschide orice procedură și bifează un act pentru a-l salva automat aici!
              </p>
            </div>
          ) : (
            savedItems.map((item) => {
              const proc = procedures.find((p) => p.id === item.procedureId);
              if (!proc) return null;

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
                      {proc.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.checkedDocsCount} acte bifate</span>
                      </span>
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
          Nu este nevoie să-ți creezi cont. Progresul rămâne salvat pe acest dispozitiv.
        </div>

      </div>
    </div>
  );
};
