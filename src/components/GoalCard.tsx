import React, { useState } from 'react';
import {
  Share2,
  Calendar,
  MoreVertical,
  CheckCircle,
  Pause,
  Play,
  Edit2,
  Trash2,
  History,
  Plus,
  Minus,
  Award,
  Tag,
} from 'lucide-react';
import { Goal } from '../types';
import { calculateGoalPercentages, formatCurrencyBRL } from '../utils/finance';

interface GoalCardProps {
  goal: Goal;
  onContribute: (goal: Goal) => void;
  onWithdraw: (goal: Goal) => void;
  onShare: (goal: Goal) => void;
  onHistory: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onToggleStatus: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  estudos: 'Estudos',
  viagem: 'Viagem',
  material_escolar: 'Material Escolar',
  reserva: 'Reserva de Emergência',
  tecnologia: 'Tecnologia',
  familia: 'Família',
  veiculo: 'Veículo',
  outro: 'Outro Objetivo',
};

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onContribute,
  onWithdraw,
  onShare,
  onHistory,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const { progressPercentage, remainingPercentage, isCompleted } = calculateGoalPercentages(
    goal.targetAmount,
    goal.currentAmount
  );

  const categoryLabel = CATEGORY_LABELS[goal.category] || 'Meta Financeira';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E7E9ED] shadow-xs hover:border-[#FF6B00]/40 hover:shadow-md transition-all flex flex-col justify-between relative group">
      {/* Top row: Category tag, Status, and Options menu */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-[#707782] bg-[#F7F8FA] border border-[#E7E9ED]">
              {categoryLabel}
            </span>

            {isCompleted || goal.status === 'completed' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6F4EA] text-[#159957]">
                <CheckCircle className="w-3.5 h-3.5" /> Concluída
              </span>
            ) : goal.status === 'paused' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF1E7] text-[#E85D00]">
                <Pause className="w-3 h-3" /> Pausada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF1E7] text-[#FF6B00]">
                Em andamento
              </span>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[#707782] hover:text-[#202124] hover:bg-[#F7F8FA] rounded-xl transition-colors cursor-pointer"
              aria-label="Opções da meta"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-30 w-48 bg-white rounded-2xl shadow-xl border border-[#E7E9ED] py-2 text-xs text-[#202124] animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(goal);
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-[#F7F8FA] font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#707782]" /> Editar meta
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleStatus(goal);
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-[#F7F8FA] font-medium"
                  >
                    {goal.status === 'active' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-[#E85D00]" /> Pausar meta
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-[#159957]" /> Retomar meta
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onHistory(goal);
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-[#F7F8FA] font-medium"
                  >
                    <History className="w-3.5 h-3.5 text-[#707782]" /> Ver histórico
                  </button>

                  <div className="border-t border-[#E7E9ED] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(goal);
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-red-50 text-[#D92D20] font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir meta
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-3.5">
          <h3 className="text-lg font-bold text-[#202124] line-clamp-1">{goal.name}</h3>
          {goal.description ? (
            <p className="mt-1 text-xs text-[#707782] line-clamp-2 leading-relaxed">{goal.description}</p>
          ) : (
            <p className="mt-1 text-xs text-[#707782] italic">Sem descrição adicional</p>
          )}
        </div>

        {/* Private Monetary Values (Somente proprietário) */}
        <div className="mt-4 p-4 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED]">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-[#707782] font-medium">Economizado:</span>
            <span className="text-base font-extrabold text-[#202124]">
              {formatCurrencyBRL(goal.currentAmount)}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs mt-1 pt-1 border-t border-[#E7E9ED]">
            <span className="text-[#707782]">Meta planejada:</span>
            <span className="font-semibold text-[#202124]">
              {formatCurrencyBRL(goal.targetAmount)}
            </span>
          </div>
        </div>

        {/* Progress Bar & Percentage breakdown */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#202124] flex items-center gap-1">
              {isCompleted && <Award className="w-4 h-4 text-[#FF6B00]" />}
              {progressPercentage}% atingidos
            </span>
            <span className="text-[11px] font-semibold text-[#707782]">
              {isCompleted ? 'Concluído!' : `Faltam ${remainingPercentage}%`}
            </span>
          </div>

          {/* Progress Bar (Green #159957 for positive progress) */}
          <div className="w-full bg-[#E7E9ED] h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[#159957]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {goal.deadline && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#707782] pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Conclusão prevista: {new Date(goal.deadline + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: Height ~48px, rounded 14-16px, clean hierarchy */}
      <div className="mt-5 pt-4 border-t border-[#E7E9ED] flex flex-wrap items-center gap-2">
        {/* Guardar (+) */}
        <button
          type="button"
          onClick={() => onContribute(goal)}
          className="flex-1 min-w-[90px] h-11 px-3 bg-[#FFF1E7] hover:bg-[#FFE3D1] text-[#E85D00] text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Guardar</span>
        </button>

        {/* Retirar (-) */}
        <button
          type="button"
          onClick={() => onWithdraw(goal)}
          className="h-11 px-3 bg-[#F7F8FA] hover:bg-slate-100 text-[#707782] border border-[#E7E9ED] text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
          title="Registrar retirada"
        >
          <Minus className="w-3.5 h-3.5" />
          <span>Retirar</span>
        </button>

        {/* Compartilhar Progresso */}
        <button
          type="button"
          onClick={() => onShare(goal)}
          className="h-11 px-4 bg-[#FF6B00] hover:bg-[#E85D00] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
          title="Compartilhar progresso sem revelar valores"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartilhar</span>
        </button>
      </div>
    </div>
  );
};
