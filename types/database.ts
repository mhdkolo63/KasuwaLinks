import type { Session, User } from '@supabase/supabase-js';

export interface AuthSession {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  location?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}
