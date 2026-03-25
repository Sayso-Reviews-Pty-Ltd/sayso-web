import type { AuthUser } from '../lib/types/database';
import type { AuthSnapshotStatus } from '../lib/authSnapshot';

export interface AuthContextType {
  user: AuthUser | null;
  snapshotStatus: AuthSnapshotStatus;
  login: (email: string, password: string, desiredRole?: 'user' | 'business_owner') => Promise<AuthUser | null>;
  register: (
    email: string,
    password: string,
    username: string,
    accountType?: 'user' | 'business_owner',
    displayName?: string,
    consentGiven?: boolean
  ) => Promise<{ success: boolean; errorMessage?: string; errorCode?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
  }>;
  isLoading: boolean;
  isAuthInitialized: boolean;
  error: string | null;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  initialSnapshot?: any;
}
