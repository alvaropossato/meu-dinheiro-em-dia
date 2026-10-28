import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  X,
} from 'lucide-react';
import { EDUCATION_LESSONS } from '../data/educationData';
import { EducationLesson } from '../types';
import { formatCurrencyBRL } from '../utils/finance';

export const EducationSection: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<EducationLesson | null>(null);

  // Estados da Calculadora de Economia Mensal
  const [simTarget, setSimTarget] = useState<string>('1200');
  const [simSaved, setSimSaved] = useState<string>('200');
  const [simMonths, setSimMonths] = useState<string>('10');

  const targetVal = parseFloat(simTarget) || 0;
  const savedVal = parseFloat(simSaved) || 0;
  const monthsVal = Math.max(1, parseInt(simMonths, 10) || 1);
  const diffVal = Math.max(0, targetVal - savedVal);
  const monthlyNeed = Math.round((diffVal / monthsVal) * 100) / 100;
  const dailyNeed = Math.round((monthlyNeed / 30) * 100) / 100;

  return (
    <div className="space-y-8">
      {/* Top Banner - Clean Fintech Style */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF1E7] text-[#E85D00] rounded-full text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span>Educação e planejamento consciente</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202124]">
            Educação financeira & consumo consciente
          </h2>
          <p className="text-xs sm:text-sm text-[#707782] leading-relaxed">
            Pequenos hábitos regulares transformam a realidade de estudantes e famílias. Aprenda a planejar com sabedoria,
            diferenciar prioridades e guardar com propósito.
          </p>
        </div>
      </div>

      {/* Interactive Simulator: Quanto poupar por mês? */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#202124]">Simulador: Quanto poupar por mês?</h3>
            <p className="text-xs text-[#707782]">
              Calcule a quantia mensal e diária necessária para atingir qualquer meta sem estresse.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#202124] mb-1">Valor total da meta (R$)</label>
            <input
              type="number"
              min="1"
              value={simTarget}
              onChange={(e) => setSimTarget(e.target.value)}
              className="w-full h-12 px-3.5 bg-white border border-[#E7E9ED] rounded-xl text-sm font-bold text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202124] mb-1">Já economizado (R$)</label>
            <input
              type="number"
              min="0"
              value={simSaved}
              onChange={(e) => setSimSaved(e.target.value)}
              className="w-full h-12 px-3.5 bg-white border border-[#E7E9ED] rounded-xl text-sm font-bold text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#202124] mb-1">Prazo desejado (meses)</label>
            <input
              type="number"
              min="1"
              max="120"
              value={simMonths}
              onChange={(e) => setSimMonths(e.target.value)}
              className="w-full h-12 px-3.5 bg-white border border-[#E7E9ED] rounded-xl text-sm font-bold text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]"
            />
          </div>
        </div>

        {/* Simulator Results */}
        <div className="mt-6 p-5 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase font-bold text-[#707782] tracking-wider">
              Plano de poupança mensal
            </span>
            <div className="text-3xl font-black text-[#FF6B00]">
              {formatCurrencyBRL(monthlyNeed)} <span className="text-xs font-semibold text-[#707782]">/ mês</span>
            </div>
            <p className="text-xs text-[#707782]">
              Equivale a guardar aproximadamente <strong className="text-[#202124]">{formatCurrencyBRL(dailyNeed)} por dia</strong> durante {monthsVal} meses.
            </p>
          </div>

          <div className="text-xs text-[#202124] bg-white p-3.5 rounded-xl border border-[#E7E9ED] text-center sm:text-right shadow-2xs">
            <div>Falta economizar: <strong className="text-[#FF6B00]">{formatCurrencyBRL(diffVal)}</strong></div>
            <div className="text-[11px] text-[#707782] mt-0.5">Defina uma meta no app para acompanhar cada avanço!</div>
          </div>
        </div>
      </div>

      {/* Educational Lessons Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#707782] mb-4">
          Dicas práticas de organização financeira ({EDUCATION_LESSONS.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {EDUCATION_LESSONS.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className="bg-white rounded-3xl p-6 border border-[#E7E9ED] shadow-xs hover:border-[#FF6B00]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E85D00] bg-[#FFF1E7] px-2.5 py-1 rounded-full">
                  {lesson.tag}
                </span>

                <h4 className="mt-3 text-base font-bold text-[#202124] group-hover:text-[#FF6B00] transition-colors">
                  {lesson.title}
                </h4>

                <p className="mt-2 text-xs text-[#707782] leading-relaxed line-clamp-3">
                  {lesson.shortDesc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E7E9ED] flex items-center justify-between text-xs font-bold text-[#FF6B00] group-hover:text-[#E85D00]">
                <span>Ler dica completa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lesson Details Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-[#E7E9ED] animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-[#E7E9ED] flex items-center justify-between bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E85D00] bg-[#FFF1E7] px-2.5 py-0.5 rounded-full">
                  {selectedLesson.tag}
                </span>
                <h3 className="text-base font-bold text-[#202124] mt-1">{selectedLesson.title}</h3>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="p-2 text-[#707782] hover:text-[#202124] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#202124] leading-relaxed">
              {selectedLesson.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}

              <div className="p-4 bg-[#FFF1E7] rounded-2xl border border-[#FFE3D1] space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#E85D00]">
                  <Lightbulb className="w-4 h-4 text-[#FF6B00]" /> Lição principal
                </div>
                <p className="text-xs text-[#202124]">{selectedLesson.keyTakeaway}</p>
              </div>

              <div className="p-4 bg-[#E6F4EA] rounded-2xl border border-[#159957]/30 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#159957]">
                  <CheckCircle2 className="w-4 h-4 text-[#159957]" /> Desafio prático
                </div>
                <p className="text-xs text-[#202124]">{selectedLesson.practicalTip}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E7E9ED] bg-[#F7F8FA] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLesson(null)}
                className="h-11 px-6 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Fechar lição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
