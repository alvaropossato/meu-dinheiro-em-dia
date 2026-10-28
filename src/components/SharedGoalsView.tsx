import React, { useState } from 'react';
import {
  Share2,
  Lock,
  Sparkles,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { SharedGoalProjection } from '../types';

interface SharedGoalsViewProps {
  sharedGoals: SharedGoalProjection[];
  onRedeemCode: (code: string) => Promise<void>;
  loading: boolean;
  initialCode?: string;
}

export const SharedGoalsView: React.FC<SharedGoalsViewProps> = ({
  sharedGoals,
  onRedeemCode,
  loading,
  initialCode = '',
}) => {
  const [code, setCode] = useState(initialCode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      await onRedeemCode(code.trim());
      setSuccessMsg('Meta adicionada com sucesso! Você agora está acompanhando o progresso.');
      setCode('');
    } catch (err: any) {
      setError(err?.message || 'Código de convite não encontrado ou inválido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Clean Fintech Style */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF1E7] text-[#E85D00] rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
            <span>Compartilhamento seguro com privacidade total</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202124]">
            Metas compartilhadas comigo
          </h2>
          <p className="text-xs sm:text-sm text-[#707782] leading-relaxed">
            Acompanhe o ritmo de metas de quem convidou você para incentivar conquistas. Por segurança e privacidade absoluta,
            valores em reais (R$), saldos e histórico financeiro nunca são expostos.
          </p>
        </div>
      </div>

      {/* Box to Redeem Invite Code */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7E9ED] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#FF6B00]" />
              Possui um código de convite?
            </h3>
            <p className="text-xs text-[#707782]">
              Insira o código compartilhado com você (ex: <strong>META-ABC12</strong>) para acompanhar a meta.
            </p>
          </div>

          <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              required
              placeholder="CÓDIGO (EX: META-XXXXX)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="h-12 px-4 bg-[#F7F8FA] border border-[#E7E9ED] rounded-xl text-xs sm:text-sm font-bold text-[#202124] uppercase tracking-wider placeholder-[#707782]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all min-w-[220px]"
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-6 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0 active:scale-[0.98]"
            >
              {submitting ? 'Verificando...' : 'Acompanhar meta'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#D92D20] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 bg-[#E6F4EA] border border-[#159957]/30 rounded-xl text-xs text-[#159957] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#159957] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* List of Shared Goals */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#707782] mb-4">
          Metas que você está acompanhando ({sharedGoals.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#707782]">Carregando metas compartilhadas...</div>
        ) : sharedGoals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E7E9ED] shadow-xs space-y-3">
            <div className="w-14 h-14 bg-[#FFF1E7] text-[#FF6B00] rounded-2xl flex items-center justify-center mx-auto">
              <Share2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-[#202124]">Nenhuma meta compartilhada no momento</h4>
            <p className="text-xs text-[#707782] max-w-sm mx-auto leading-relaxed">
              Quando alguém compartilhar uma meta com você por link ou código, ela aparecerá aqui para você celebrar cada avanço!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {sharedGoals.map((share) => (
              <div
                key={share.id}
                className="bg-white rounded-3xl p-6 border border-[#E7E9ED] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B00] bg-[#FFF1E7] px-3 py-1 rounded-full">
                      Compartilhado por {share.ownerDisplayName || 'Amigo(a)'}
                    </span>
                    {share.status === 'completed' || share.progressPercentage >= 100 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6F4EA] text-[#159957]">
                        Concluída! 🎉
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F7F8FA] text-[#707782] border border-[#E7E9ED]">
                        Em andamento
                      </span>
                    )}
                  </div>

                  <h4 className="mt-3.5 text-lg font-bold text-[#202124]">{share.publicTitle}</h4>

                  {/* Mensagem de incentivo */}
                  <div className="mt-3 p-3.5 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED] text-xs text-[#202124] flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{share.encouragementMessage}</span>
                  </div>
                </div>

                {/* Main Progress Display - Destaque Obrigatório: Faltam X% para atingir esta meta */}
                <div className="space-y-2.5 pt-2 border-t border-[#E7E9ED]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#707782]">
                      Progresso atual
                    </span>
                    <span className="text-2xl font-black text-[#202124]">
                      {share.progressPercentage}%
                    </span>
                  </div>

                  {/* Progress Bar (Green #159957) */}
                  <div className="w-full bg-[#E7E9ED] h-3.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-[#159957] rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(0, share.progressPercentage))}%` }}
                    />
                  </div>

                  {/* DESTAQUE PRINCIPAL DA REGRA DE PRIVACIDADE */}
                  <div className="p-3 bg-[#FFF1E7] rounded-xl flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#E85D00] text-sm">
                      {share.progressPercentage >= 100
                        ? 'Meta 100% atingida!'
                        : `Faltam ${share.remainingPercentage}% para atingir esta meta`}
                    </span>
                    <span className="text-[11px] text-[#707782] flex items-center gap-1 font-medium">
                      <Lock className="w-3.5 h-3.5 text-[#FF6B00]" /> Valores confidenciais
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
