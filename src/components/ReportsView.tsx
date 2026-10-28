import React, { useState } from 'react';
import {
  PieChart,
  BarChart3,
  LineChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  ShieldCheck,
  Lightbulb,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Transaction, FinancialPeriod, PeriodFilter } from '../types';
import {
  calculateFinancialMetrics,
  calculateCategoryBreakdown,
  calculateMonthlyEvolution,
  formatCurrencyBRL,
  formatDateBR,
  CATEGORY_META,
} from '../utils/finance';

interface ReportsViewProps {
  transactions: Transaction[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ transactions }) => {
  const [period, setPeriod] = useState<FinancialPeriod>('this_month');
  const [customStart, setCustomStart] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  );
  const [customEnd, setCustomEnd] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filter: PeriodFilter = {
    period,
    startDate: period === 'custom' ? customStart : undefined,
    endDate: period === 'custom' ? customEnd : undefined,
  };

  const metrics = calculateFinancialMetrics(transactions, filter);
  const breakdown = calculateCategoryBreakdown(transactions, filter);
  const monthlyEvolution = calculateMonthlyEvolution(transactions, 6);

  // --- CÁLCULOS DO GRÁFICO 1: BARRAS (Entradas x Saídas) ---
  const maxBarValue = Math.max(metrics.periodIncome, metrics.periodExpense, 1);
  const incomeHeightPercent = Math.round((metrics.periodIncome / maxBarValue) * 100);
  const expenseHeightPercent = Math.round((metrics.periodExpense / maxBarValue) * 100);

  // --- CÁLCULOS DO GRÁFICO 2: ROSCA (Despesas por Categoria) ---
  let accumulatedAngle = 0;
  const radius = 68;
  const strokeWidth = 24;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  const slices = breakdown.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle;
    accumulatedAngle += (item.percentage / 100) * circumference;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // --- CÁLCULOS DO GRÁFICO 3: LINHAS (Evolução Financeira) ---
  // Acha os valores máximos e mínimos para escalar o gráfico de linhas
  const allEvolutionValues = monthlyEvolution.flatMap((m) => [m.income, m.expense, m.accumulatedBalance]);
  const maxLineVal = Math.max(...allEvolutionValues, 100);
  const minLineVal = Math.min(...allEvolutionValues, 0);
  const valRange = maxLineVal - minLineVal || 1;

  const svgWidth = 560;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const getCoordinates = (val: number, index: number, total: number) => {
    const x = paddingX + (index / (total - 1 || 1)) * plotWidth;
    const y = svgHeight - paddingY - ((val - minLineVal) / valRange) * plotHeight;
    return { x, y };
  };

  // Pontos das 3 linhas
  const incomePoints = monthlyEvolution.map((m, i) => getCoordinates(m.income, i, monthlyEvolution.length));
  const expensePoints = monthlyEvolution.map((m, i) => getCoordinates(m.expense, i, monthlyEvolution.length));
  const balancePoints = monthlyEvolution.map((m, i) => getCoordinates(m.accumulatedBalance, i, monthlyEvolution.length));

  const toSvgPath = (points: { x: number; y: number }[]) => {
    return points.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, '');
  };

  const incomePath = toSvgPath(incomePoints);
  const expensePath = toSvgPath(expensePoints);
  const balancePath = toSvgPath(balancePoints);

  const topSpendingCategory = breakdown[0];

  return (
    <div className="space-y-6">
      {/* Header com Seletor de Período Integrado */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 bg-[#FFF1E7] text-[#E85D00] text-xs font-semibold rounded-full mb-1">
              Demonstrativos Visuais
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
              Relatórios Financeiros & Gráficos
            </h1>
            <p className="text-xs text-[#707782]">
              Acompanhe a comparação de entradas e saídas, distribuição por categoria e evolução mês a mês.
            </p>
          </div>

          {/* Seletor de Período */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as FinancialPeriod)}
              className="h-11 px-3.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs font-bold text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 cursor-pointer"
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
                  className="h-11 px-2.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs text-[#202124]"
                />
                <span className="text-[#707782]">até</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-11 px-2.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs text-[#202124]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Resumo Rápido das Métricas do Período */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E7E9ED]">
          <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E7E9ED]">
            <span className="text-[11px] font-semibold text-[#707782]">Entradas no Período</span>
            <div className="text-lg font-black text-[#159957]">
              +{formatCurrencyBRL(metrics.periodIncome)}
            </div>
          </div>
          <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E7E9ED]">
            <span className="text-[11px] font-semibold text-[#707782]">Saídas no Período</span>
            <div className="text-lg font-black text-[#D92D20]">
              -{formatCurrencyBRL(metrics.periodExpense)}
            </div>
          </div>
          <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E7E9ED]">
            <span className="text-[11px] font-semibold text-[#707782]">Resultado no Período</span>
            <div
              className={`text-lg font-black ${
                metrics.periodResult >= 0 ? 'text-[#159957]' : 'text-[#D92D20]'
              }`}
            >
              {metrics.periodResult >= 0 ? '+' : ''}{formatCurrencyBRL(metrics.periodResult)}
            </div>
          </div>
        </div>
      </div>

      {/* --- GRÁFICO 1: ENTRADAS X SAÍDAS (BARRAS) --- */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202124]">
                Gráfico 1 — Entradas x Saídas
              </h3>
              <p className="text-xs text-[#707782]">
                Comparativo de barras do volume financeiro em {metrics.periodLabel}.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-[#707782] block">Taxa de Poupança</span>
            <span className="text-sm font-black text-[#FF6B00]">
              {metrics.savingsRate}% economizado
            </span>
          </div>
        </div>

        {metrics.periodIncome === 0 && metrics.periodExpense === 0 ? (
          <div className="py-12 text-center text-xs text-[#707782]">
            Não há movimentações cadastradas no período selecionado ({metrics.periodLabel}) para exibir o comparativo.
          </div>
        ) : (
          <div className="p-6 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED] space-y-6">
            <div className="grid grid-cols-2 gap-6 sm:gap-12 max-w-md mx-auto items-end h-56 pt-6">
              {/* Barra: Entradas */}
              <div className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-black text-[#159957]">
                  +{formatCurrencyBRL(metrics.periodIncome)}
                </span>
                <div className="w-16 sm:w-20 bg-gray-200 rounded-2xl overflow-hidden flex items-end h-40">
                  <div
                    className="w-full bg-[#159957] rounded-2xl transition-all duration-700 hover:brightness-110"
                    style={{ height: `${Math.max(10, incomeHeightPercent)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#202124] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#159957]" /> Entradas
                </span>
              </div>

              {/* Barra: Saídas */}
              <div className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-black text-[#D92D20]">
                  -{formatCurrencyBRL(metrics.periodExpense)}
                </span>
                <div className="w-16 sm:w-20 bg-gray-200 rounded-2xl overflow-hidden flex items-end h-40">
                  <div
                    className="w-full bg-[#D92D20] rounded-2xl transition-all duration-700 hover:brightness-110"
                    style={{ height: `${Math.max(10, expenseHeightPercent)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#202124] flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-[#D92D20]" /> Saídas
                </span>
              </div>
            </div>

            <div className="text-center text-xs text-[#707782] pt-2 border-t border-[#E7E9ED]">
              Resultado líquido no período: <strong className={metrics.periodResult >= 0 ? 'text-[#159957]' : 'text-[#D92D20]'}>{metrics.periodResult >= 0 ? '+' : ''}{formatCurrencyBRL(metrics.periodResult)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* --- GRÁFICO 2: DESPESAS POR CATEGORIA (ROSCA / PIZZA) --- */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center font-bold">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#202124]">
              Gráfico 2 — Despesas por Categoria
            </h3>
            <p className="text-xs text-[#707782]">
              Distribuição percentual e valores em reais de cada despesa no período.
            </p>
          </div>
        </div>

        {breakdown.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#707782]">
            Nenhuma despesa registrada no período selecionado ({metrics.periodLabel}).
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* SVG Donut Chart */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-52 h-52 sm:w-60 sm:h-60">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke="#E7E9ED"
                    strokeWidth={strokeWidth}
                  />

                  {slices.map((slice) => (
                    <circle
                      key={slice.category}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      className="transition-all duration-500 cursor-pointer hover:opacity-80"
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === slice.category ? null : slice.category
                        )
                      }
                    />
                  ))}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-[#707782]">
                    Total Saídas
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#202124]">
                    {formatCurrencyBRL(metrics.periodExpense)}
                  </span>
                </div>
              </div>
            </div>

            {/* Legenda com Valores em Reais e Percentuais */}
            <div className="lg:col-span-7 space-y-3">
              {breakdown.map((item) => {
                const isSelected = selectedCategory === item.category;

                return (
                  <div
                    key={item.category}
                    onClick={() =>
                      setSelectedCategory(isSelected ? null : item.category)
                    }
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF1E7] border-[#FF6B00]'
                        : 'bg-[#F7F8FA] border-[#E7E9ED] hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-bold text-xs text-[#202124]">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-[#707782]">
                          ({item.count} compra{item.count > 1 ? 's' : ''})
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-xs text-[#202124]">
                          {formatCurrencyBRL(item.total)}
                        </span>
                        <span className="text-[11px] font-bold text-[#707782] ml-1.5">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- GRÁFICO 3: EVOLUÇÃO FINANCEIRA (LINHAS) --- */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center font-bold">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202124]">
                Gráfico 3 — Evolução Financeira ao Longo dos Meses
              </h3>
              <p className="text-xs text-[#707782]">
                Histórico mensal de entradas, saídas e saldo acumulado.
              </p>
            </div>
          </div>

          {/* Legenda do Gráfico de Linhas */}
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#159957]" />
              <span className="text-[#707782]">Entradas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#D92D20]" />
              <span className="text-[#707782]">Saídas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF6B00]" />
              <span className="text-[#202124]">Saldo Acumulado</span>
            </div>
          </div>
        </div>

        {monthlyEvolution.every((m) => m.income === 0 && m.expense === 0) ? (
          <div className="py-12 text-center text-xs text-[#707782]">
            Ainda não há dados suficientes nos meses recentes para traçar a evolução temporal. Cadastre movimentações para visualizar as linhas de tendência!
          </div>
        ) : (
          <div className="space-y-4">
            {/* SVG Line Chart Responsivo */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[500px]">
                <svg
                  className="w-full h-56 select-none"
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                >
                  {/* Linhas de Grade Horizontais */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                    const y = svgHeight - paddingY - pct * plotHeight;
                    const val = minLineVal + pct * valRange;
                    return (
                      <g key={idx}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={svgWidth - paddingX}
                          y2={y}
                          stroke="#E7E9ED"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={paddingX - 6}
                          y={y + 3}
                          fontSize="9"
                          fill="#707782"
                          textAnchor="end"
                        >
                          {Math.round(val)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Linha de Entradas (Verde) */}
                  <path
                    d={incomePath}
                    fill="none"
                    stroke="#159957"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {incomePoints.map((pt, i) => (
                    <circle
                      key={`inc-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#159957"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Linha de Saídas (Vermelha) */}
                  <path
                    d={expensePath}
                    fill="none"
                    stroke="#D92D20"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {expensePoints.map((pt, i) => (
                    <circle
                      key={`exp-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#D92D20"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Linha de Saldo Acumulado (Laranja) */}
                  <path
                    d={balancePath}
                    fill="none"
                    stroke="#FF6B00"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {balancePoints.map((pt, i) => (
                    <circle
                      key={`bal-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="5"
                      fill="#FF6B00"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Eixo X: Rótulos dos Meses */}
                  {monthlyEvolution.map((m, i) => {
                    const x = paddingX + (i / (monthlyEvolution.length - 1 || 1)) * plotWidth;
                    return (
                      <text
                        key={m.monthKey}
                        x={x}
                        y={svgHeight - 8}
                        fontSize="10"
                        fontWeight="bold"
                        fill="#202124"
                        textAnchor="middle"
                      >
                        {m.monthLabel}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Tabela de Dados Mensais */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
              {monthlyEvolution.map((m) => (
                <div
                  key={m.monthKey}
                  className="p-3 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED] space-y-1 text-center"
                >
                  <span className="text-[10px] font-bold text-[#707782] uppercase">
                    {m.monthLabel}
                  </span>
                  <div className="text-[11px] font-bold text-[#159957]">
                    +{formatCurrencyBRL(m.income)}
                  </div>
                  <div className="text-[11px] font-bold text-[#D92D20]">
                    -{formatCurrencyBRL(m.expense)}
                  </div>
                  <div className="text-xs font-black text-[#FF6B00] pt-0.5 border-t border-[#E7E9ED]">
                    {formatCurrencyBRL(m.accumulatedBalance)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cartão de Dica Pedagógica do 8º Ano */}
      {topSpendingCategory && (
        <div className="bg-white rounded-3xl p-6 border border-[#E7E9ED] shadow-xs flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1E7] text-[#E85D00] flex items-center justify-center shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>

          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-[#202124] text-sm">
              Análise dos Alunos do 8º Ano para Consumo Consciente
            </h4>
            <p className="text-[#707782] leading-relaxed">
              No período analisado ({metrics.periodLabel}), sua maior saída de recursos ocorreu em <strong>{topSpendingCategory.label}</strong>, correspondendo a{' '}
              <strong className="text-[#FF6B00]">{topSpendingCategory.percentage}%</strong> de todas as despesas (
              {formatCurrencyBRL(topSpendingCategory.total)}).
            </p>
            <p className="text-[#707782] leading-relaxed pt-1">
              <strong>Lição prática de economia:</strong> Estabelecer um teto mensal na aba de Planejamento ajuda a poupar até 15% nessa categoria, direcionando a sobra para suas metas de sonhos!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
