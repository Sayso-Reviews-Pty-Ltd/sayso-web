"use client";

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../lib/auth';
import type { AuthUser } from '../../lib/types/database';
import { isSchemaCacheError } from '../AuthContext.utils';

export function useAuthCallbacks(
  user: AuthUser | null,
  setUser: (user: AuthUser | null) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setSnapshotStatus: (status: 'unknown' | 'authenticated' | 'guest') => void,
  supabase: any,
  deduplicatedGetCurrentUser: () => Promise<AuthUser | null>,
  router: ReturnType<typeof useRouter>
) {
  const login = useCallback(async (email: string, password: string, desiredRole?: 'user' | 'business_owner'): Promise<AuthUser | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { user: authUser, error: authError } = await AuthService.signIn({ email, password });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return null;
      }

      if (authUser) {
        const profileRole = authUser.profile?.role ?? null;
        const profileAccountRole = authUser.profile?.account_role ?? null;

        if (desiredRole && authUser.profile) {
          const userRole = profileAccountRole ?? profileRole;
          const hasDesiredRole = userRole === 'admin' || userRole === desiredRole;

          if (!hasDesiredRole) {
            const accountTypeName = desiredRole === 'user' ? 'Personal' : 'Business';
            const existingTypeName = userRole === 'user' ? 'Personal' : 'Business';
            setError(`This email only has a ${existingTypeName} account. Please select ${existingTypeName} to log in, or register a new ${accountTypeName} account.`);
            setIsLoading(false);
            await AuthService.signOut();
            return null;
          }
        }

        setUser(authUser);
        setSnapshotStatus("authenticated");
        let activeUser = authUser;

        if (desiredRole && authUser.profile) {
          const isAdminAccount = profileRole === 'admin' || profileAccountRole === 'admin';
          const hasDesiredRole = profileRole === desiredRole;
          const needsSwitch = !isAdminAccount && profileAccountRole !== desiredRole;

          if (hasDesiredRole && needsSwitch) {
            try {
              const response = await fetch('/api/user/switch-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newRole: desiredRole })
              });

              if (response.ok) {
                activeUser = {
                  ...authUser,
                  profile: {
                    ...authUser.profile,
                    account_role: desiredRole
                  }
                };
                setUser(activeUser);
                setSnapshotStatus("authenticated");
              }
            } catch (switchError) {
              console.warn('AuthContext: Failed to switch role after login', switchError);
            }
          }
        }

        if (!authUser.email_verified) {
          router.push('/verify-email');
          setIsLoading(false);
          return activeUser;
        }

        const userCurrentRole = activeUser.profile?.account_role ?? activeUser.profile?.role ?? 'user';
        const isAdminAccount = userCurrentRole === 'admin' || activeUser.profile?.role === 'admin';
        const isBusinessAccount = !isAdminAccount && userCurrentRole === 'business_owner';

        let redirectHint: string | null = null;
        if (typeof window !== 'undefined') {
          try {
            const candidate = new URLSearchParams(window.location.search).get('redirect');
            if (candidate && candidate.startsWith('/') && !candidate.startsWith('//')) {
              const forbiddenTargets = ['/login', '/register'];
              const isForbidden = forbiddenTargets.some((route) => candidate === route || candidate.startsWith(`${route}/`));
              if (!isForbidden) {
                redirectHint = candidate;
              }
            }
          } catch {
            redirectHint = null;
          }
        }

        if (redirectHint) {
          router.push(redirectHint);
        } else if (isAdminAccount) {
          router.push('/admin');
        } else if (isBusinessAccount) {
          router.push('/my-businesses');
        } else if (activeUser.profile?.onboarding_completed_at) {
          router.push('/home');
        } else {
          router.push('/interests');
        }

        setIsLoading(false);
        return activeUser;
      }

      setIsLoading(false);
      return null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
      setIsLoading(false);
      return null;
    }
  }, [router, supabase, deduplicatedGetCurrentUser, setUser, setIsLoading, setError, setSnapshotStatus]);

  const register = useCallback(async (
    email: string,
    password: string,
    username: string,
    accountType: 'user' | 'business_owner' = 'user',
    displayName?: string,
    consentGiven?: boolean
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('AuthContext: Starting registration...', { email, accountType });
      const { user: authUser, session, error: authError } = await AuthService.signUp({
        email,
        password,
        username,
        accountType,
        displayName,
        consentGiven
      });
      if (authError) {
        const rawMessage = authError?.message || '';
        const rawCode = authError?.code || 'unknown';
        if (rawMessage || rawCode !== 'unknown') {
          console.warn('AuthContext: Registration error details:', {
            message: rawMessage || 'Unknown error',
            code: rawCode,
          });
        }

        let errorMessage = rawMessage || 'Email already registered. Please log in.';
        if (
          authError.code === 'user_exists' ||
          authError.code === 'duplicate_account_type' ||
          rawMessage.toLowerCase().includes('already in use') ||
          rawMessage.toLowerCase().includes('already registered') ||
          rawMessage.toLowerCase().includes('email already') ||
          rawMessage.toLowerCase().includes('already exists')
        ) {
          errorMessage = rawMessage || 'Email already registered. Please log in.';
        }
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }
      if (authUser) {
        console.log('AuthContext: Registration successful', {
          email: authUser.email,
          email_verified: authUser.email_verified,
          user_id: authUser.id,
          has_session: !!session,
          session_data: session
        });
        setUser(authUser);
        setSnapshotStatus("authenticated");
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingVerificationEmail', authUser.email);
          sessionStorage.setItem('pendingVerificationAccountType', accountType);
        }
        router.push('/verify-email');
      }
      setIsLoading(false);
      return true;
    } catch (error: unknown) {
      console.log('AuthContext: Registration exception', error);
      const message = error instanceof Error ? error.message : 'Registration failed';
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, [router, supabase, setUser, setIsLoading, setError, setSnapshotStatus]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setUser(null);
    setSnapshotStatus("guest");

    try {
      const { error: signOutError } = await AuthService.signOut();

      if (signOutError) {
        setError(signOutError.message);
        return;
      }

      if (typeof window !== 'undefined') {
        window.location.replace('/login');
        return;
      }

      router.replace('/login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [router, supabase, setUser, setIsLoading, setError, setSnapshotStatus]);

  const updateUser = useCallback(async (userData?: Partial<AuthUser>): Promise<void> => {
    if (!user) return;
    if (!userData) return;

    setIsLoading(true);
    setError(null);

    try {
      if (userData?.profile) {
        interface ProfileUpdateFields {
          updated_at: string;
          onboarding_step?: string;
          avatar_url?: string | null;
          username?: string | null;
          display_name?: string | null;
        }
        const profileUpdates: ProfileUpdateFields = {
          updated_at: new Date().toISOString()
        };

        if (userData.profile.onboarding_step) {
          profileUpdates.onboarding_step = userData.profile.onboarding_step;
        }

        if (userData.profile.avatar_url !== undefined) {
          profileUpdates.avatar_url = userData.profile.avatar_url;
        }

        if (userData.profile.username !== undefined) {
          profileUpdates.username = userData.profile.username?.trim() || null;
        }

        if (userData.profile.display_name !== undefined) {
          profileUpdates.display_name = userData.profile.display_name?.trim() || null;
        }

        const { error } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('user_id', user.id);

        if (error) throw error;

        if (userData?.profile?.interests && Array.isArray(userData.profile.interests)) {
          try {
            const response = await fetch('/api/user/interests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ selections: userData.profile.interests })
            });
            if (!response.ok) {
              console.warn('Failed to update interests:', await response.text());
            }
          } catch (interestError) {
            console.warn('Error updating interests:', interestError);
          }
        }

        if (userData?.profile?.sub_interests && Array.isArray(userData.profile.sub_interests)) {
          try {
            const response = await fetch('/api/user/subcategories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subcategories: userData.profile.sub_interests })
            });
            if (!response.ok) {
              console.warn('Failed to update subcategories:', await response.text());
            }
          } catch (subcatError) {
            console.warn('Error updating subcategories:', subcatError);
          }
        }
      }

      let { data: freshProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('user_id, onboarding_step, onboarding_complete, onboarding_completed_at, interests_count, last_interests_updated, created_at, updated_at, avatar_url, username, display_name, is_top_reviewer, reviews_count, badges_count, subcategories_count, dealbreakers_count')
        .eq('user_id', user.id)
        .single();

      if (fetchError && isSchemaCacheError(fetchError)) {
        ({ data: freshProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('user_id, onboarding_step, onboarding_complete, onboarding_completed_at, interests_count, last_interests_updated, created_at, updated_at, avatar_url, username, display_name, is_top_reviewer, reviews_count, badges_count, subcategories_count, dealbreakers_count')
          .eq('user_id', user.id)
          .single());
      }

      let transformedProfile = null;
      if (userData && userData.profile) {
        transformedProfile = {
          username: userData.profile.username !== undefined
            ? (userData.profile.username?.trim() || undefined)
            : user.profile?.username,
          display_name: userData.profile.display_name !== undefined
            ? (userData.profile.display_name?.trim() || undefined)
            : user.profile?.display_name,
          avatar_url: userData.profile.avatar_url !== undefined
            ? userData.profile.avatar_url
            : user.profile?.avatar_url,
        };
      }

      try {
        const updatedUser = {
          ...user,
          ...userData,
          profile: transformedProfile ?? user.profile
        };
        console.log('Updated user state with fresh profile data:', {
          username: updatedUser.profile?.username,
          display_name: updatedUser.profile?.display_name,
          avatar_url: updatedUser.profile?.avatar_url
        });
        setUser(updatedUser);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Update failed';
        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('AuthContext: Error updating user:', error);
      setError('Failed to update user data');
      setIsLoading(false);
    }
  }, [user, supabase, setUser, setIsLoading, setError]);

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setSnapshotStatus("authenticated");
      } else {
        setSnapshotStatus("guest");
      }
    } catch (error: unknown) {
      console.warn('AuthContext: Error refreshing user:', error);
    }
  }, [user, setUser, setSnapshotStatus]);

  const resendVerificationEmail = useCallback(async (
    email: string
  ): Promise<{ success: boolean; errorCode?: string; errorMessage?: string }> => {
    setError(null);
    const normalizedEmail = email?.trim().toLowerCase();

    try {
      if (!normalizedEmail) {
        const message = 'No email address available to resend verification.';
        setError(message);
        return {
          success: false,
          errorCode: 'missing_email',
          errorMessage: message,
        };
      }

      if (
        user?.email_verified &&
        user.email?.trim().toLowerCase() === normalizedEmail
      ) {
        return {
          success: false,
          errorCode: 'already_verified',
          errorMessage: 'Your email is already verified. Please log in.',
        };
      }

      const { error } = await AuthService.resendVerificationEmail(normalizedEmail);

      if (error) {
        console.error('AuthContext: resendVerificationEmail failed:', {
          email: normalizedEmail,
          code: error.code,
          message: error.message,
          details: error.details,
        });
        setError(error.message);
        return {
          success: false,
          errorCode: error.code,
          errorMessage: error.message,
        };
      }

      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification email';
      console.error('AuthContext: resendVerificationEmail unexpected error:', {
        email: normalizedEmail,
        error,
      });
      setError(message);
      return {
        success: false,
        errorCode: 'unknown_error',
        errorMessage: message,
      };
    }
  }, [user, setError]);

  return { login, register, logout, updateUser, refreshUser, resendVerificationEmail };
}
