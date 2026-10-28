/**
 * Funções puras de cálculo financeiro, projeções e demonstrativos gráficos.
 * Totalmente desacopladas de UI e Firebase para permitir testes unitários rigorosos.
 */

import { Transaction, TransactionCategory, FinancialPeriod, PeriodFilter } from '../types';

export interface GoalData {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
  color?: string;
  icon?: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

export interface GoalPercentages {
  progressPercentage: number;
  remainingPercentage: number;
  isCompleted: boolean;
}

export interface SafePublicProjection {
  id: string;
  goalId: string;
  ownerId: string;
  ownerDisplayName: string;
  publicTitle: string;
  progressPercentage: number;
  remainingPercentage: number;
  status: 'active' | 'paused' | 'completed';
  encouragementMessage: string;
  inviteCode: string;
  allowedGuestEmails: string[];
  allowedGuestUids: string[];
  revoked: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_META: Record<
  TransactionCategory,
  { label: string; color: string; bg: string; icon: string; defaultType: 'income' | 'expense' }
> = {
  // Entradas
  mesada: { label: 'Mesada', color: '#159957', bg: '#E6F4EA', icon: 'HandCoins', defaultType: 'income' },
  salario: { label: 'Salário Fictício / Bolsa', color: '#059669', bg: '#ECFDF5', icon: 'Briefcase', defaultType: 'income' },
  presentes: { label: 'Presentes em Dinheiro', color: '#9333EA', bg: '#FAF5FF', icon: 'Gift', defaultType: 'income' },
  presente: { label: 'Presentes em Dinheiro', color: '#9333EA', bg: '#FAF5FF', icon: 'Gift', defaultType: 'income' },
  vendas: { label: 'Vendas & Empreendedorismo', color: '#D97706', bg: '#FEF3C7', icon: 'TrendingUp', defaultType: 'income' },
  trabalho: { label: 'Vendas / Pequenos Serviços', color: '#D97706', bg: '#FEF3C7', icon: 'Briefcase', defaultType: 'income' },
  outras_receitas: { label: 'Outras Receitas', color: '#0D9488', bg: '#F0FDFA', icon: 'PlusCircle', defaultType: 'income' },

  // Saídas
  alimentacao: { label: 'Alimentação & Lanche', color: '#FF6B00', bg: '#FFF1E7', icon: 'Utensils', defaultType: 'expense' },
  transporte: { label: 'Transporte & Ônibus', color: '#2563EB', bg: '#EFF6FF', icon: 'Bus', defaultType: 'expense' },
  material_escolar: { label: 'Material Escolar & Livros', color: '#7C3AED', bg: '#F5F3FF', icon: 'BookOpen', defaultType: 'expense' },
  lazer: { label: 'Lazer & Passeios', color: '#DB2777', bg: '#FDF2F8', icon: 'Smile', defaultType: 'expense' },
  compras: { label: 'Compras & Vestuário', color: '#EA580C', bg: '#FFF7ED', icon: 'ShoppingBag', defaultType: 'expense' },
  outras_despesas: { label: 'Outras Despesas', color: '#6B7280', bg: '#F9FAFB', icon: 'Tag', defaultType: 'expense' },
  educacao: { label: 'Cursos & Atividades', color: '#0284C7', bg: '#F0F9FF', icon: 'GraduationCap', defaultType: 'expense' },
  saude: { label: 'Saúde & Bem-estar', color: '#DC2626', bg: '#FEF2F2', icon: 'HeartPulse', defaultType: 'expense' },
  moradia: { label: 'Contas da Casa', color: '#4B5563', bg: '#F3F4F6', icon: 'Home', defaultType: 'expense' },
  outro: { label: 'Outras Movimentações', color: '#6B7280', bg: '#F9FAFB', icon: 'Tag', defaultType: 'expense' },
};

/**
 * Formata valores monetários no padrão Real Brasileiro (pt-BR), ex: "R$ 1.250,50".
 */
export function formatCurrencyBRL(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formata data no formato brasileiro dd/mm/aaaa
 */
export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Retorna as datas de início e fim para cada filtro de período.
 */
export function getPeriodDateRange(filter: PeriodFilter, refDate = new Date()): {
  startDate: string;
  endDate: string;
  label: string;
} {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth();

  switch (filter.period) {
    case 'this_month': {
      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 0);
      return {
        startDate: toISO(start),
        endDate: toISO(end),
        label: 'Este mês',
      };
    }
    case 'last_month': {
      const start = new Date(currentYear, currentMonth - 1, 1);
      const end = new Date(currentYear, currentMonth, 0);
      return {
        startDate: toISO(start),
        endDate: toISO(end),
        label: 'Mês anterior',
      };
    }
    case 'last_30_days': {
      const start = new Date(refDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        startDate: toISO(start),
        endDate: toISO(refDate),
        label: 'Últimos 30 dias',
      };
    }
    case 'this_year': {
      const start = new Date(currentYear, 0, 1);
      const end = new Date(currentYear, 11, 31);
      return {
        startDate: toISO(start),
        endDate: toISO(end),
        label: `Este ano (${currentYear})`,
      };
    }
    case 'custom': {
      return {
        startDate: filter.startDate || '1970-01-01',
        endDate: filter.endDate || '2099-12-31',
        label: filter.startDate && filter.endDate ? `${formatDateBR(filter.startDate)} até ${formatDateBR(filter.endDate)}` : 'Período personalizado',
      };
    }
    case 'all':
    default: {
      return {
        startDate: '1970-01-01',
        endDate: '2099-12-31',
        label: 'Todo o histórico',
      };
    }
  }
}

/**
 * Verifica se a data da movimentação está dentro do período selecionado.
 */
export function isDateInPeriod(dateStr: string, filter: PeriodFilter, refDate = new Date()): boolean {
  if (filter.period === 'all') return true;
  const range = getPeriodDateRange(filter, refDate);
  const cleanDate = dateStr.slice(0, 10);
  return cleanDate >= range.startDate && cleanDate <= range.endDate;
}

/**
 * CÁLCULO COMPLETO DE SALDO E INDICADORES FINANCEIROS:
 * - Total de entradas do período selecionado
 * - Total de saídas do período selecionado
 * - Saldo do período (entradas período - saídas período)
 * - Saldo acumulado (total histórico de entradas - total histórico de saídas)
 * - Quantidade de movimentações no período
 */
export interface FinancialMetricsResult {
  periodIncome: number;
  periodExpense: number;
  periodResult: number;
  periodCount: number;
  totalAccumulatedIncome: number;
  totalAccumulatedExpense: number;
  totalAccumulatedBalance: number;
  totalHistoryCount: number;
  savingsRate: number;
  periodLabel: string;
}

export function calculateFinancialMetrics(
  transactions: Transaction[],
  filter: PeriodFilter = { period: 'this_month' },
  refDate = new Date()
): FinancialMetricsResult {
  let periodIncome = 0;
  let periodExpense = 0;
  let periodCount = 0;

  let totalAccumulatedIncome = 0;
  let totalAccumulatedExpense = 0;

  for (const tx of transactions) {
    const val = typeof tx.amount === 'number' && !isNaN(tx.amount) ? Math.max(0, tx.amount) : 0;
    const isIncome = tx.type === 'income';

    // Acumulado histórico total
    if (isIncome) {
      totalAccumulatedIncome += val;
    } else {
      totalAccumulatedExpense += val;
    }

    // Filtrado pelo período selecionado
    if (isDateInPeriod(tx.date, filter, refDate)) {
      periodCount++;
      if (isIncome) {
        periodIncome += val;
      } else {
        periodExpense += val;
      }
    }
  }

  const periodResult = Math.round((periodIncome - periodExpense) * 100) / 100;
  const totalAccumulatedBalance = Math.round((totalAccumulatedIncome - totalAccumulatedExpense) * 100) / 100;
  const savingsRate = periodIncome > 0 ? Math.max(0, Math.round(((periodIncome - periodExpense) / periodIncome) * 100)) : 0;

  const range = getPeriodDateRange(filter, refDate);

  return {
    periodIncome: Math.round(periodIncome * 100) / 100,
    periodExpense: Math.round(periodExpense * 100) / 100,
    periodResult,
    periodCount,
    totalAccumulatedIncome: Math.round(totalAccumulatedIncome * 100) / 100,
    totalAccumulatedExpense: Math.round(totalAccumulatedExpense * 100) / 100,
    totalAccumulatedBalance,
    totalHistoryCount: transactions.length,
    savingsRate,
    periodLabel: range.label,
  };
}

/**
 * Agrupa despesas por categoria com percentuais e valores em R$ para o período selecionado.
 */
export interface CategorySpending {
  category: TransactionCategory;
  label: string;
  color: string;
  bg: string;
  total: number;
  percentage: number;
  count: number;
}

export function calculateCategoryBreakdown(
  transactions: Transaction[],
  filter?: PeriodFilter,
  refDate = new Date()
): CategorySpending[] {
  const filtered = filter
    ? transactions.filter((t) => t.type === 'expense' && isDateInPeriod(t.date, filter, refDate))
    : transactions.filter((t) => t.type === 'expense');

  const totalExpense = filtered.reduce((acc, t) => acc + (t.amount || 0), 0);
  const map = new Map<TransactionCategory, { total: number; count: number }>();

  for (const t of filtered) {
    const prev = map.get(t.category) || { total: 0, count: 0 };
    map.set(t.category, {
      total: prev.total + (t.amount || 0),
      count: prev.count + 1,
    });
  }

  const results: CategorySpending[] = [];

  for (const [cat, data] of map.entries()) {
    const meta = CATEGORY_META[cat] || CATEGORY_META.outras_despesas || CATEGORY_META.outro;
    const percentage = totalExpense > 0 ? Math.round((data.total / totalExpense) * 100) : 0;
    results.push({
      category: cat,
      label: meta.label,
      color: meta.color,
      bg: meta.bg,
      total: Math.round(data.total * 100) / 100,
      percentage,
      count: data.count,
    });
  }

  return results.sort((a, b) => b.total - a.total);
}

/**
 * CÁLCULO DE EVOLUÇÃO FINANCEIRA MÊS A MÊS (Gráfico 3):
 * Gera dados mensais com Entradas, Saídas e Saldo Acumulado.
 */
export interface MonthlyEvolutionPoint {
  monthKey: string;     // YYYY-MM
  monthLabel: string;   // Ex: "Out/25"
  income: number;
  expense: number;
  netResult: number;
  accumulatedBalance: number;
}

export function calculateMonthlyEvolution(
  transactions: Transaction[],
  monthsCount = 6,
  refDate = new Date()
): MonthlyEvolutionPoint[] {
  const months: MonthlyEvolutionPoint[] = [];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // Gera os últimos N meses em ordem cronológica
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const key = `${y}-${m}`;
    const label = `${monthNames[d.getMonth()]}/${y.toString().slice(-2)}`;

    months.push({
      monthKey: key,
      monthLabel: label,
      income: 0,
      expense: 0,
      netResult: 0,
      accumulatedBalance: 0,
    });
  }

  // Ordena transações por data
  const sortedTx = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calcula totais de cada mês
  for (const tx of sortedTx) {
    const txMonth = tx.date.slice(0, 7);
    const monthPoint = months.find((m) => m.monthKey === txMonth);
    if (monthPoint) {
      if (tx.type === 'income') {
        monthPoint.income += tx.amount;
      } else {
        monthPoint.expense += tx.amount;
      }
    }
  }

  // Calcula saldo acumulado progressivo
  let runningBalance = 0;
  for (const m of months) {
    m.income = Math.round(m.income * 100) / 100;
    m.expense = Math.round(m.expense * 100) / 100;
    m.netResult = Math.round((m.income - m.expense) * 100) / 100;
    runningBalance += m.netResult;
    m.accumulatedBalance = Math.round(runningBalance * 100) / 100;
  }

  return months;
}

/**
 * Mantém retrocompatibilidade para cashflow direto.
 */
export function calculateCashFlowMetrics(transactions: Transaction[]) {
  const res = calculateFinancialMetrics(transactions, { period: 'all' });
  return {
    totalIncome: res.totalAccumulatedIncome,
    totalExpense: res.totalAccumulatedExpense,
    balance: res.totalAccumulatedBalance,
    savingsRate: res.savingsRate,
  };
}

/**
 * Calcula os percentuais atingidos e restantes de uma meta.
 * Clampa entre 0% e 100%.
 */
export function calculateGoalPercentages(targetAmount: number, currentAmount: number): GoalPercentages {
  if (typeof targetAmount !== 'number' || isNaN(targetAmount) || targetAmount <= 0) {
    return {
      progressPercentage: 0,
      remainingPercentage: 100,
      isCompleted: false,
    };
  }

  const safeCurrent = Math.max(0, typeof currentAmount === 'number' && !isNaN(currentAmount) ? currentAmount : 0);
  const rawProgress = (safeCurrent / targetAmount) * 100;
  
  const progressClamped = Math.min(100, Math.max(0, rawProgress));
  const progressPercentage = Math.round(progressClamped * 10) / 10;
  const remainingPercentage = Math.round((100 - progressPercentage) * 10) / 10;
  const isCompleted = progressPercentage >= 100;

  return {
    progressPercentage,
    remainingPercentage,
    isCompleted,
  };
}

/**
 * Gera mensagem amigável de progresso.
 */
export function getEncouragementMessage(progressPercentage: number, remainingPercentage: number): string {
  if (progressPercentage >= 100) {
    return 'Meta 100% concluída! Uma grande conquista para a organização financeira!';
  }
  if (progressPercentage >= 80) {
    return `Reta final! Faltam apenas ${remainingPercentage}% para atingir esta conquista!`;
  }
  if (progressPercentage >= 50) {
    return `Mais da metade do caminho! Faltam ${remainingPercentage}% para a conclusão da meta.`;
  }
  if (progressPercentage >= 25) {
    return `Bom ritmo de economia! Faltam ${remainingPercentage}% para atingir o objetivo.`;
  }
  return `Você está acompanhando esta meta! Faltam ${remainingPercentage}% para atingir este objetivo.`;
}

/**
 * Projeção segura de meta para convidados (SEM valores em R$).
 */
export function createSafePublicProjection(
  goal: GoalData,
  ownerDisplayName: string,
  shareId: string,
  inviteCode: string,
  options?: {
    customPublicTitle?: string;
    allowedGuestEmails?: string[];
    allowedGuestUids?: string[];
    createdAt?: string;
  }
): SafePublicProjection {
  const { progressPercentage, remainingPercentage, isCompleted } = calculateGoalPercentages(
    goal.targetAmount,
    goal.currentAmount
  );

  const publicTitle = (options?.customPublicTitle || goal.name || 'Meta').trim().slice(0, 120);
  const now = new Date().toISOString();

  return {
    id: shareId,
    goalId: goal.id,
    ownerId: goal.ownerId,
    ownerDisplayName: (ownerDisplayName || 'Amigo(a)').trim().slice(0, 80),
    publicTitle,
    progressPercentage,
    remainingPercentage,
    status: isCompleted ? 'completed' : goal.status,
    encouragementMessage: getEncouragementMessage(progressPercentage, remainingPercentage),
    inviteCode: inviteCode || '',
    allowedGuestEmails: options?.allowedGuestEmails || [],
    allowedGuestUids: options?.allowedGuestUids || [],
    revoked: false,
    createdAt: options?.createdAt || now,
    updatedAt: now,
  };
}

/**
 * Métricas resumidas de metas.
 */
export function calculateSummaryMetrics(goals: GoalData[]) {
  const totalPlanned = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const overallPercentage = totalPlanned > 0 ? Math.min(100, Math.round((totalSaved / totalPlanned) * 100)) : 0;
  
  const activeCount = goals.filter((g) => g.status === 'active').length;
  const completedCount = goals.filter((g) => g.status === 'completed' || g.currentAmount >= g.targetAmount).length;
  const pausedCount = goals.filter((g) => g.status === 'paused').length;

  return {
    totalPlanned,
    totalSaved,
    overallPercentage,
    activeCount,
    completedCount,
    pausedCount,
    totalGoals: goals.length,
  };
}

/**
 * Simulador de economia mensal necessária para atingir uma meta.
 */
export function calculateMonthlySavingsPlan(targetAmount: number, currentAmount: number, deadlineDateStr?: string) {
  const remainingValue = Math.max(0, targetAmount - currentAmount);
  if (remainingValue === 0) {
    return { monthsRemaining: 0, monthlyNeed: 0, isTargetMet: true };
  }

  if (!deadlineDateStr) {
    return { monthsRemaining: null, monthlyNeed: null, isTargetMet: false };
  }

  const deadline = new Date(deadlineDateStr);
  const today = new Date();
  
  if (isNaN(deadline.getTime())) {
    return { monthsRemaining: null, monthlyNeed: null, isTargetMet: false };
  }

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const monthsRemaining = Math.max(1, Math.ceil(diffDays / 30));
  const monthlyNeed = Math.round((remainingValue / monthsRemaining) * 100) / 100;

  return {
    monthsRemaining,
    monthlyNeed,
    isTargetMet: false,
  };
}
