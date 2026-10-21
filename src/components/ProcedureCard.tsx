import React from 'react';
import { Procedure } from '../types.ts';
import {
  Clock,
  Coins,
  FileText,
  ShieldCheck,
  ChevronRight,
  Building2,
  CheckCircle,
} from 'lucide-react';

interface ProcedureCardProps {
  procedure: Procedure;
  onSelect: (p: Procedure) => void;
  userProgress?: {
    checked: number;
    total: number;
    percentage: number;
  };
}

export const ProcedureCard: React.FC<ProcedureCardProps> = ({
  procedure,
  onSelect,
  userProgress,
}) => {
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'usor':
        return <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Ușor</span>;
      case 'mediu':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Mediu</span>;
      case 'complex':
        return <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">Complex</span>;
      default:
        return null;
    }
  };

  const formatVerifiedDate = (dateStr: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={() => onSelect(procedure)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-5 sm:p-6 transition-all duration-200 hover:shadow-xl hover:shadow-blue-900/5 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {procedure.is_popular && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-2xs">
                Popular
              </span>
            )}
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {procedure.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {getDifficultyBadge(procedure.difficulty)}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition leading-snug">
          {procedure.title}
        </h3>
        
        <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {procedure.short_description}
        </p>

        {/* Authority note */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium">{procedure.competent_authority}</span>
        </div>

        {/* Key Quick Facts Grid */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2">
            <Coins className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">{procedure.total_fee}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2">
            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-medium truncate">{procedure.estimated_time}</span>
          </div>
        </div>
      </div>

      {/* Footer of the card */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Verification status or user progress */}
        {userProgress && userProgress.checked > 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{userProgress.checked}/{userProgress.total} acte gata ({userProgress.percentage}%)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Verificat: {formatVerifiedDate(procedure.last_verified_at)}</span>
          </div>
        )}

        <div className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 group-hover:translate-x-0.5 transition-transform">
          <span>Vezi actele</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
