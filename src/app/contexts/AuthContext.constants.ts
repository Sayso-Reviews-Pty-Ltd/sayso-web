import type { AuthContextType } from './AuthContext.types';

export const AUTH_DEBOUNCE_MS = 300;
export const LOCALSTORAGE_CLEANUP_DELAY_MS = 100;

export const DEFAULT_AUTH_CONTEXT: AuthContextType = {
  user: null,
  snapshotStatus: "unknown",
  isLoading: false,
  error: null,
  login: async () => null,
  register: async () => false,
  logout: async () => {},
  updateUser: async () => {},
  refreshUser: async () => {},
  resendVerificationEmail: async () => ({ success: false }),
};
