/**
 * Tradutor amigável de erros do Firebase Authentication para Português do Brasil (pt-BR).
 * Orienta claramente quando um provedor social precisa ser ativado no console.
 */
export function getFirebaseAuthErrorMessage(error: any): { title: string; message: string; requiresConsoleSetup?: boolean } {
  const code = error?.code || '';
  const rawMessage = error?.message || '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return {
        title: 'Provedor não habilitado',
        message: 'Este método de autenticação precisa ser habilitado no Firebase Console (Authentication > Sign-in method). Por padrão, apenas Google está ativo.',
        requiresConsoleSetup: true,
      };

    case 'auth/configuration-not-found':
      return {
        title: 'Configuração pendente',
        message: 'A configuração das chaves de API deste provedor (ex: Apple, Facebook ou Microsoft) ainda não foi finalizada no Firebase Console.',
        requiresConsoleSetup: true,
      };

    case 'auth/email-already-in-use':
      return {
        title: 'E-mail já cadastrado',
        message: 'Este endereço de e-mail já está associado a outra conta. Faça login ou solicite a recuperação de senha.',
      };

    case 'auth/invalid-email':
      return {
        title: 'E-mail inválido',
        message: 'Por favor, insira um endereço de e-mail válido (exemplo: usuario@email.com).',
      };

    case 'auth/weak-password':
      return {
        title: 'Senha fraca',
        message: 'A senha deve conter no mínimo 6 caracteres para garantir sua segurança.',
      };

    case 'auth/user-not-found':
      return {
        title: 'Usuário não encontrado',
        message: 'Não encontramos nenhuma conta com este e-mail. Verifique a digitação ou crie uma conta.',
      };

    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        title: 'Credenciais incorretas',
        message: 'E-mail ou senha incorretos. Por favor, verifique os dados digitados e tente novamente.',
      };

    case 'auth/popup-closed-by-user':
      return {
        title: 'Janela fechada',
        message: 'A janela de autenticação foi fechada antes de concluir o login. Tente novamente.',
      };

    case 'auth/popup-blocked':
      return {
        title: 'Popup bloqueado',
        message: 'Seu navegador bloqueou a janela de login. Por favor, permita popups para este site.',
      };

    case 'auth/account-exists-with-different-credential':
      return {
        title: 'Conta já existente',
        message: 'Já existe uma conta com este mesmo e-mail vinculada a outro provedor de login.',
      };

    case 'auth/too-many-requests':
      return {
        title: 'Muitas tentativas',
        message: 'O acesso a esta conta foi temporariamente suspenso devido a muitas tentativas inválidas. Tente mais tarde ou redefina sua senha.',
      };

    case 'auth/network-request-failed':
      return {
        title: 'Erro de conexão',
        message: 'Falha de comunicação com a rede. Verifique sua conexão com a internet e tente novamente.',
      };

    default:
      if (rawMessage.includes('popup') || rawMessage.includes('cancelled')) {
        return {
          title: 'Ação cancelada',
          message: 'O processo de autenticação foi interrompido.',
        };
      }
      return {
        title: 'Não foi possível autenticar',
        message: error?.message || 'Ocorreu um erro inesperado durante a autenticação. Tente novamente.',
      };
  }
}
