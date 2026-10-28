import React, { useEffect, useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, History, Calendar } from 'lucide-react';
import { Goal, Movement } from '../types';
import { getGoalMovements } from '../services/goalService';
import { formatCurrencyBRL } from '../utils/finance';

interface GoalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
}

export const GoalHistoryModal: React.FC<GoalHistoryModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && goal) {
      setLoading(true);
      getGoalMovements(goal.id, goal.ownerId)
        .then((items) => setMovements(items || []))
        .catch((err) => console.error('Erro ao carregar histórico:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, goal]);

  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-[#E7E9ED]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E7E9ED] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202124]">Histórico de movimentações</h2>
              <p className="text-xs text-[#707782] truncate max-w-[260px]">{goal.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#707782] hover:text-[#202124] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#707782]">Carregando movimentações...</div>
          ) : movements.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 bg-[#F7F8FA] rounded-2xl flex items-center justify-center mx-auto text-[#707782] border border-[#E7E9ED]">
                <History className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#202124]">Nenhuma movimentação registrada</p>
              <p className="text-xs text-[#707782] max-w-xs mx-auto">
                Registre depósitos ou retiradas para acompanhar a evolução desta meta.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {movements.map((mov) => {
                const isDeposit = mov.type === 'deposit';
                return (
                  <div
                    key={mov.id}
                    className="p-4 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isDeposit ? 'bg-[#E6F4EA] text-[#159957]' : 'bg-slate-200 text-[#202124]'
                        }`}
                      >
                        {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#202124]">
                          {isDeposit ? 'Depósito na meta' : 'Retirada'}
                        </div>
                        {mov.description && (
                          <div className="text-[11px] text-[#707782] line-clamp-1">{mov.description}</div>
                        )}
                        <div className="text-[10px] text-[#707782] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(mov.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-sm font-extrabold shrink-0 ${
                        isDeposit ? 'text-[#159957]' : 'text-[#202124]'
                      }`}
                    >
                      {isDeposit ? '+' : '-'} {formatCurrencyBRL(mov.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7E9ED] bg-[#F7F8FA] flex items-center justify-between text-xs">
          <span className="text-[#707782]">Saldo total atual:</span>
          <span className="text-base font-extrabold text-[#202124]">{formatCurrencyBRL(goal.currentAmount)}</span>
        </div>
      </div>
    </div>
  );
};
