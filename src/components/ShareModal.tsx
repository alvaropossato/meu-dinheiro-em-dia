import React, { useEffect, useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Goal, SharedGoalProjection } from '../types';
import { createGoalShare, getGoalShares, revokeGoalShare } from '../services/shareService';
import { calculateGoalPercentages } from '../utils/finance';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  ownerDisplayName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  goal,
  ownerDisplayName,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [activeShares, setActiveShares] = useState<SharedGoalProjection[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [createdShare, setCreatedShare] = useState<SharedGoalProjection | null>(null);

  const loadShares = async (g: Goal) => {
    setLoading(true);
    try {
      const shares = await getGoalShares(g.id, g.ownerId);
      setActiveShares(shares || []);
    } catch (e) {
      console.error('Erro ao buscar compartilhamentos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && goal) {
      setCustomTitle(goal.name);
      setGuestEmail('');
      setCreatedShare(null);
      loadShares(goal);
    }
  }, [isOpen, goal]);

  if (!isOpen || !goal) return null;

  const { progressPercentage, remainingPercentage } = calculateGoalPercentages(
    goal.targetAmount,
    goal.currentAmount
  );

  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const share = await createGoalShare(goal, ownerDisplayName, {
        customPublicTitle: customTitle.trim() || goal.name,
        guestEmail: guestEmail.trim() || undefined,
      });
      setCreatedShare(share);
      await loadShares(goal);
    } catch (err) {
      console.error('Erro ao gerar compartilhamento:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (shareId: string) => {
    try {
      await revokeGoalShare(shareId, goal.ownerId);
      await loadShares(goal);
      if (createdShare?.id === shareId) {
        setCreatedShare(null);
      }
    } catch (err) {
      console.error('Erro ao revogar:', err);
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2500);
    } else {
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(null), 2500);
    }
  };

  const getShareUrl = (code: string) => {
    return `${window.location.origin}/?invite=${code}#shared`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-[#E7E9ED]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E7E9ED] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202124]">Compartilhar progresso</h2>
              <p className="text-xs text-[#707782]">Convite seguro com proteção de valores em R$</p>
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
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Strict Privacy Guarantee Box */}
          <div className="p-4 bg-[#FFF1E7] border border-[#FFE3D1] rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E85D00]">
              <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>REGRA DE PRIVACIDADE ABSOLUTA</span>
            </div>
            <p className="text-xs text-[#202124] leading-relaxed">
              O convidado visualizará <strong>apenas o percentual que falta ({remainingPercentage}%)</strong> e a barra de progresso.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-[#707782] font-medium border-t border-[#FFE3D1]/60">
              <Lock className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
              <span>Valores em reais (R$), saldos, depósitos e movimentações NUNCA são transmitidos ao convidado.</span>
            </div>
          </div>

          {/* Form to generate new share */}
          <form onSubmit={handleCreateShare} className="space-y-3.5 bg-[#F7F8FA] p-5 rounded-2xl border border-[#E7E9ED]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#707782]">
              Gerar novo convite
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#202124] mb-1">
                Nome público da meta
              </label>
              <input
                type="text"
                required
                maxLength={120}
                placeholder="Ex: Minha Meta de Estudos"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-[#E7E9ED] rounded-xl text-xs text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
              <span className="text-[11px] text-[#707782] mt-0.5 block">
                Nome que o convidado verá em sua tela.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202124] mb-1">
                Restringir a um e-mail específico <span className="text-[#707782] font-normal">(opcional)</span>
              </label>
              <input
                type="email"
                placeholder="amigo@exemplo.com (deixe vazio para permitir quem tiver o código)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-[#E7E9ED] rounded-xl text-xs text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              <Share2 className="w-4 h-4" />
              <span>{loading ? 'Gerando convite...' : 'Compartilhar progresso'}</span>
            </button>
          </form>

          {/* Newly created invite alert */}
          {createdShare && (
            <div className="p-4 bg-white border border-[#FF6B00]/40 rounded-2xl space-y-3 shadow-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#202124]">Convite gerado com sucesso!</span>
                <span className="text-[10px] px-2.5 py-0.5 bg-[#E6F4EA] text-[#159957] rounded-full font-bold">
                  Ativo
                </span>
              </div>

              {/* Code */}
              <div className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-xl border border-[#E7E9ED]">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#707782]">Código de acesso:</div>
                  <div className="text-base font-black text-[#FF6B00] tracking-wider">
                    {createdShare.inviteCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdShare.inviteCode, 'code')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#FFF1E7] hover:bg-[#FFE3D1] text-[#E85D00] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {copiedCode === createdShare.inviteCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#159957]" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar código
                    </>
                  )}
                </button>
              </div>

              {/* Direct Link */}
              <div className="flex items-center justify-between p-3 bg-[#F7F8FA] rounded-xl border border-[#E7E9ED]">
                <div className="truncate max-w-[280px]">
                  <div className="text-[10px] uppercase font-bold text-[#707782]">Link direto:</div>
                  <div className="text-xs text-[#202124] truncate">
                    {getShareUrl(createdShare.inviteCode)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(getShareUrl(createdShare.inviteCode), 'link')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-[#202124] border border-[#E7E9ED] text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {copiedLink === getShareUrl(createdShare.inviteCode) ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#159957]" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* List of active shares & revocation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#707782]">
              Convites ativos desta meta ({activeShares.length})
            </h3>

            {activeShares.length === 0 ? (
              <p className="text-xs text-[#707782] italic">Nenhum convite ativo no momento.</p>
            ) : (
              <div className="space-y-2">
                {activeShares.map((share) => (
                  <div
                    key={share.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                      share.revoked
                        ? 'bg-[#F7F8FA] border-[#E7E9ED] opacity-60'
                        : 'bg-white border-[#E7E9ED] shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#202124]">{share.publicTitle}</span>
                        {share.revoked ? (
                          <span className="px-2 py-0.5 bg-red-100 text-[#D92D20] text-[10px] rounded-full font-bold">
                            Revogado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#E6F4EA] text-[#159957] text-[10px] rounded-full font-bold">
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#707782] mt-0.5">
                        Código: <strong className="text-[#202124]">{share.inviteCode}</strong>
                        {share.allowedGuestEmails?.length > 0 && (
                          <span className="ml-2">• Restrito para: {share.allowedGuestEmails.join(', ')}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#707782] mt-0.5">
                        Progresso compartilhado: <strong>{share.progressPercentage}%</strong> (Faltam {share.remainingPercentage}%)
                      </div>
                    </div>

                    {!share.revoked ? (
                      <button
                        type="button"
                        onClick={() => handleRevoke(share.id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#D92D20] font-semibold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                        title="Revogar acesso imediatamente"
                      >
                        Revogar acesso
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#707782] font-medium">Acesso revogado</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7E9ED] bg-[#F7F8FA] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-5 bg-white hover:bg-slate-100 text-[#202124] border border-[#E7E9ED] font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
