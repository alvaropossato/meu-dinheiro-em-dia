import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  CreditCard,
  FileSpreadsheet,
  ArrowUpDown,
  CalendarDays,
} from 'lucide-react';
import { Transaction, TransactionCategory, TransactionType, FinancialPeriod, PeriodFilter } from '../types';
import {
  formatCurrencyBRL,
  formatDateBR,
  isDateInPeriod,
  calculateFinancialMetrics,
  CATEGORY_META,
} from '../utils/finance';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenNewTransaction: (type?: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [period, setPeriod] = useState<FinancialPeriod>('all');
  const [customStart, setCustomStart] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  );
  const [customEnd, setCustomEnd] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filter: PeriodFilter = {
    period,
    startDate: period === 'custom' ? customStart : undefined,
    endDate: period === 'custom' ? customEnd : undefined,
  };

  // Filtra as transações
  const filtered = transactions.filter((tx) => {
    // Busca por descrição ou anotação
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    // Tipo (entrada ou saída)
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;

    // Categoria
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

    // Período
    const matchesPeriod = isDateInPeriod(tx.date, filter);

    return matchesSearch && matchesType && matchesCategory && matchesPeriod;
  });

  // Ordenação por data
  const sorted = [...filtered].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  // Métricas do conjunto filtrado
  const metrics = calculateFinancialMetrics(filtered, { period: 'all' });

  return (
    <div className="space-y-6">
      {/* Top Header & Botões de Ação */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-3 py-1 bg-[#FFF1E7] text-[#E85D00] text-xs font-semibold rounded-full mb-1">
            Controle & Histórico
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
            Histórico de Movimentações
          </h1>
          <p className="text-xs text-[#707782]">
            Cadastre, edite e consulte todas as entradas e saídas de dinheiro com filtros avançados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => onOpenNewTransaction('income')}
            className="h-11 px-4 bg-[#E6F4EA] hover:bg-[#D5EEDD] text-[#159957] border border-[#C2E7CE] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] flex-1 sm:flex-initial justify-center"
          >
            <TrendingUp className="w-4 h-4" />
            <span>+ Entrada</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewTransaction('expense')}
            className="h-11 px-5 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98] flex-1 sm:flex-initial justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Movimentação</span>
          </button>
        </div>
      </div>

      {/* Cartões com Totais do Filtro Atual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E7E9ED] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#707782]">Entradas no Filtro</span>
            <div className="text-base sm:text-lg font-black text-[#159957]">
              +{formatCurrencyBRL(metrics.periodIncome)}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] text-[#159957] flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E9ED] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#707782]">Saídas no Filtro</span>
            <div className="text-base sm:text-lg font-black text-[#D92D20]">
              -{formatCurrencyBRL(metrics.periodExpense)}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-red-50 text-[#D92D20] flex items-center justify-center font-bold">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E9ED] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#707782]">Saldo no Filtro</span>
            <div
              className={`text-base sm:text-lg font-black ${
                metrics.periodResult >= 0 ? 'text-[#159957]' : 'text-[#D92D20]'
              }`}
            >
              {metrics.periodResult >= 0 ? '+' : ''}{formatCurrencyBRL(metrics.periodResult)}
            </div>
          </div>
          <div className="text-xs font-bold px-2.5 py-1 bg-[#F7F8FA] rounded-lg text-[#707782]">
            {sorted.length} item{sorted.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Período e Ordenação */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E7E9ED] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Busca Textual */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707782]" />
            <input
              type="text"
              placeholder="Buscar por descrição ou anotação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-3.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs sm:text-sm text-[#202124] placeholder-[#707782]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="h-11 px-3 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs font-bold text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 cursor-pointer"
            >
              <option value="all">Todas as movimentações</option>
              <option value="income">Apenas Entradas</option>
              <option value="expense">Apenas Saídas</option>
            </select>

            {/* Categoria */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-11 px-3 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs font-bold text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 cursor-pointer"
            >
              <option value="all">Todas as categorias</option>
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>

            {/* Período */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as FinancialPeriod)}
              className="h-11 px-3 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs font-bold text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 cursor-pointer"
            >
              <option value="all">Todo o histórico</option>
              <option value="this_month">Este mês</option>
              <option value="last_month">Mês anterior</option>
              <option value="last_30_days">Últimos 30 dias</option>
              <option value="this_year">Este ano</option>
              <option value="custom">Personalizado</option>
            </select>

            {/* Ordenação por Data */}
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="h-11 px-3 bg-[#F7F8FA] hover:bg-slate-100 border border-[#E7E9ED] rounded-xl text-xs font-bold text-[#202124] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Alternar ordenação por data"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#707782]" />
              <span>{sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigas'}</span>
            </button>
          </div>
        </div>

        {/* Inputs de período personalizado se selecionado */}
        {period === 'custom' && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#E7E9ED] text-xs">
            <span className="font-bold text-[#707782]">De:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-10 px-2.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs text-[#202124]"
            />
            <span className="font-bold text-[#707782]">Até:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-10 px-2.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs text-[#202124]"
            />
          </div>
        )}
      </div>

      {/* Lista / Tabela de Movimentações */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E7E9ED] shadow-xs space-y-4">
          <div className="w-14 h-14 bg-[#FFF1E7] text-[#FF6B00] rounded-2xl flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#202124]">
              Nenhuma movimentação encontrada
            </h3>
            <p className="text-xs text-[#707782] max-w-sm mx-auto">
              Nenhum lançamento corresponde aos filtros ativos. Tente alterar os critérios ou cadastrar uma nova movimentação.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenNewTransaction('expense')}
            className="h-11 px-6 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            + Cadastrar Movimentação
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E7E9ED] shadow-xs divide-y divide-[#E7E9ED] overflow-hidden">
          {sorted.map((tx) => {
            const meta = CATEGORY_META[tx.category] || CATEGORY_META.outras_despesas || CATEGORY_META.outro;
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F8FA]/60 transition-colors"
              >
                {/* Lado Esquerdo: Ícone com formato, Descrição, Categoria, Data e Tipo Explicito */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {isIncome ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-[#202124]">
                        {tx.description}
                      </span>

                      {/* Tipo explícito em texto para acessibilidade visual */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                          isIncome
                            ? 'bg-[#E6F4EA] text-[#159957]'
                            : 'bg-red-50 text-[#D92D20]'
                        }`}
                      >
                        {isIncome ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isIncome ? 'Entrada' : 'Saída'}
                      </span>

                      {tx.isDemo && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
                          Exemplo Didático
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#707782]">
                      <span
                        className="px-2 py-0.5 rounded-md font-semibold text-[10px]"
                        style={{ backgroundColor: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <span>•</span>
                      <span>{formatDateBR(tx.date)}</span>
                      {tx.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{tx.paymentMethod.replace('_', ' ')}</span>
                        </>
                      )}
                      {tx.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-[#707782]/80 truncate max-w-[200px]">"{tx.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Valor e Ações de Editar/Excluir */}
                <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  <span
                    className={`text-sm sm:text-base font-black ${
                      isIncome ? 'text-[#159957]' : 'text-[#D92D20]'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatCurrencyBRL(tx.amount)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditTransaction(tx)}
                      className="p-2 text-[#707782] hover:text-[#FF6B00] hover:bg-[#FFF1E7] rounded-xl transition-colors cursor-pointer"
                      title="Editar movimentação"
                      aria-label={`Editar ${tx.description}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTransaction(tx)}
                      className="p-2 text-[#707782] hover:text-[#D92D20] hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Excluir movimentação"
                      aria-label={`Excluir ${tx.description}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
