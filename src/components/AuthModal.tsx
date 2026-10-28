import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TermsPrivacyModal } from './TermsPrivacyModal';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

type AuthTab = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    loginWithGoogle,
    loginWithApple,
    loginWithFacebook,
    loginWithMicrosoft,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    authError,
    clearAuthError,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setLocalError(null);
    clearAuthError();
    setResetSent(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim()) {
      setLocalError('Por favor, informe seu e-mail.');
      return;
    }

    if (activeTab === 'forgot') {
      setSubmitting(true);
      const success = await resetPassword(email);
      setSubmitting(false);
      if (success) {
        setResetSent(true);
      }
      return;
    }

    if (!password) {
      setLocalError('Por favor, informe sua senha.');
      return;
    }

    if (activeTab === 'register') {
      if (!name.trim()) {
        setLocalError('Por favor, informe seu nome completo.');
        return;
      }
      if (password.length < 6) {
        setLocalError('A senha deve conter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('As senhas digitadas não coincidem.');
        return;
      }
      if (!acceptTerms) {
        setLocalError('Você precisa aceitar os Termos de Uso e Política de Privacidade para criar uma conta.');
        return;
      }

      setSubmitting(true);
      const success = await registerWithEmail(name, email, password);
      setSubmitting(false);
      if (success && onClose) {
        onClose();
      }
    } else {
      setSubmitting(true);
      const success = await loginWithEmail(email, password);
      setSubmitting(false);
      if (success && onClose) {
        onClose();
      }
    }
  };

  const handleSocialLogin = async (providerFn: () => Promise<boolean>) => {
    setLocalError(null);
    clearAuthError();
    setSubmitting(true);
    const success = await providerFn();
    setSubmitting(false);
    if (success && onClose) {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E7E9ED] flex flex-col max-h-[92vh]">
          {/* Header - Original Symbol & Tagline */}
          <div className="pt-7 pb-4 px-6 text-center bg-linear-to-b from-[#FFF1E7]/50 to-white relative">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 p-2 text-[#707782] hover:text-[#202124] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Símbolo Original do Meu Dinheiro em Dia */}
            <div className="flex justify-center mb-3">
              <BrandLogo size={60} withShadow={true} />
            </div>

            <h2 className="text-xl font-extrabold text-[#202124] tracking-tight">Meu Dinheiro em Dia</h2>
            <p className="text-xs font-medium text-[#707782] mt-0.5">Suas metas, seu ritmo</p>
          </div>

          {/* Segmented Switcher */}
          <div className="px-6 pb-2">
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#F7F8FA] rounded-xl text-xs font-semibold text-[#707782] border border-[#E7E9ED]">
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'login' ? 'bg-white text-[#FF6B00] shadow-xs' : 'hover:text-[#202124]'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'register' ? 'bg-white text-[#FF6B00] shadow-xs' : 'hover:text-[#202124]'
                }`}
              >
                Criar conta
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('forgot')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'forgot' ? 'bg-white text-[#FF6B00] shadow-xs' : 'hover:text-[#202124]'
                }`}
              >
                Recuperar
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="px-6 py-4 overflow-y-auto space-y-4 flex-1 overscroll-contain">
            {/* Error Banners */}
            {(localError || authError) && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-[#D92D20] flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">{localError ? 'Atenção' : authError?.title}</div>
                  <div>{localError || authError?.message}</div>
                  {authError?.requiresConsoleSetup && (
                    <div className="mt-1 text-[11px] text-[#D92D20] bg-red-100/70 p-2 rounded-lg">
                      <span className="font-semibold">Como habilitar:</span> No Firebase Console, acesse{' '}
                      <strong>Authentication &gt; Sign-in method</strong> e adicione o provedor desejado.
                    </div>
                  )}
                </div>
              </div>
            )}

            {resetSent && (
              <div className="p-3.5 bg-[#E6F4EA] border border-[#159957]/30 rounded-2xl text-xs text-[#159957] flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#159957] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">E-mail de recuperação enviado!</div>
                  <div className="text-[#202124] mt-0.5">Verifique sua caixa de entrada para redefinir sua senha com segurança.</div>
                </div>
              </div>
            )}

            {/* Social Logins */}
            {activeTab !== 'forgot' && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#707782] text-center">
                  Entrar com provedor
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Google */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSocialLogin(loginWithGoogle)}
                    className="h-11 flex items-center justify-center gap-2 px-3 border border-[#E7E9ED] hover:border-slate-300 hover:bg-[#F7F8FA] rounded-xl text-xs font-semibold text-[#202124] transition-colors shadow-2xs cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Google
                  </button>

                  {/* Microsoft */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSocialLogin(loginWithMicrosoft)}
                    className="h-11 flex items-center justify-center gap-2 px-3 border border-[#E7E9ED] hover:border-slate-300 hover:bg-[#F7F8FA] rounded-xl text-xs font-semibold text-[#202124] transition-colors shadow-2xs cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    Microsoft
                  </button>

                  {/* Apple */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSocialLogin(loginWithApple)}
                    className="h-11 flex items-center justify-center gap-2 px-3 border border-[#E7E9ED] hover:border-slate-300 hover:bg-[#F7F8FA] rounded-xl text-xs font-semibold text-[#202124] transition-colors shadow-2xs cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14.01-6.1-9.44-10.9-20.2-14.4-32.28-3.5-12.08-5.25-23.75-5.25-35 0-16.14 4.19-29.6 12.57-40.38 8.38-10.78 19-16.27 31.86-16.48 5.48 0 11.29 1.48 17.44 4.43 6.14 2.95 10.19 4.49 12.14 4.62 1.63-.26 5.8-1.85 12.52-4.77 6.72-2.92 12.44-4.28 17.16-4.08 12.82.74 23.36 5.42 31.62 14.04-11.25 6.82-16.71 16.46-16.38 28.92.33 10.3 4.29 18.79 11.88 25.46 7.59 6.67 16.36 10.42 26.31 11.25-2.28 7.37-5.11 15.01-8.5 22.94zM119.22 31.81c0-7.39 2.65-14.48 7.95-21.27 5.3-6.79 11.83-10.54 19.59-11.25.33 1.2.49 2.28.49 3.26 0 7.38-2.73 14.61-8.19 21.68-5.46 7.07-12.08 10.79-19.84 11.16v-3.58z" />
                    </svg>
                    Apple
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSocialLogin(loginWithFacebook)}
                    className="h-11 flex items-center justify-center gap-2 px-3 border border-[#E7E9ED] hover:border-slate-300 hover:bg-[#F7F8FA] rounded-xl text-xs font-semibold text-[#202124] transition-colors shadow-2xs cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                </div>

                <div className="relative my-3 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E7E9ED]" />
                  </div>
                  <span className="relative bg-white px-3 text-[11px] uppercase font-semibold tracking-wider text-[#707782]">
                    Ou com e-mail
                  </span>
                </div>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-[#202124] mb-1">Nome completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707782]" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mariana Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-12 pl-10 pr-3.5 bg-white border border-[#E7E9ED] rounded-xl text-xs sm:text-sm text-[#202124] placeholder-[#707782]/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#202124] mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707782]" />
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-10 pr-3.5 bg-white border border-[#E7E9ED] rounded-xl text-xs sm:text-sm text-[#202124] placeholder-[#707782]/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
                  />
                </div>
              </div>

              {activeTab !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#202124]">Senha</label>
                    {activeTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => handleTabChange('forgot')}
                        className="text-[11px] text-[#FF6B00] hover:text-[#E85D00] font-semibold cursor-pointer"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707782]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-10 pr-10 bg-white border border-[#E7E9ED] rounded-xl text-xs sm:text-sm text-[#202124] placeholder-[#707782]/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707782] hover:text-[#202124] cursor-pointer"
                      aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#202124] mb-1">Confirmar senha</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707782]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Repita sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-12 pl-10 pr-3.5 bg-white border border-[#E7E9ED] rounded-xl text-xs sm:text-sm text-[#202124] placeholder-[#707782]/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="accept-terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 rounded border-[#E7E9ED] text-[#FF6B00] focus:ring-[#FF6B00]"
                    />
                    <label htmlFor="accept-terms" className="text-[11px] text-[#707782] leading-tight">
                      Li e concordo com os{' '}
                      <button
                        type="button"
                        onClick={() => setTermsModalOpen(true)}
                        className="text-[#FF6B00] underline font-semibold hover:text-[#E85D00]"
                      >
                        Termos de Uso e Política de Privacidade
                      </button>
                      .
                    </label>
                  </div>
                </>
              )}

              {/* Botão Principal Laranja (48-52px, semibold, #FF6B00) */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 mt-2 px-5 bg-[#FF6B00] hover:bg-[#E85D00] text-white font-semibold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {submitting ? (
                  <span className="inline-block animate-spin mr-1">↻</span>
                ) : activeTab === 'login' ? (
                  <>
                    Entrar <ArrowRight className="w-4 h-4" />
                  </>
                ) : activeTab === 'register' ? (
                  <>
                    Criar minha conta <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Enviar link de recuperação <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Alternar entre login e cadastro */}
            <div className="pt-2 text-center text-xs text-[#707782]">
              {activeTab === 'login' ? (
                <p>
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('register')}
                    className="font-bold text-[#FF6B00] hover:text-[#E85D00] cursor-pointer"
                  >
                    Criar minha conta
                  </button>
                </p>
              ) : activeTab === 'register' ? (
                <p>
                  Já possui uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="font-bold text-[#FF6B00] hover:text-[#E85D00] cursor-pointer"
                  >
                    Entrar
                  </button>
                </p>
              ) : (
                <p>
                  Lembrou sua senha?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="font-bold text-[#FF6B00] hover:text-[#E85D00] cursor-pointer"
                  >
                    Voltar ao login
                  </button>
                </p>
              )}
            </div>

            {/* Hint sobre segurança */}
            <div className="pt-2 pb-2 text-center border-t border-[#E7E9ED]">
              <p className="text-[10px] text-[#707782] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#159957] shrink-0" />
                <span>Autenticação segura via Firebase. Valores em R$ estritamente privados.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <TermsPrivacyModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />
    </>
  );
};
