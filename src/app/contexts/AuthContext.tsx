"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '../lib/supabase/client';
import { AuthService } from '../lib/auth';
import type { AuthUser } from '../lib/types/database';
import type { AuthSnapshot, AuthSnapshotStatus } from '../lib/authSnapshot';
import { buildClientAuthSnapshot, UNKNOWN_AUTH_SNAPSHOT } from '../lib/authSnapshot';
import { AuthLifecycleEventType, emitAuthLifecycleEvent, subscribeAuthLifecycleEvent } from '../lib/authLifecycle';
import { AUTH_DEBOUNCE_MS, LOCALSTORAGE_CLEANUP_DELAY_MS, DEFAULT_AUTH_CONTEXT } from './AuthContext.constants';
import { isSchemaCacheError } from './AuthContext.utils';
import type { AuthContextType, AuthProviderProps } from './AuthContext.types';
import { useAuthCallbacks } from './hooks/useAuthCallbacks';

// Re-export types and constants for consumers
export type { AuthContextType, AuthProviderProps };
export { DEFAULT_AUTH_CONTEXT, AUTH_DEBOUNCE_MS, LOCALSTORAGE_CLEANUP_DELAY_MS, isSchemaCacheError };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Safe default when used outside AuthProvider (e.g. SSR or before mount). Guests see this until provider runs. */

export function AuthProvider({ children, initialSnapshot = UNKNOWN_AUTH_SNAPSHOT }: AuthProviderProps) {
  const initialUser = initialSnapshot.status === "authenticated" ? initialSnapshot.user : null;
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [snapshotStatus, setSnapshotStatus] = useState<AuthSnapshotStatus>(initialSnapshot.status);
  const [isLoading, setIsLoading] = useState(initialSnapshot.status === "unknown");
  // True immediately when server confirmed auth; true after client-side init settles in all other cases.
  const [isAuthInitialized, setIsAuthInitialized] = useState(initialSnapshot.status === "authenticated");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getBrowserSupabase();

  // Deduplicate concurrent getCurrentUser calls: reuse the same in-flight promise
  const fetchingUserRef = useRef<Promise<AuthUser | null> | null>(null);
  const initCompleteRef = useRef(false);
  const forcedMiddlewareRecheckRef = useRef(false);

  const deduplicatedGetCurrentUser = useCallback((): Promise<AuthUser | null> => {
    if (fetchingUserRef.current) {
      return fetchingUserRef.current;
    }
    const promise = AuthService.getCurrentUser().finally(() => {
      fetchingUserRef.current = null;
    });
    fetchingUserRef.current = promise;
    return promise;
  }, []);

  // Initialize auth state with retry logic (mobile-optimized)
  useEffect(() => {
    let isMounted = true;

    // Mobile devices get fewer retries and shorter timeouts
    const isMobile = typeof navigator !== 'undefined' &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const MAX_RETRIES = isMobile ? 1 : 3;
    const RETRY_DELAY_MS = isMobile ? 500 : 1000;

    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing auth...');
      if (initialSnapshot.status === "unknown") {
        setIsLoading(true);
      }

      const attemptInit = async (attempt: number): Promise<void> => {
        if (!isMounted) return;

        console.log(`[AuthContext] Auth init attempt ${attempt}/${MAX_RETRIES}`);

        try {
          const currentUser = await deduplicatedGetCurrentUser();

          if (!isMounted) return;

          console.log('[AuthContext] Got current user:', currentUser ? {
            id: currentUser.id,
            email: currentUser.email,
            email_verified: currentUser.email_verified,
            has_profile: !!currentUser.profile,
          } : null);

          const snapshot = buildClientAuthSnapshot(currentUser);
          setUser(snapshot.user);
          setSnapshotStatus(snapshot.status);
          setIsLoading(false);
          setIsAuthInitialized(true);
          initCompleteRef.current = true;
          console.log('[AuthContext] Auth initialization complete');
        } catch (error) {
          console.error(`[AuthContext] Error initializing auth (attempt ${attempt}/${MAX_RETRIES}):`, error);

          if (attempt < MAX_RETRIES) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isNetworkError =
              errorMessage.toLowerCase().includes('fetch') ||
              errorMessage.toLowerCase().includes('network') ||
              errorMessage.toLowerCase().includes('connection');

            if (isNetworkError) {
              const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
              console.log(`[AuthContext] Network error, retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return attemptInit(attempt + 1);
            }
          }

          if (isMounted) {
            setIsLoading(false);
            setIsAuthInitialized(true);
            setSnapshotStatus("guest");
            initCompleteRef.current = true;
          }
        }
      };

      attemptInit(1);
    };

    initializeAuth();

    // Listen for auth changes - MIDDLEWARE HANDLES ROUTING
    // Use a debounce timer so rapid-fire events (INITIAL_SESSION + SIGNED_IN)
    // collapse into a single getCurrentUser() call.
    let authChangeTimer: ReturnType<typeof setTimeout> | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthContext: Auth state change', { event, session_exists: !!session });

      // Broadcast to other tabs (storage events only fire in *other* tabs)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('auth_state_changed', JSON.stringify({
            type: event,
            timestamp: Date.now(),
            user_id: session?.user?.id
          }));
          setTimeout(() => localStorage.removeItem('auth_state_changed'), LOCALSTORAGE_CLEANUP_DELAY_MS);
        } catch {
          // Ignore localStorage errors (private browsing, etc.)
        }
      }

      // Sign-out is immediate — no need to fetch
      if (!session?.user) {
        if (authChangeTimer) clearTimeout(authChangeTimer);
        console.log('AuthContext: User signed out');
        setUser(null);
        setSnapshotStatus("guest");
        setIsLoading(false);
        // Reset so the next sign-in cycle can trigger a middleware recheck if needed.
        forcedMiddlewareRecheckRef.current = false;
        emitAuthLifecycleEvent(AuthLifecycleEventType.SIGNED_OUT, event);
        return;
      }

      // Debounce: collapse rapid successive events into one fetch
      if (authChangeTimer) clearTimeout(authChangeTimer);
      authChangeTimer = setTimeout(async () => {
        // Skip if init hasn't completed yet (init will handle the first fetch)
        if (!initCompleteRef.current) return;

        try {
          const currentUser = await deduplicatedGetCurrentUser();
          if (isMounted) {
            if (currentUser) {
              console.log('AuthContext: User state updated', {
                email: currentUser.email,
                email_verified: currentUser.email_verified,
              });
              setUser(currentUser);
              setSnapshotStatus("authenticated");
              if (event === "TOKEN_REFRESHED") {
                emitAuthLifecycleEvent(AuthLifecycleEventType.SESSION_REFRESHED, "supabase_token_refreshed");
              }
            } else {
              setUser(null);
              setSnapshotStatus("guest");
            }
            setIsLoading(false);
          }
        } catch (error) {
          console.warn('AuthContext: Error getting user from auth event:', error);
          if (isMounted) setIsLoading(false);
        }
      }, AUTH_DEBOUNCE_MS);
    });

    // Cross-tab sync via storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_state_changed' && e.newValue) {
        try {
          const authEvent = JSON.parse(e.newValue);
          if (authEvent.type === 'SIGNED_IN' || authEvent.type === 'SIGNED_OUT') {
            console.log('AuthContext: Auth state changed in another tab, refreshing...');
            deduplicatedGetCurrentUser().then(u => {
              if (!isMounted) return;
              setUser(u);
              setSnapshotStatus(u ? "authenticated" : "guest");
              if (!u && typeof window !== "undefined" && !forcedMiddlewareRecheckRef.current) {
                forcedMiddlewareRecheckRef.current = true;
                window.location.assign(window.location.href);
              }
            }).catch(err => {
              console.warn('AuthContext: Error refreshing after storage event:', err);
            });
          }
        } catch {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const unsubscribeLifecycle = subscribeAuthLifecycleEvent((detail) => {
      if (detail.type === AuthLifecycleEventType.SESSION_INVALIDATED) {
        void supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        setUser(null);
        setSnapshotStatus("guest");
        setIsLoading(false);
        // Force a single hard navigation so middleware can re-evaluate protected routing.
        if (typeof window !== "undefined" && !forcedMiddlewareRecheckRef.current) {
          forcedMiddlewareRecheckRef.current = true;
          window.location.assign(window.location.href);
        }
      }
      if (detail.type === AuthLifecycleEventType.SIGNED_OUT) {
        setUser(null);
        setSnapshotStatus("guest");
        // Lifecycle: ref is set on SESSION_INVALIDATED to trigger a single hard navigation.
        // Reset here so the next sign-in cycle can trigger a recheck again if needed.
        forcedMiddlewareRecheckRef.current = false;
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (authChangeTimer) clearTimeout(authChangeTimer);
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeLifecycle();
    };
  }, [supabase, deduplicatedGetCurrentUser, initialSnapshot.status]);

  const { login, register, logout, updateUser, refreshUser, resendVerificationEmail } = useAuthCallbacks(
    user,
    setUser,
    setIsLoading,
    setError,
    setSnapshotStatus,
    supabase,
    deduplicatedGetCurrentUser,
    router
  );

  // Memoize context value to prevent unnecessary re-renders
  const value: AuthContextType = useMemo(() => ({
    user,
    snapshotStatus,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    resendVerificationEmail,
    isLoading,
    isAuthInitialized,
    error
  }), [user, snapshotStatus, isLoading, isAuthInitialized, error, login, register, logout, updateUser, refreshUser, resendVerificationEmail]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  // When outside provider (e.g. SSR, or before layout mounts), return safe guest state so pages like /for-you don't 500
  if (context === undefined) {
    return DEFAULT_AUTH_CONTEXT;
  }
  return context;
}
