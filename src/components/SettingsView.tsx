import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Share,
  Monitor,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Database,
  RefreshCw,
  Trash2,
  FileDown,
  FileUp,
  CheckCircle2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BrandLogo } from './BrandLogo';
import {
  restoreDemoTransactions,
  clearAllTransactions,
  exportAllDataJSON,
  importDataJSON,
} from '../services/offlineDb';

interface SettingsViewProps {
  onDataChanged: () => void;
  onOpenPrivacyTerms: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onDataChanged,
  onOpenPrivacyTerms,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleRestoreDemo = async () => {
    setLoadingAction(true);
    try {
      await restoreDemoTransactions();
      onDataChanged();
      showNotification('success', 'Dados de exemplo escolar restaurados com sucesso!');
    } catch (err: any) {
      showNotification('error', 'Erro ao restaurar dados demonstrativos.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleClearData = async () => {
    setLoadingAction(true);
    try {
      await clearAllTransactions();
      onDataChanged();
      setConfirmClearOpen(false);
      showNotification('success', 'Todos os dados locais foram limpos com sucesso.');
    } catch (err: any) {
      showNotification('error', 'Erro ao limpar dados locais.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleExport = async () => {
    try {
      const json = await exportAllDataJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meu-dinheiro-em-dia-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('success', 'Backup exportado com sucesso!');
    } catch (err) {
      showNotification('error', 'Erro ao exportar dados.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await importDataJSON(text);
      if (res.success) {
        onDataChanged();
        showNotification('success', `${res.count} movimentações importadas com sucesso!`);
      } else {
        showNotification('error', res.error || 'Erro ao importar arquivo.');
      }
    } catch (err) {
      showNotification('error', 'Arquivo inválido.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs">
        <div className="inline-block px-3 py-1 bg-[#FFF1E7] text-[#E85D00] text-xs font-semibold rounded-full mb-1">
          Preferências & Instalação
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
          Configurações do Aplicativo
        </h1>
        <p className="text-xs text-[#707782]">
          Instalação PWA, contexto educativo escolar, privacidade e controle total dos dados locais.
        </p>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-[#E6F4EA] border-[#C2E7CE] text-[#159957]'
              : 'bg-red-50 border-red-200 text-[#D92D20]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* SEÇÃO 1: INSTALAÇÃO DO PWA (PROGRESSIVE WEB APP) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#202124]">
                  Instalação no Dispositivo (PWA)
                </h3>
                {isInstalled ? (
                  <span className="px-2 py-0.5 bg-[#E6F4EA] text-[#159957] text-[10px] font-bold rounded-full">
                    ✓ Instalado (App Nativo)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-[#FFF1E7] text-[#E85D00] text-[10px] font-bold rounded-full">
                    Acesso via Navegador
                  </span>
                )}
              </div>
              <p className="text-xs text-[#707782]">
                Instale o aplicativo na tela inicial do celular ou desktop para usar mesmo sem internet.
              </p>
            </div>
          </div>

          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={install}
              className="h-11 px-5 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98] shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Atalho Agora</span>
            </button>
          )}
        </div>

        {/* Guia de Instalação Passo a Passo */}
        <div className="bg-[#F7F8FA] rounded-2xl p-5 border border-[#E7E9ED] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E7E9ED] pb-3 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveGuideTab('android')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeGuideTab === 'android'
                  ? 'bg-white text-[#FF6B00] shadow-xs'
                  : 'text-[#707782] hover:text-[#202124]'
              }`}
            >
              Android (Chrome / Samsung)
            </button>
            <button
              type="button"
              onClick={() => setActiveGuideTab('ios')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeGuideTab === 'ios'
                  ? 'bg-white text-[#FF6B00] shadow-xs'
                  : 'text-[#707782] hover:text-[#202124]'
              }`}
            >
              iPhone & iPad (Safari)
            </button>
            <button
              type="button"
              onClick={() => setActiveGuideTab('pc')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeGuideTab === 'pc'
                  ? 'bg-white text-[#FF6B00] shadow-xs'
                  : 'text-[#707782] hover:text-[#202124]'
              }`}
            >
              Computador (Chrome / Edge)
            </button>
          </div>

          {activeGuideTab === 'android' && (
            <div className="space-y-2.5 text-xs text-[#202124]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFF1E7] text-[#FF6B00] font-bold flex items-center justify-center text-[11px] shrink-0">
                  1
                </span>
                <p className="text-[#707782] pt-0.5">
                  Clique no botão <strong>"Instalar Atalho Agora"</strong> acima ou no menu do navegador (três pontinhos ⋮).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFF1E7] text-[#FF6B00] font-bold flex items-center justify-center text-[11px] shrink-0">
                  2
                </span>
                <p className="text-[#707782] pt-0.5">
                  Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E6F4EA] text-[#159957] font-bold flex items-center justify-center text-[11px] shrink-0">
                  3
                </span>
                <p className="text-[#707782] pt-0.5">
                  O ícone do <strong>Meu Dinheiro em Dia</strong> aparecerá na tela do seu celular como um app nativo, rápido e sem barras de navegação!
                </p>
              </div>
            </div>
          )}

          {activeGuideTab === 'ios' && (
            <div className="space-y-2.5 text-xs text-[#202124]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFF1E7] text-[#FF6B00] font-bold flex items-center justify-center text-[11px] shrink-0">
                  1
                </span>
                <p className="text-[#707782] pt-0.5">
                  Abra este site no <strong>Safari</strong> do seu iPhone ou iPad.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFF1E7] text-[#FF6B00] font-bold flex items-center justify-center text-[11px] shrink-0">
                  2
                </span>
                <p className="text-[#707782] pt-0.5">
                  Toque no ícone de <strong>Compartilhar</strong> (quadrado com uma seta apontando para cima) na barra inferior.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFF1E7] text-[#FF6B00] font-bold flex items-center justify-center text-[11px] shrink-0">
                  3
                </span>
                <p className="text-[#707782] pt-0.5">
                  Role o menu para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E6F4EA] text-[#159957] font-bold flex items-center justify-center text-[11px] shrink-0">
                  4
                </span>
                <p className="text-[#707782] pt-0.5">
                  Toque em <strong>"Adicionar"</strong> no canto superior direito. O app estará na sua grade de aplicativos!
                </p>
              </div>
            </div>
          )}

          {activeGuideTab === 'pc' && (
            <div className="space-y-2.5 text-xs text-[#202124]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFF1E7] text-[#FF6B00] font-bold flex items-center justify-center text-[11px] shrink-0">
                  1
                </span>
                <p className="text-[#707782] pt-0.5">
                  No Chrome ou Edge, localize o ícone de instalação (computador com seta para baixo) na barra de endereços (ao lado da estrela de favoritos).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFF1E7] text-[#FF6B00] font-bold flex items-center justify-center text-[11px] shrink-0">
                  2
                </span>
                <p className="text-[#707782] pt-0.5">
                  Clique em <strong>"Instalar Meu Dinheiro em Dia"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E6F4EA] text-[#159957] font-bold flex items-center justify-center text-[11px] shrink-0">
                  3
                </span>
                <p className="text-[#707782] pt-0.5">
                  O aplicativo abrirá em uma janela própria e criará um atalho na sua Área de Trabalho e barra de tarefas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO 2: CONTEXTO EDUCATIVO (PROJETO DOS ALUNOS DO 8º ANO) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] text-[#159957] flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#202124]">
              Projeto Educativo — 8º Ano do Ensino Fundamental
            </h3>
            <p className="text-xs text-[#707782]">
              Iniciativa pedagógica para educação financeira, organização e cidadania.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED] space-y-2 text-xs text-[#707782] leading-relaxed">
          <p>
            O aplicativo <strong>Meu Dinheiro em Dia</strong> foi idealizado por estudantes do 8º ano do Ensino Fundamental com a mentoria de seus professores. O propósito é descomplicar a relação de jovens e famílias com o dinheiro, ensinando:
          </p>
          <ul className="list-disc pl-5 space-y-1 pt-1 text-[#202124]">
            <li>A diferença entre <strong>necessidades reais</strong> e <strong>desejos passageiros</strong> (Consumo Consciente).</li>
            <li>A importância de poupar um percentual de cada receita para imprevistos e projetos futuros.</li>
            <li>Como estabelecer metas de curto, médio e longo prazo com prazos realistas.</li>
            <li>O valor do compartilhamento de metas para motivação familiar, com proteção irrestrita da privacidade financeira.</li>
          </ul>
        </div>
      </div>

      {/* SEÇÃO 3: PRIVACIDADE E SEGURANÇA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1E7] text-[#FF6B00] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202124]">
                Privacidade e Proteção de Dados
              </h3>
              <p className="text-xs text-[#707782]">
                Seus dados financeiros permanecem sob seu estrito controle.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPrivacyTerms}
            className="text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer"
          >
            Ver Termos e Política
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#707782]">
          <div className="p-4 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED] space-y-1">
            <div className="font-bold text-[#202124]">Sem dados bancários sensíveis</div>
            <p>
              O aplicativo nunca solicita número de conta bancária, senha, código de segurança ou CPF. Todas as entradas são voluntárias e pedagógicas.
            </p>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-2xl border border-[#E7E9ED] space-y-1">
            <div className="font-bold text-[#202124]">Compartilhamento sem valores em R$</div>
            <p>
              Ao compartilhar uma meta com amigos ou familiares, eles veem apenas a porcentagem conquistada e o que falta (%). Os valores em reais nunca são exibidos.
            </p>
          </div>
        </div>
      </div>

      {/* SEÇÃO 4: GERENCIAMENTO DE DADOS LOCAIS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9ED] shadow-xs space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F8FA] text-[#202124] flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#202124]">
              Armazenamento Local & Backup
            </h3>
            <p className="text-xs text-[#707782]">
              Gerencie os dados salvos no banco de dados local (IndexedDB) deste dispositivo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Restaurar dados de exemplo */}
          <button
            type="button"
            disabled={loadingAction}
            onClick={handleRestoreDemo}
            className="p-4 bg-[#F7F8FA] hover:bg-slate-100 rounded-2xl border border-[#E7E9ED] text-left transition-colors cursor-pointer flex items-start gap-3"
          >
            <RefreshCw className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[#202124]">
                Restaurar Dados Didáticos (8º Ano)
              </div>
              <div className="text-[11px] text-[#707782]">
                Recarrega as movimentações e orçamentos de exemplo escolar.
              </div>
            </div>
          </button>

          {/* Exportar JSON */}
          <button
            type="button"
            onClick={handleExport}
            className="p-4 bg-[#F7F8FA] hover:bg-slate-100 rounded-2xl border border-[#E7E9ED] text-left transition-colors cursor-pointer flex items-start gap-3"
          >
            <FileDown className="w-5 h-5 text-[#159957] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[#202124]">
                Exportar Backup Local (JSON)
              </div>
              <div className="text-[11px] text-[#707782]">
                Baixe um arquivo seguro com todas as suas movimentações.
              </div>
            </div>
          </button>

          {/* Importar JSON */}
          <label className="p-4 bg-[#F7F8FA] hover:bg-slate-100 rounded-2xl border border-[#E7E9ED] text-left transition-colors cursor-pointer flex items-start gap-3">
            <FileUp className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[#202124]">
                Importar Backup (JSON)
              </div>
              <div className="text-[11px] text-[#707782]">
                Restaure movimentações a partir de um backup anterior.
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {/* Limpar dados */}
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="p-4 bg-red-50/50 hover:bg-red-50 rounded-2xl border border-red-200 text-left transition-colors cursor-pointer flex items-start gap-3"
          >
            <Trash2 className="w-5 h-5 text-[#D92D20] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[#D92D20]">
                Limpar Todos os Dados Locais
              </div>
              <div className="text-[11px] text-[#707782]">
                Apaga as movimentações armazenadas neste dispositivo.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Confirmação de Limpeza de Dados */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-[#E7E9ED] space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#D92D20] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#202124]">
                Limpar dados locais?
              </h3>
              <p className="text-xs text-[#707782]">
                Todas as movimentações e orçamentos salvos no IndexedDB deste aparelho serão removidos permanentemente.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="flex-1 h-11 rounded-xl border border-[#E7E9ED] text-xs font-bold text-[#202124] hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClearData}
                disabled={loadingAction}
                className="flex-1 h-11 bg-[#D92D20] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                {loadingAction ? 'Limpando...' : 'Sim, limpar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
