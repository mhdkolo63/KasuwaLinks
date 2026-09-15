import { supabase, isSupabaseConfigured } from './supabase';
import type { AuthResult, SignUpData, SignInData } from '@/types/database';

export async function signUp(data: SignUpData): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase is not configured. Please set up your environment variables.',
    };
  }

  try {
    const { error } = await supabase!.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
          location: data.location,
        },
      },
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred during registration.',
    };
  }
}

export async function signIn(data: SignInData): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase is not configured. Please set up your environment variables.',
    };
  }

  try {
    const { error } = await supabase!.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred during sign in.',
    };
  }
}

export async function signOut(): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured.' };
  }

  try {
    const { error } = await supabase!.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred during sign out.',
    };
  }
}

export async function resetPassword(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase is not configured. Please set up your environment variables.',
    };
  }

  try {
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: 'kasuwalink://reset-password',
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

export async function getCurrentSession() {
  if (!isSupabaseConfigured) return null;

  try {
    const { data } = await supabase!.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;

  try {
    const { data } = await supabase!.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

import type { AuthChangeEvent } from '@supabase/supabase-js';

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: import('@supabase/supabase-js').Session | null) => void
) {
  if (!isSupabaseConfigured) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase!.auth.onAuthStateChange(callback);
}
