import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Calendar, FileText, AlertCircle, Plus, Minus } from 'lucide-react';
import { Goal } from '../types';
import { formatCurrencyBRL } from '../utils/finance';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  defaultType?: 'deposit' | 'withdrawal';
  onSubmit: (data: {
    type: 'deposit' | 'withdrawal';
    amount: number;
    description?: string;
    date: string;
  }) => Promise<void>;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  goal,
  defaultType = 'deposit',
  onSubmit,
}) => {
  const [type, setType] = useState<'deposit' | 'withdrawal'>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor, informe um valor monetário maior que R$ 0,00.');
      return;
    }

    if (type === 'withdrawal' && numAmount > goal.currentAmount) {
      setError(`O valor da retirada não pode exceder o saldo atual economizado (${formatCurrencyBRL(goal.currentAmount)}).`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        type,
        amount: numAmount,
        description: description.trim() || undefined,
        date,
      });
      onClose();
      setAmount('');
      setDescription('');
    } catch (err: any) {
      setError(err?.message || 'Erro ao registrar movimentação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E7E9ED]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E7E9ED] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base font-bold text-[#202124]">Registrar movimentação</h2>
            <p className="text-xs text-[#707782] truncate max-w-[260px]">{goal.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#707782] hover:text-[#202124] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#D92D20] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector (Depósito vs Retirada) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED]">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`flex items-center justify-center gap-1.5 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'deposit'
                  ? 'bg-white text-[#159957] shadow-xs'
                  : 'text-[#707782] hover:text-[#202124]'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar valor</span>
            </button>
            <button
              type="button"
              onClick={() => setType('withdrawal')}
              className={`flex items-center justify-center gap-1.5 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'withdrawal'
                  ? 'bg-white text-[#202124] shadow-xs'
                  : 'text-[#707782] hover:text-[#202124]'
              }`}
            >
              <Minus className="w-4 h-4" />
              <span>Retirar valor</span>
            </button>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs font-bold text-[#202124] mb-1">
              Valor da operação (R$) <span className="text-[#D92D20]">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-12 px-3.5 bg-white border border-[#E7E9ED] rounded-xl text-base font-bold text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
            />
            <p className="mt-1 text-[11px] text-[#707782]">
              Saldo atual nesta meta: <strong className="text-[#202124]">{formatCurrencyBRL(goal.currentAmount)}</strong>
            </p>
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-bold text-[#202124] mb-1">Data</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707782]" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 pl-10 pr-3.5 bg-white border border-[#E7E9ED] rounded-xl text-xs text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-[#202124] mb-1">
              Descrição ou motivo <span className="text-[#707782] font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707782]" />
              <input
                type="text"
                maxLength={200}
                placeholder="Ex: Mesada, economia no lanche, bico do fim de semana"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-12 pl-10 pr-3.5 bg-white border border-[#E7E9ED] rounded-xl text-xs text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-[#E7E9ED] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-5 bg-white hover:bg-slate-100 text-[#202124] border border-[#E7E9ED] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-6 bg-[#FF6B00] hover:bg-[#E85D00] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-xs transition-all cursor-pointer active:scale-[0.99]"
            >
              {submitting ? 'Registrando...' : type === 'deposit' ? 'Confirmar depósito' : 'Confirmar retirada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
