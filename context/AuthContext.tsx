import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import * as authService from '@/services/authService';
import { createProfileIfMissing } from '@/services/sellerService';
import type { SignUpData, SignInData, AuthResult } from '@/types/database';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (data: SignUpData) => Promise<AuthResult>;
  signIn: (data: SignInData) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    supabase!.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    const { data: authListener } = supabase!.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (data: SignUpData): Promise<AuthResult> => {
    const result = await authService.signUp(data);
    if (result.success && isSupabaseConfigured) {
      const { data: sessionData } = await supabase!.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (userId) {
        await createProfileIfMissing(userId, data.fullName, data.phone);
      }
    }
    return result;
  }, []);
  const signIn = useCallback((data: SignInData) => authService.signIn(data), []);
  const signOut = useCallback(() => authService.signOut(), []);
  const resetPassword = useCallback((email: string) => authService.resetPassword(email), []);

  const value: AuthContextValue = {
    session,
    user,
    isAuthenticated: Boolean(session && user),
    isLoading,
    isConfigured: isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
