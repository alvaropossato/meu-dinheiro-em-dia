import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, Tag, Palette, AlertCircle } from 'lucide-react';
import { Goal, GoalCategory } from '../types';
import { calculateGoalPercentages, formatCurrencyBRL } from '../utils/finance';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    category: GoalCategory;
    color: string;
  }) => Promise<void>;
  initialGoal?: Goal | null;
}

const CATEGORIES: { id: GoalCategory; label: string }[] = [
  { id: 'estudos', label: 'Estudos e Cursos' },
  { id: 'material_escolar', label: 'Material Escolar e Livros' },
  { id: 'reserva', label: 'Reserva de Emergência' },
  { id: 'viagem', label: 'Viagem / Férias' },
  { id: 'tecnologia', label: 'Tecnologia / Equipamento' },
  { id: 'familia', label: 'Família e Casa' },
  { id: 'veiculo', label: 'Veículo / Transporte' },
  { id: 'outro', label: 'Outro Objetivo' },
];

const COLORS = [
  '#FF6B00', // Primary Orange
  '#159957', // Success Green
  '#0284c7', // Sky Blue
  '#7c3aed', // Purple
  '#d97706', // Amber
  '#e11d48', // Rose
  '#202124', // Dark Neutral
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('0');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState<GoalCategory>('estudos');
  const [color, setColor] = useState('#FF6B00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGoal) {
      setName(initialGoal.name);
      setDescription(initialGoal.description || '');
      setTargetAmount(String(initialGoal.targetAmount));
      setCurrentAmount(String(initialGoal.currentAmount));
      setDeadline(initialGoal.deadline || '');
      setCategory(initialGoal.category);
      setColor(initialGoal.color || '#FF6B00');
    } else {
      setName('');
      setDescription('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setCategory('estudos');
      setColor('#FF6B00');
    }
    setError(null);
  }, [initialGoal, isOpen]);

  if (!isOpen) return null;

  const numTarget = parseFloat(targetAmount) || 0;
  const numCurrent = parseFloat(currentAmount) || 0;
  const preview = calculateGoalPercentages(numTarget, numCurrent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor, informe o nome da meta.');
      return;
    }

    if (isNaN(numTarget) || numTarget <= 0) {
      setError('O valor desejado deve ser maior que zero (R$ 0,00).');
      return;
    }

    if (isNaN(numCurrent) || numCurrent < 0) {
      setError('O valor economizado não pode ser negativo.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        targetAmount: numTarget,
        currentAmount: numCurrent,
        deadline: deadline || undefined,
        category,
        color,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar a meta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-[#E7E9ED]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E7E9ED] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202124]">
                {initialGoal ? 'Editar meta financeira' : 'Nova meta financeira'}
              </h2>
              <p className="text-xs text-[#707782]">Defina seu objetivo e acompanhe seu progresso</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#D92D20] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-[#202124] mb-1">
              Nome da meta <span className="text-[#D92D20]">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="Ex: Livros do Semestre, Viagem em Família, Notebook"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-3.5 bg-white border border-[#E7E9ED] rounded-xl text-xs sm:text-sm text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-[#202124] mb-1">
              Descrição ou motivo <span className="text-[#707782] font-normal">(opcional)</span>
            </label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="Por que essa conquista é importante para você ou sua família?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 bg-white border border-[#E7E9ED] rounded-xl text-xs sm:text-sm text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all resize-none"
            />
          </div>

          {/* Valores Monetários (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#202124] mb-1">
                Valor desejado (R$) <span className="text-[#D92D20]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="500,00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full h-12 px-3.5 bg-white border border-[#E7E9ED] rounded-xl text-sm font-bold text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202124] mb-1">
                Já economizado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full h-12 px-3.5 bg-white border border-[#E7E9ED] rounded-xl text-sm font-bold text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
            </div>
          </div>

          {/* Cálculo Automático e Feedback em Tempo Real */}
          {numTarget > 0 && (
            <div className="p-4 bg-[#F7F8FA] border border-[#E7E9ED] rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-[#202124]">
                <span>Cálculo automático de progresso:</span>
                <span className="text-[#159957]">{preview.progressPercentage}% atingidos</span>
              </div>
              <div className="w-full bg-[#E7E9ED] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#159957] h-full rounded-full transition-all duration-300"
                  style={{ width: `${preview.progressPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-[#707782]">
                Faltam <strong>{preview.remainingPercentage}%</strong> para atingir este objetivo{' '}
                {numCurrent < numTarget ? `(${formatCurrencyBRL(numTarget - numCurrent)} restantes)` : '(Concluído!)'}.
              </p>
            </div>
          )}

          {/* Categoria e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#202124] mb-1">Categoria</label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707782]" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalCategory)}
                  className="w-full h-12 pl-10 pr-3.5 bg-white border border-[#E7E9ED] rounded-xl text-xs text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202124] mb-1">
                Data de conclusão <span className="text-[#707782] font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707782]" />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full h-12 pl-10 pr-3.5 bg-white border border-[#E7E9ED] rounded-xl text-xs text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Seletor de Cor */}
          <div>
            <label className="block text-xs font-bold text-[#202124] mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#707782]" />
              Cor de identificação
            </label>
            <div className="flex items-center gap-2.5">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-[#FF6B00]' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Actions: Button height ~48px, text "Criar meta" / "Salvar alterações" */}
          <div className="pt-4 border-t border-[#E7E9ED] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-5 bg-white hover:bg-slate-100 text-[#202124] border border-[#E7E9ED] text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-6 bg-[#FF6B00] hover:bg-[#E85D00] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {submitting ? 'Salvando...' : initialGoal ? 'Salvar alterações' : 'Criar meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
