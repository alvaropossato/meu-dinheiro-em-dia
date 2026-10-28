import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-[#E7E9ED]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E7E9ED] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#202124]">Termos de Uso e Política de Privacidade</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#707782] hover:text-[#202124] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Fechar termos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#202124] leading-relaxed">
          <section>
            <h3 className="font-bold text-[#202124] text-sm sm:text-base mb-1">1. Sobre o "Meu Dinheiro em Dia"</h3>
            <p className="text-[#707782]">
              O "Meu Dinheiro em Dia" é uma plataforma para estudantes, jovens e famílias planejarem metas financeiras,
              construírem disciplina de poupança e praticarem consumo consciente.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-[#202124] text-sm sm:text-base mb-1">2. Privacidade e Proteção de Dados (LGPD)</h3>
            <p className="text-[#707782]">
              Em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018):
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#707782]">
              <li>Valores monetários, rendas e depósitos são estritamente privados do proprietário da conta.</li>
              <li>Não conectamos contas bancárias nem realizamos movimentações reais em dinheiro.</li>
              <li>Não vendemos nem repassamos dados pessoais a terceiros.</li>
            </ul>
          </section>

          <section className="p-4 bg-[#FFF1E7] rounded-2xl border border-[#FFE3D1] text-[#202124]">
            <h4 className="font-bold mb-1 flex items-center gap-1.5 text-[#E85D00]">
              <ShieldCheck className="w-4 h-4 text-[#FF6B00]" /> Regra de Ouro do Compartilhamento
            </h4>
            <p className="text-xs text-[#707782] leading-relaxed">
              Ao usar a ferramenta "Compartilhar Progresso", apenas a barra visual e a porcentagem que falta para bater a meta
              (ex: "Faltam 25%") são visíveis aos convidados. Nenhum convidado terá acesso a valores em reais (R$), saldo
              acumulado ou movimentações.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-[#202124] text-sm sm:text-base mb-1">3. Responsabilidades do Usuário</h3>
            <p className="text-[#707782]">
              O usuário é responsável pela veracidade dos dados cadastrados e por manter a segurança de sua senha de acesso.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-[#202124] text-sm sm:text-base mb-1">4. Revogação de Acesso</h3>
            <p className="text-[#707782]">
              O proprietário pode revogar convites de compartilhamento a qualquer momento com efeito imediato através do painel.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7E9ED] bg-[#F7F8FA] flex justify-end">
          <button
            onClick={onClose}
            className="h-11 px-6 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            Entendi e concordo
          </button>
        </div>
      </div>
    </div>
  );
};
