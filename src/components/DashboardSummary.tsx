import React from 'react';
import {
  TrendingUp,
  Target,
  PiggyBank,
  CheckCircle2,
  Plus,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrencyBRL } from '../utils/finance';

interface DashboardSummaryProps {
  displayName: string;
  totalPlanned: number;
  totalSaved: number;
  overallPercentage: number;
  activeCount: number;
  completedCount: number;
  totalGoals: number;
  onOpenNewGoal: () => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  displayName,
  totalPlanned,
  totalSaved,
  overallPercentage,
  activeCount,
  completedCount,
  totalGoals,
  onOpenNewGoal,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Welcome Card - Clean Fintech Style */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF1E7] text-[#E85D00] rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Painel financeiro pessoal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202124]">
            Olá, {displayName}!
          </h1>
          <p className="text-sm text-[#707782] leading-relaxed">
            Suas metas financeiras sob controle. Seus valores em reais são estritamente privados.
          </p>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenNewGoal}
            className="w-full sm:w-auto h-12 px-6 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-semibold text-sm rounded-2xl shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Nova meta</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid - Clean White Surfaces with 16-20px corners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Economizado */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7E9ED] shadow-xs hover:border-[#FF6B00]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#707782]">
              Total economizado
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#202124] tracking-tight">
              {formatCurrencyBRL(totalSaved)}
            </div>
            <p className="mt-1.5 text-xs text-[#707782] flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F4EA] text-[#159957]">
                {overallPercentage}%
              </span>
              <span>do planejado já guardado</span>
            </p>
          </div>
        </div>

        {/* Total Planejado */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7E9ED] shadow-xs hover:border-[#FF6B00]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#707782]">
              Total planejado
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] text-[#202124] flex items-center justify-center border border-[#E7E9ED]">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#202124] tracking-tight">
              {formatCurrencyBRL(totalPlanned)}
            </div>
            <p className="mt-1.5 text-xs text-[#707782]">
              Distribuído em <strong className="text-[#202124]">{totalGoals}</strong> {totalGoals === 1 ? 'meta' : 'metas cadastradas'}
            </p>
          </div>
        </div>

        {/* Progresso Geral */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7E9ED] shadow-xs hover:border-[#FF6B00]/40 transition-colors sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#707782]">
              Progresso geral
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] text-[#159957] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-[#202124] tracking-tight">
                {overallPercentage}%
              </span>
              <span className="text-xs font-medium text-[#707782]">
                <strong className="text-[#159957]">{completedCount}</strong> concluída{completedCount !== 1 ? 's' : ''} • {activeCount} ativa{activeCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Progress Bar (Positive Green #159957) */}
            <div className="mt-3.5 w-full bg-[#E7E9ED] h-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#159957] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, overallPercentage))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
