import React, { useState, useEffect } from 'react';
import { X, DollarSign, Tag, CheckCircle2 } from 'lucide-react';
import { CategoryBudget, TransactionCategory } from '../types';
import { CATEGORY_META } from '../utils/finance';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: CategoryBudget) => Promise<void>;
  initialBudget?: CategoryBudget | null;
}

const BUDGETABLE_CATEGORIES: TransactionCategory[] = [
  'alimentacao',
  'material_escolar',
  'transporte',
  'lazer',
  'educacao',
  'saude',
  'moradia',
  'outro',
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBudget,
}) => {
  const [category, setCategory] = useState<TransactionCategory>('alimentacao');
  const [limitAmountStr, setLimitAmountStr] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialBudget) {
      setCategory(initialBudget.category);
      setLimitAmountStr(initialBudget.limitAmount.toString().replace('.', ','));
      setMonth(initialBudget.month || new Date().toISOString().slice(0, 7));
    } else {
      setCategory('alimentacao');
      setLimitAmountStr('');
      setMonth(new Date().toISOString().slice(0, 7));
    }
    setError('');
  }, [initialBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanLimit = parseFloat(limitAmountStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(cleanLimit) || cleanLimit <= 0) {
      setError('Informe um limite de gastos válido maior que zero.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        category,
        limitAmount: Math.round(cleanLimit * 100) / 100,
        month,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar orçamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E7E9ED] overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7E9ED]">
          <div>
            <h2 className="text-lg font-bold text-[#202124]">
              {initialBudget ? 'Editar Teto de Gastos' : 'Novo Limite de Gastos'}
            </h2>
            <p className="text-xs text-[#707782]">
              Planeje um teto mensal para incentivar o consumo consciente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#707782] hover:text-[#202124] rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#D92D20]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1.5">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full h-11 px-3 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs font-medium text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
            >
              {BUDGETABLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_META[cat]?.label || cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1.5">
              Teto Máximo Mensal (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#707782]">
                R$
              </span>
              <input
                type="text"
                required
                placeholder="Ex: 120,00"
                value={limitAmountStr}
                onChange={(e) => setLimitAmountStr(e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs font-bold text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
              />
            </div>
          </div>

          <div className="p-3 bg-[#FFF1E7] border border-[#FFE3D1] rounded-2xl text-[11px] text-[#E85D00] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Ao definir um orçamento mensal, você recebe alertas visuais no painel para não gastar além do planejado.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 px-5 rounded-xl border border-[#E7E9ED] text-xs font-semibold text-[#202124] hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-6 bg-[#FF6B00] hover:bg-[#E85D00] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar Limite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
