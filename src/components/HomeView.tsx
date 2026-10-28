import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Filter,
  BarChart3,
  BookOpen,
  Hash,
} from 'lucide-react';
import { Transaction, Goal, FinancialPeriod, PeriodFilter } from '../types';
import {
  formatCurrencyBRL,
  formatDateBR,
  calculateGoalPercentages,
  calculateFinancialMetrics,
  CATEGORY_META,
} from '../utils/finance';

interface HomeViewProps {
  displayName: string;
  transactions: Transaction[];
  goals: Goal[];
  onOpenNewTransaction: (type: 'income' | 'expense') => void;
  onOpenNewGoal: () => void;
  onNavigateToTab: (tab: 'inicio' | 'movimentacoes' | 'planejamento' | 'relatorios' | 'configuracoes') => void;
  onContributeGoal: (goal: Goal) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  displayName,
  transactions,
  goals,
  onOpenNewTransaction,
  onOpenNewGoal,
  onNavigateToTab,
  onContributeGoal,
}) => {
  // Estado do Filtro de Período do Painel
  const [period, setPeriod] = useState<FinancialPeriod>('this_month');
  const [customStart, setCustomStart] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  );
  const [customEnd, setCustomEnd] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const filter: PeriodFilter = {
    period,
    startDate: period === 'custom' ? customStart : undefined,
    endDate: period === 'custom' ? customEnd : undefined,
  };

  const metrics = calculateFinancialMetrics(transactions, filter);
  const recentTransactions = transactions.slice(0, 4);
  const activeGoals = goals.filter((g) => g.status === 'active').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Saldo e Resumo do Período - Cartão de Destaque Estilo Fintech */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs relative overflow-hidden">
        {/* Sutil detalhe laranja superior */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF6B00] via-[#E85D00] to-[#FF8C38]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#707782]">
                Saldo Acumulado Total
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#159957]">
                <ShieldCheck className="w-3 h-3" /> Disponível em Caixa
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#202124] tracking-tight">
                {formatCurrencyBRL(metrics.totalAccumulatedBalance)}
              </h1>
            </div>

            <p className="text-xs text-[#707782]">
              Olá, <strong className="text-[#202124]">{displayName}</strong>! Acompanhe seu saldo e suas movimentações financeiras.
            </p>
          </div>

          {/* Ações Rápidas em Destaque */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            <button
              type="button"
              onClick={() => onOpenNewTransaction('income')}
              className="h-11 px-4 bg-[#E6F4EA] hover:bg-[#D5EEDD] text-[#159957] border border-[#C2E7CE] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <TrendingUp className="w-4 h-4 text-[#159957]" />
              <span>+ Entrada</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenNewTransaction('expense')}
              className="h-11 px-4 bg-[#F7F8FA] hover:bg-red-50 text-[#D92D20] border border-[#E7E9ED] hover:border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <TrendingDown className="w-4 h-4 text-[#D92D20]" />
              <span>+ Saída</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewGoal}
              className="h-11 px-5 bg-[#FF6B00] hover:bg-[#E85D00] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <PiggyBank className="w-4 h-4" />
              <span>+ Nova Meta</span>
            </button>
          </div>
        </div>

        {/* SELETOR DE PERÍODO DO PAINEL */}
        <div className="mt-6 pt-5 border-t border-[#E7E9ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-xs font-bold text-[#202124]">Período de Consulta:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as FinancialPeriod)}
              className="h-10 px-3 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs font-bold text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 cursor-pointer"
            >
              <option value="this_month">Este mês</option>
              <option value="last_month">Mês anterior</option>
              <option value="last_30_days">Últimos 30 dias</option>
              <option value="this_year">Este ano</option>
              <option value="custom">Período personalizado</option>
              <option value="all">Todo o histórico</option>
            </select>

            {period === 'custom' && (
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-10 px-2 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs text-[#202124]"
                />
                <span className="text-[#707782]">até</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-10 px-2 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs text-[#202124]"
                />
              </div>
            )}
          </div>
        </div>

        {/* 4 CARTÕES INFORMATIVOS DO PERÍODO SELECIONADO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 mt-2">
          {/* 1. Total de Entradas */}
          <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E7E9ED] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-[#707782]">Total de Entradas</span>
              <div className="text-base sm:text-lg font-black text-[#159957]">
                +{formatCurrencyBRL(metrics.periodIncome)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#E6F4EA] text-[#159957] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          {/* 2. Total de Saídas */}
          <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E7E9ED] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-[#707782]">Total de Saídas</span>
              <div className="text-base sm:text-lg font-black text-[#D92D20]">
                -{formatCurrencyBRL(metrics.periodExpense)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#D92D20] flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>

          {/* 3. Resultado do Período */}
          <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E7E9ED] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-[#707782]">Resultado do Período</span>
              <div
                className={`text-base sm:text-lg font-black ${
                  metrics.periodResult >= 0 ? 'text-[#159957]' : 'text-[#D92D20]'
                }`}
              >
                {metrics.periodResult >= 0 ? '+' : ''}{formatCurrencyBRL(metrics.periodResult)}
              </div>
            </div>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                metrics.periodResult >= 0 ? 'bg-[#E6F4EA] text-[#159957]' : 'bg-red-50 text-[#D92D20]'
              }`}
            >
              {metrics.periodResult >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>

          {/* 4. Quantidade de Movimentações Registradas */}
          <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E7E9ED] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-[#707782]">Movimentações</span>
              <div className="text-base sm:text-lg font-black text-[#202124]">
                {metrics.periodCount} <span className="text-xs font-normal text-[#707782]">registros</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center font-bold">
              <Hash className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Mensagem quando não houver movimentações cadastradas no período */}
        {metrics.periodCount === 0 && (
          <div className="mt-4 p-4 bg-orange-50/70 border border-orange-200/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#707782]">
            <p className="text-center sm:text-left">
              Não há movimentações financeiras cadastradas em <strong className="text-[#202124]">{metrics.periodLabel}</strong>. Comece registrando sua primeira entrada ou saída!
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onOpenNewTransaction('income')}
                className="px-3 py-1.5 bg-[#159957] hover:bg-[#128148] text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                + Entrada
              </button>
              <button
                type="button"
                onClick={() => onOpenNewTransaction('expense')}
                className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                + Saída
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Movimentações Recentes + Metas em Andamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card: Últimas Movimentações */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7E9ED] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#202124]">Histórico Recente</h3>
                <span className="text-[11px] text-[#707782]">Últimas movimentações registradas</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('movimentacoes')}
              className="text-xs font-semibold text-[#FF6B00] hover:text-[#E85D00] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#707782] space-y-2">
              <p>Nenhuma movimentação cadastrada ainda.</p>
              <button
                type="button"
                onClick={() => onOpenNewTransaction('income')}
                className="text-xs font-bold text-[#FF6B00] underline"
              >
                Cadastrar sua primeira entrada ou saída
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.map((tx) => {
                const meta = CATEGORY_META[tx.category] || CATEGORY_META.outras_despesas || CATEGORY_META.outro;
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-[#F7F8FA] hover:bg-slate-100/70 rounded-2xl border border-[#E7E9ED] flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold"
                        style={{ backgroundColor: meta.bg, color: meta.color }}
                      >
                        {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#202124] truncate">
                          {tx.description}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#707782]">
                          <span className="font-semibold">{isIncome ? 'Entrada' : 'Saída'}</span>
                          <span>•</span>
                          <span>{meta.label}</span>
                          <span>•</span>
                          <span>{formatDateBR(tx.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs sm:text-sm font-black ${
                          isIncome ? 'text-[#159957]' : 'text-[#D92D20]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrencyBRL(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card: Metas em Andamento */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7E9ED] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] text-[#159957] flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#202124]">Metas de Economia</h3>
                <span className="text-[11px] text-[#707782]">Planejamento e objetivos</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('planejamento')}
              className="text-xs font-semibold text-[#FF6B00] hover:text-[#E85D00] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ver metas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeGoals.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#707782] space-y-2">
              <p>Nenhuma meta de economia ativa no momento.</p>
              <button
                type="button"
                onClick={onOpenNewGoal}
                className="text-xs font-bold text-[#FF6B00] underline"
              >
                + Criar meta para estudos ou reserva
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((g) => {
                const { progressPercentage } = calculateGoalPercentages(
                  g.targetAmount,
                  g.currentAmount
                );

                return (
                  <div
                    key={g.id}
                    className="p-4 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-[#202124]">{g.name}</div>
                      <span className="text-xs font-black text-[#FF6B00]">
                        {progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF6B00] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#707782]">
                      <span>{formatCurrencyBRL(g.currentAmount)} de {formatCurrencyBRL(g.targetAmount)}</span>
                      <button
                        type="button"
                        onClick={() => onContributeGoal(g)}
                        className="text-[11px] font-bold text-[#159957] hover:underline cursor-pointer"
                      >
                        + Guardar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Atalho para Demonstrativos Gráficos */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7E9ED] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#202124]">
              Demonstrativos Gráficos das Finanças
            </h3>
            <p className="text-xs text-[#707782]">
              Visualize gráficos de barras (Entradas x Saídas), rosca por categoria e evolução mês a mês.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('relatorios')}
          className="h-11 px-5 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Abrir Demonstrativos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
