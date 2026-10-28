import React, { useState } from 'react';
import {
  PiggyBank,
  PieChart,
  Share2,
  Plus,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Sparkles,
  Search,
} from 'lucide-react';
import { Goal, CategoryBudget, Transaction, SharedGoalProjection } from '../types';
import { GoalCard } from './GoalCard';
import { SharedGoalsView } from './SharedGoalsView';
import { formatCurrencyBRL, CATEGORY_META } from '../utils/finance';

interface PlanningViewProps {
  goals: Goal[];
  budgets: CategoryBudget[];
  transactions: Transaction[];
  sharedGoals: SharedGoalProjection[];
  sharedLoading: boolean;
  urlInviteCode?: string;
  onOpenNewGoal: () => void;
  onOpenNewBudget: (budget?: CategoryBudget) => void;
  onContributeGoal: (goal: Goal) => void;
  onWithdrawGoal: (goal: Goal) => void;
  onShareGoal: (goal: Goal) => void;
  onHistoryGoal: (goal: Goal) => void;
  onEditGoal: (goal: Goal) => void;
  onToggleStatusGoal: (goal: Goal) => void;
  onDeleteGoal: (goal: Goal) => void;
  onRedeemInviteCode: (code: string) => Promise<void>;
}

export const PlanningView: React.FC<PlanningViewProps> = ({
  goals,
  budgets,
  transactions,
  sharedGoals,
  sharedLoading,
  urlInviteCode,
  onOpenNewGoal,
  onOpenNewBudget,
  onContributeGoal,
  onWithdrawGoal,
  onShareGoal,
  onHistoryGoal,
  onEditGoal,
  onToggleStatusGoal,
  onDeleteGoal,
  onRedeemInviteCode,
}) => {
  const [planningSubTab, setPlanningSubTab] = useState<'goals' | 'budgets' | 'shared'>('goals');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthStr)
  );

  // Calcula gastos reais por categoria este mês
  const spentByCategory = new Map<string, number>();
  for (const t of currentMonthExpenses) {
    spentByCategory.set(t.category, (spentByCategory.get(t.category) || 0) + t.amount);
  }

  // Filtro de metas
  const filteredGoals = goals.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
        ? g.status === 'completed' || g.currentAmount >= g.targetAmount
        : g.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner de Planejamento */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-3 py-1 bg-[#FFF1E7] text-[#E85D00] text-xs font-semibold rounded-full mb-1">
            Planejamento & Poupança
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
            Metas & Orçamentos
          </h1>
          <p className="text-xs text-[#707782]">
            Defina limites de gastos conscientes e crie metas para alcançar seus maiores objetivos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {planningSubTab === 'budgets' ? (
            <button
              type="button"
              onClick={() => onOpenNewBudget()}
              className="h-11 px-5 bg-[#FF6B00] hover:bg-[#E85D00] text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer justify-center flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4" />
              <span>+ Definir Orçamento</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenNewGoal}
              className="h-11 px-5 bg-[#FF6B00] hover:bg-[#E85D00] text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer justify-center flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Meta</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-navegação: Metas | Orçamentos | Compartilhadas */}
      <div className="flex items-center gap-2 border-b border-[#E7E9ED] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setPlanningSubTab('goals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            planningSubTab === 'goals'
              ? 'bg-[#FF6B00] text-white shadow-xs'
              : 'bg-white text-[#707782] hover:text-[#202124] border border-[#E7E9ED]'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Metas de Economia ({goals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setPlanningSubTab('budgets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            planningSubTab === 'budgets'
              ? 'bg-[#FF6B00] text-white shadow-xs'
              : 'bg-white text-[#707782] hover:text-[#202124] border border-[#E7E9ED]'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Tetos por Categoria ({budgets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setPlanningSubTab('shared')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            planningSubTab === 'shared'
              ? 'bg-[#FF6B00] text-white shadow-xs'
              : 'bg-white text-[#707782] hover:text-[#202124] border border-[#E7E9ED]'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Metas Compartilhadas ({sharedGoals.length})</span>
        </button>
      </div>

      {/* SUB-ABA 1: METAS DE ECONOMIA */}
      {planningSubTab === 'goals' && (
        <div className="space-y-6">
          {/* Busca e Filtros de Metas */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E7E9ED] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707782]" />
              <input
                type="text"
                placeholder="Buscar por nome da meta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs sm:text-sm text-[#202124] placeholder-[#707782]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-11 px-3.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs font-semibold text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25"
            >
              <option value="all">Todos os status</option>
              <option value="active">Em andamento</option>
              <option value="completed">Concluídas</option>
              <option value="paused">Pausadas</option>
            </select>
          </div>

          {filteredGoals.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E7E9ED] shadow-xs space-y-4">
              <div className="w-14 h-14 bg-[#FFF1E7] text-[#FF6B00] rounded-2xl flex items-center justify-center mx-auto">
                <PiggyBank className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#202124]">
                  {goals.length === 0 ? 'Nenhuma meta criada ainda' : 'Nenhuma meta encontrada'}
                </h3>
                <p className="text-xs text-[#707782] max-w-sm mx-auto">
                  Defina um objetivo para estudos, viagem escolar ou reserva financeira pessoal.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenNewGoal}
                className="h-11 px-6 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                + Criar Nova Meta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onContribute={onContributeGoal}
                  onWithdraw={onWithdrawGoal}
                  onShare={onShareGoal}
                  onHistory={onHistoryGoal}
                  onEdit={onEditGoal}
                  onToggleStatus={onToggleStatusGoal}
                  onDelete={onDeleteGoal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-ABA 2: ORÇAMENTOS POR CATEGORIA */}
      {planningSubTab === 'budgets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E7E9ED] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#202124]">
                  Orçamentos Mensais ({currentMonthStr})
                </h3>
                <p className="text-xs text-[#707782]">
                  Monitore se os gastos reais de cada categoria estão dentro do limite planejado.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenNewBudget()}
                className="h-10 px-4 bg-[#FFF1E7] text-[#FF6B00] hover:bg-[#FFE3D1] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                + Novo Teto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {budgets.map((b) => {
                const meta = CATEGORY_META[b.category] || CATEGORY_META.outro;
                const spent = spentByCategory.get(b.category) || 0;
                const percentage = b.limitAmount > 0 ? Math.round((spent / b.limitAmount) * 100) : 0;
                const isOverBudget = spent > b.limitAmount;
                const isWarning = percentage >= 80 && !isOverBudget;

                return (
                  <div
                    key={b.category}
                    className="p-5 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                          style={{ backgroundColor: meta.bg, color: meta.color }}
                        >
                          {meta.label.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#202124]">{meta.label}</div>
                          <div className="text-[11px] text-[#707782]">
                            Gasto: <strong className={isOverBudget ? 'text-[#D92D20]' : 'text-[#202124]'}>{formatCurrencyBRL(spent)}</strong> de {formatCurrencyBRL(b.limitAmount)}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenNewBudget(b)}
                        className="text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer"
                      >
                        Ajustar
                      </button>
                    </div>

                    {/* Barra de Limite */}
                    <div className="space-y-1">
                      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverBudget
                              ? 'bg-[#D92D20]'
                              : isWarning
                              ? 'bg-amber-500'
                              : 'bg-[#159957]'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            isOverBudget
                              ? 'text-[#D92D20]'
                              : isWarning
                              ? 'text-amber-600'
                              : 'text-[#159957]'
                          }`}
                        >
                          {isOverBudget ? (
                            <>
                              <AlertTriangle className="w-3 h-3" /> Teto estourado em {formatCurrencyBRL(spent - b.limitAmount)}
                            </>
                          ) : isWarning ? (
                            <>
                              <AlertTriangle className="w-3 h-3" /> Atenção: 80%+ do limite atingido
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" /> Dentro do limite planejado
                            </>
                          )}
                        </span>
                        <span className="font-bold text-[#707782]">{percentage}% utilizado</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 3: METAS COMPARTILHADAS COMIGO */}
      {planningSubTab === 'shared' && (
        <SharedGoalsView
          sharedGoals={sharedGoals}
          onRedeemCode={onRedeemInviteCode}
          loading={sharedLoading}
          initialCode={urlInviteCode}
        />
      )}
    </div>
  );
};
