import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGoalPercentages,
  createSafePublicProjection,
  calculateSummaryMetrics,
  calculateMonthlySavingsPlan,
  calculateCashFlowMetrics,
  calculateCategoryBreakdown,
  calculateFinancialMetrics,
  calculateMonthlyEvolution,
  getPeriodDateRange,
  formatCurrencyBRL,
  GoalData,
} from './finance';
import { Transaction } from '../types';

test('calculates correct percentages for R$ 500 target and R$ 200 saved', () => {
  const result = calculateGoalPercentages(500, 200);
  assert.equal(result.progressPercentage, 40);
  assert.equal(result.remainingPercentage, 60);
  assert.equal(result.isCompleted, false);
});

test('clamps progress between 0% and 100% when saved exceeds target', () => {
  const result = calculateGoalPercentages(500, 750);
  assert.equal(result.progressPercentage, 100);
  assert.equal(result.remainingPercentage, 0);
  assert.equal(result.isCompleted, true);
});

test('clamps progress to 0% if saved is negative or target is 0', () => {
  const zeroTarget = calculateGoalPercentages(0, 100);
  assert.equal(zeroTarget.progressPercentage, 0);
  assert.equal(zeroTarget.remainingPercentage, 100);

  const negativeCurrent = calculateGoalPercentages(1000, -50);
  assert.equal(negativeCurrent.progressPercentage, 0);
  assert.equal(negativeCurrent.remainingPercentage, 100);
});

test('CRITICAL SECURITY: safe public projection strictly hides monetary amounts', () => {
  const privateGoal: GoalData = {
    id: 'goal-123',
    ownerId: 'user-abc',
    name: 'Reserva de Emergência Familiar',
    description: 'Guardar 6 meses de contas',
    targetAmount: 5000,
    currentAmount: 2500,
    deadline: '2026-12-31',
    category: 'reserva',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const projection = createSafePublicProjection(
    privateGoal,
    'Mariana',
    'share-789',
    'INV-9999'
  );

  assert.equal(projection.id, 'share-789');
  assert.equal(projection.goalId, 'goal-123');
  assert.equal(projection.ownerId, 'user-abc');
  assert.equal(projection.ownerDisplayName, 'Mariana');
  assert.equal(projection.publicTitle, 'Reserva de Emergência Familiar');
  assert.equal(projection.progressPercentage, 50);
  assert.equal(projection.remainingPercentage, 50);
  assert.equal(projection.status, 'active');
  assert.match(projection.encouragementMessage, /50%/);

  const projectionKeys = Object.keys(projection);
  assert.equal(projectionKeys.includes('targetAmount'), false, 'Security violation: targetAmount exposed!');
  assert.equal(projectionKeys.includes('currentAmount'), false, 'Security violation: currentAmount exposed!');
  assert.equal(projectionKeys.includes('amount'), false, 'Security violation: amount exposed!');
  assert.equal(projectionKeys.includes('balance'), false, 'Security violation: balance exposed!');
  assert.equal(projectionKeys.includes('description'), false, 'Security violation: private description exposed!');
});

test('calculates summary metrics correctly', () => {
  const goals: GoalData[] = [
    {
      id: '1',
      ownerId: 'u1',
      name: 'Curso de Programação',
      targetAmount: 1000,
      currentAmount: 500,
      status: 'active',
      createdAt: '2026-01-01',
    },
    {
      id: '2',
      ownerId: 'u1',
      name: 'Livros Didáticos',
      targetAmount: 300,
      currentAmount: 300,
      status: 'completed',
      createdAt: '2026-01-01',
    },
  ];

  const metrics = calculateSummaryMetrics(goals);
  assert.equal(metrics.totalPlanned, 1300);
  assert.equal(metrics.totalSaved, 800);
  assert.equal(metrics.overallPercentage, 62);
  assert.equal(metrics.activeCount, 1);
  assert.equal(metrics.completedCount, 1);
});

test('REQUIRED SCENARIO: Entrada de R$ 100,00 e Saída de R$ 30,00 resulta em Saldo R$ 70,00', () => {
  const testTransactions: Transaction[] = [
    {
      id: 'tx-1',
      type: 'income',
      description: 'Mesada inicial',
      amount: 100.0,
      category: 'mesada',
      date: '2026-10-15',
      createdAt: '2026-10-15T10:00:00Z',
    },
    {
      id: 'tx-2',
      type: 'expense',
      description: 'Material de desenho',
      amount: 30.0,
      category: 'material_escolar',
      date: '2026-10-16',
      createdAt: '2026-10-16T10:00:00Z',
    },
  ];

  const metrics = calculateFinancialMetrics(testTransactions, { period: 'all' });
  assert.equal(metrics.periodIncome, 100.0);
  assert.equal(metrics.periodExpense, 30.0);
  assert.equal(metrics.periodResult, 70.0);
  assert.equal(metrics.totalAccumulatedBalance, 70.0);
  assert.equal(metrics.periodCount, 2);
});

test('differentiates accumulated balance from period result across multiple periods', () => {
  const refDate = new Date(2026, 9, 15); // Outubro 2026 (mês 9 em 0-index)

  const multiMonthTransactions: Transaction[] = [
    {
      id: 'tx-old',
      type: 'income',
      description: 'Receita de Setembro',
      amount: 500.0,
      category: 'salario',
      date: '2026-09-10',
      createdAt: '2026-09-10',
    },
    {
      id: 'tx-cur-inc',
      type: 'income',
      description: 'Receita de Outubro',
      amount: 200.0,
      category: 'mesada',
      date: '2026-10-05',
      createdAt: '2026-10-05',
    },
    {
      id: 'tx-cur-exp',
      type: 'expense',
      description: 'Despesa de Outubro',
      amount: 80.0,
      category: 'alimentacao',
      date: '2026-10-08',
      createdAt: '2026-10-08',
    },
  ];

  // Filtro "este mês" (Outubro 2026)
  const octMetrics = calculateFinancialMetrics(multiMonthTransactions, { period: 'this_month' }, refDate);
  assert.equal(octMetrics.periodIncome, 200.0);
  assert.equal(octMetrics.periodExpense, 80.0);
  assert.equal(octMetrics.periodResult, 120.0); // 200 - 80 = 120 no mês
  assert.equal(octMetrics.totalAccumulatedBalance, 620.0); // (500 + 200) - 80 = 620 no total histórico
  assert.equal(octMetrics.periodCount, 2);

  // Filtro "mês anterior" (Setembro 2026)
  const sepMetrics = calculateFinancialMetrics(multiMonthTransactions, { period: 'last_month' }, refDate);
  assert.equal(sepMetrics.periodIncome, 500.0);
  assert.equal(sepMetrics.periodExpense, 0.0);
  assert.equal(sepMetrics.periodResult, 500.0);
  assert.equal(sepMetrics.totalAccumulatedBalance, 620.0);
  assert.equal(sepMetrics.periodCount, 1);
});

test('calculates category breakdown percentages accurately for selected period', () => {
  const sampleTx: Transaction[] = [
    {
      id: 'tx-1',
      type: 'expense',
      description: 'Caderno',
      amount: 60,
      category: 'material_escolar',
      date: '2026-10-01',
      createdAt: '2026-10-01',
    },
    {
      id: 'tx-2',
      type: 'expense',
      description: 'Lanche',
      amount: 40,
      category: 'alimentacao',
      date: '2026-10-02',
      createdAt: '2026-10-02',
    },
  ];

  const breakdown = calculateCategoryBreakdown(sampleTx, { period: 'all' });
  assert.equal(breakdown.length, 2);
  assert.equal(breakdown[0].category, 'material_escolar');
  assert.equal(breakdown[0].percentage, 60);
  assert.equal(breakdown[1].category, 'alimentacao');
  assert.equal(breakdown[1].percentage, 40);
});

test('calculates monthly evolution with progressive running balance', () => {
  const refDate = new Date(2026, 9, 20); // Out/26
  const txs: Transaction[] = [
    {
      id: '1',
      type: 'income',
      description: 'Entrada Set',
      amount: 300,
      category: 'mesada',
      date: '2026-09-01',
      createdAt: '2026-09-01',
    },
    {
      id: '2',
      type: 'expense',
      description: 'Saída Set',
      amount: 100,
      category: 'lazer',
      date: '2026-09-15',
      createdAt: '2026-09-15',
    },
    {
      id: '3',
      type: 'income',
      description: 'Entrada Out',
      amount: 400,
      category: 'mesada',
      date: '2026-10-05',
      createdAt: '2026-10-05',
    },
  ];

  const evolution = calculateMonthlyEvolution(txs, 3, refDate);
  assert.equal(evolution.length, 3); // Ago, Set, Out

  const sep = evolution.find((e) => e.monthKey === '2026-09');
  assert.ok(sep);
  assert.equal(sep.income, 300);
  assert.equal(sep.expense, 100);
  assert.equal(sep.netResult, 200);

  const oct = evolution.find((e) => e.monthKey === '2026-10');
  assert.ok(oct);
  assert.equal(oct.income, 400);
  assert.equal(oct.expense, 0);
  assert.equal(oct.netResult, 400);
  assert.equal(oct.accumulatedBalance, 600); // 200 (Sep) + 400 (Oct)
});

test('formats currency in Brazilian Real pattern', () => {
  assert.equal(formatCurrencyBRL(1250.5), 'R$\u00a01.250,50');
  assert.equal(formatCurrencyBRL(0), 'R$\u00a00,00');
});
