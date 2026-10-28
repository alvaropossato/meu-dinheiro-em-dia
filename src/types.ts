export type GoalCategory = 
  | 'estudos'
  | 'viagem'
  | 'material_escolar'
  | 'reserva'
  | 'tecnologia'
  | 'familia'
  | 'veiculo'
  | 'outro';

export type GoalStatus = 'active' | 'paused' | 'completed';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  createdAt: string;
}

export interface Goal {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: GoalCategory;
  color: string;
  icon?: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Movement {
  id: string;
  goalId: string;
  ownerId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
}

/**
 * Movimentação financeira geral (Entradas e Saídas)
 * Armazenada com persistência offline em IndexedDB e sincronizável.
 */
export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  // Entradas solicitadas
  | 'mesada'
  | 'salario'
  | 'presentes'
  | 'vendas'
  | 'outras_receitas'
  // Saídas solicitadas
  | 'alimentacao'
  | 'transporte'
  | 'material_escolar'
  | 'lazer'
  | 'compras'
  | 'outras_despesas'
  // Compatibilidade anterior
  | 'educacao'
  | 'trabalho'
  | 'saude'
  | 'moradia'
  | 'presente'
  | 'outro';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  paymentMethod?: 'pix' | 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'transferencia' | 'outro';
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface CategoryBudget {
  category: TransactionCategory;
  limitAmount: number;
  month: string; // YYYY-MM
}

export type FinancialPeriod = 'this_month' | 'last_month' | 'last_30_days' | 'this_year' | 'custom' | 'all';

export interface PeriodFilter {
  period: FinancialPeriod;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

/**
 * Projeção pública estritamente isolada para convidados.
 * NUNCA contém targetAmount, currentAmount ou movimentações em R$.
 */
export interface SharedGoalProjection {
  id: string; // shareId
  goalId: string;
  ownerId: string;
  ownerDisplayName: string;
  publicTitle: string;
  progressPercentage: number;
  remainingPercentage: number;
  status: GoalStatus;
  encouragementMessage: string;
  inviteCode: string;
  allowedGuestEmails: string[];
  allowedGuestUids: string[];
  revoked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EducationLesson {
  id: string;
  title: string;
  tag: string;
  shortDesc: string;
  content: string[];
  keyTakeaway: string;
  practicalTip: string;
}
