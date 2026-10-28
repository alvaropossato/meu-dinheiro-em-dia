import React, { useState } from 'react';
import { Download, Smartphone, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'button' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Se já estiver rodando instalado como PWA, não exibe o prompt
  if (isInstalled) {
    return null;
  }

  // Banner mode (topo do painel)
  if (variant === 'banner') {
    if (bannerDismissed) return null;
    if (!isInstallable && !isIOS) return null;

    return (
      <div className="bg-white border border-[#E7E9ED] rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 animate-in fade-in">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#202124]">
              Instale o Meu Dinheiro em Dia no seu celular ou PC
            </h4>
            <p className="text-[11px] sm:text-xs text-[#707782]">
              Acesse suas metas direto da tela inicial, com inicialização instantânea e sem barra do navegador.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isInstallable ? (
            <button
              type="button"
              onClick={install}
              className="h-10 px-4 bg-[#FF6B00] hover:bg-[#E85D00] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar atalho</span>
            </button>
          ) : isIOS ? (
            <button
              type="button"
              onClick={() => setShowIOSModal(true)}
              className="h-10 px-4 bg-[#FF6B00] hover:bg-[#E85D00] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Share className="w-3.5 h-3.5" />
              <span>Instalar no iPhone</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="p-1.5 text-[#707782] hover:text-[#202124] rounded-lg cursor-pointer"
            aria-label="Dispensar aviso de instalação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal iOS */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-[#E7E9ED]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E9ED]">
                <h3 className="font-bold text-[#202124] text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#FF6B00]" />
                  Instalar no iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1.5 text-[#707782] hover:text-[#202124] rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs text-[#202124]">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#FFF1E7] text-[#FF6B00] font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <span className="text-[#707782] leading-tight pt-0.5">
                    No Safari, toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima) na barra inferior.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#FFF1E7] text-[#FF6B00] font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <span className="text-[#707782] leading-tight pt-0.5">
                    Role a lista e toque em <strong>"Adicionar à Tela de Início"</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#E6F4EA] text-[#159957] font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <span className="text-[#707782] leading-tight pt-0.5">
                    Toque em <strong>"Adicionar"</strong> no canto superior. Pronto! O atalho estará na sua tela inicial como um app nativo.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full h-11 bg-[#F7F8FA] hover:bg-slate-100 text-[#202124] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant: Standard button for header / navigation
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 h-10 px-3.5 bg-[#FFF1E7] hover:bg-[#FFE3D1] text-[#E85D00] rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-[0.98]"
        title="Instalar Meu Dinheiro em Dia no seu dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar app</span>
        <span className="sm:hidden">Instalar</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSModal(true)}
          className="flex items-center gap-1.5 h-10 px-3.5 bg-[#FFF1E7] hover:bg-[#FFE3D1] text-[#E85D00] rounded-xl text-xs font-semibold transition-all cursor-pointer"
          title="Instalar no iPhone"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Instalar no iOS</span>
          <span className="sm:hidden">Instalar</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-[#E7E9ED]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E9ED]">
                <h3 className="font-bold text-[#202124] text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#FF6B00]" />
                  Instalar no iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1.5 text-[#707782] hover:text-[#202124] rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs text-[#202124]">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#FFF1E7] text-[#FF6B00] font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <span className="text-[#707782] leading-tight pt-0.5">
                    No Safari, toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima) na barra inferior.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#FFF1E7] text-[#FF6B00] font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <span className="text-[#707782] leading-tight pt-0.5">
                    Role e toque em <strong>"Adicionar à Tela de Início"</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#E6F4EA] text-[#159957] font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <span className="text-[#707782] leading-tight pt-0.5">
                    Toque em <strong>"Adicionar"</strong> no canto superior. Pronto! O atalho estará na sua tela inicial.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full h-11 bg-[#F7F8FA] hover:bg-slate-100 text-[#202124] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
