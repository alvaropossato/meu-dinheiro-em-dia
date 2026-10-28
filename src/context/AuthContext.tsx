import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { getFirebaseAuthErrorMessage } from '../utils/authErrors';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: { title: string; message: string; requiresConsoleSetup?: boolean } | null;
  clearAuthError: () => void;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  loginWithFacebook: () => Promise<boolean>;
  loginWithMicrosoft: () => Promise<boolean>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<{ title: string; message: string; requiresConsoleSetup?: boolean } | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Sincroniza documento de usuário em /users/{uid}
  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const profileData: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, profileData);
        setUserProfile(profileData);
      } else {
        setUserProfile(snap.data() as UserProfile);
      }
    } catch (err) {
      console.warn('Erro ao sincronizar perfil do usuário:', err);
      // Fallback em memória para não bloquear o fluxo do usuário
      setUserProfile({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Usuário',
        email: firebaseUser.email,
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      return true;
    } catch (error: any) {
      setAuthError(getFirebaseAuthErrorMessage(error));
      return false;
    }
  };

  const loginWithApple = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      await signInWithPopup(auth, provider);
      return true;
    } catch (error: any) {
      setAuthError(getFirebaseAuthErrorMessage(error));
      return false;
    }
  };

  const loginWithFacebook = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      return true;
    } catch (error: any) {
      setAuthError(getFirebaseAuthErrorMessage(error));
      return false;
    }
  };

  const loginWithMicrosoft = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const provider = new OAuthProvider('microsoft.com');
      await signInWithPopup(auth, provider);
      return true;
    } catch (error: any) {
      setAuthError(getFirebaseAuthErrorMessage(error));
      return false;
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      return true;
    } catch (error: any) {
      setAuthError(getFirebaseAuthErrorMessage(error));
      return false;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      await syncUserProfile(credential.user);
      // Opcional: enviar verificação de e-mail
      try {
        await sendEmailVerification(credential.user);
      } catch (e) {
        console.warn('Não foi possível enviar e-mail de verificação automático:', e);
      }
      return true;
    } catch (error: any) {
      setAuthError(getFirebaseAuthErrorMessage(error));
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (error: any) {
      setAuthError(getFirebaseAuthErrorMessage(error));
      return false;
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    setAuthError(null);
    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (error: any) {
      setAuthError(getFirebaseAuthErrorMessage(error));
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        authError,
        clearAuthError,
        loginWithGoogle,
        loginWithApple,
        loginWithFacebook,
        loginWithMicrosoft,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        resendVerificationEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
