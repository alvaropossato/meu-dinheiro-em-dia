import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  PieChart,
  Settings,
  LogOut,
  LogIn,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { BrandLogo } from './BrandLogo';

export type AppTab = 'inicio' | 'movimentacoes' | 'planejamento' | 'relatorios' | 'configuracoes';

interface NavbarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenAuth: () => void;
  sharedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAuth,
  sharedCount = 0,
}) => {
  const { user, userProfile, logout } = useAuth();

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Usuário';

  const navItems: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'inicio', label: 'Início', icon: LayoutDashboard },
    { id: 'movimentacoes', label: 'Movimentações', icon: ArrowLeftRight },
    { id: 'planejamento', label: 'Planejamento', icon: PiggyBank },
    { id: 'relatorios', label: 'Relatórios', icon: PieChart },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E7E9ED] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand - Símbolo original Meu Dinheiro em Dia */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => onSelectTab('inicio')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectTab('inicio')}
            aria-label="Ir para o início"
          >
            <BrandLogo size={40} className="group-hover:scale-105 transition-transform" />
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#202124] block leading-tight">
                Meu Dinheiro em Dia
              </span>
              <span className="text-[11px] font-medium text-[#707782] block leading-tight">
                Projeto Escolar • 8º Ano
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F7F8FA] p-1.5 rounded-2xl border border-[#E7E9ED]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-white text-[#FF6B00] shadow-xs'
                      : 'text-[#707782] hover:text-[#202124] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B00]' : 'text-[#707782]'}`} />
                  <span>{item.label}</span>
                  {item.id === 'planejamento' && sharedCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right User Actions & PWA Install */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton />

            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-[#E7E9ED]">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#202124] leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-[#707782] leading-tight truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#FFF1E7] text-[#E85D00] font-bold flex items-center justify-center border border-[#FFE3D1] text-xs shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={displayName} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  title="Sair da conta"
                  className="p-2 text-[#707782] hover:text-[#D92D20] hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  aria-label="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-2 h-10 px-4 bg-[#FF6B00] hover:bg-[#E85D00] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Medium Screen Nav Bar (Tablets < lg) */}
        <div className="hidden md:flex lg:hidden items-center justify-center gap-1 py-2 border-t border-[#E7E9ED]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isActive ? 'bg-[#FFF1E7] text-[#FF6B00]' : 'text-[#707782] hover:text-[#202124]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Bottom Navigation Bar (Smartphones) */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#E7E9ED] text-[10px] font-semibold text-[#707782]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                  isActive ? 'text-[#FF6B00] font-bold' : 'hover:text-[#202124]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B00]' : 'text-[#707782]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
