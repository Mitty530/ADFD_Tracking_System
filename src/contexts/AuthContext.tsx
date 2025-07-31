import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User as UserProfile, UserRole } from '../types/withdrawalTypes';
import { getAuthorizedUser } from '../config/authorizedUsers';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log('🔍 Fetching user profile for:', authUser.email);

      // Check authorization
      const authorizedUser = getAuthorizedUser(authUser.email || '');
      
      if (authorizedUser) {
        console.log('✅ User authorized:', authorizedUser.name, `(${authorizedUser.role})`);

        // Create user profile
        const userProfile: UserProfile = {
          id: authUser.id,
          name: authorizedUser.name,
          email: authUser.email || '',
          role: authorizedUser.role as UserRole,
          region: undefined,
          regional_countries: undefined,
          can_create_requests: authorizedUser.can_create_requests,
          can_approve_reject: authorizedUser.can_approve_reject,
          can_disburse: authorizedUser.can_disburse,
          view_only_access: authorizedUser.view_only_access,
          is_active: true,
          avatar_url: undefined
        };

        setUser(userProfile);
        setLoading(false);
        console.log('✅ Authentication complete');
      } else {
        console.error('❌ User not authorized:', authUser.email);
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing authentication...');
        
        // Check for magic link tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          console.log('🔗 Processing magic link...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('❌ Magic link error:', error);
            setLoading(false);
            return;
          }

          if (data.session?.user) {
            console.log('✅ Magic link successful');
            await fetchUserProfile(data.session.user);
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
        }

        // Check existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('✅ Existing session found');
          await fetchUserProfile(session.user);
        } else {
          console.log('ℹ️ No session found');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth init error:', error);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email: string): Promise<{ error?: string }> => {
    try {
      console.log('📧 Sending magic link to:', email);

      // Check if user is authorized before sending magic link
      const authorizedUser = getAuthorizedUser(email);
      if (!authorizedUser) {
        return { error: 'This email is not authorized to access the ADFD system. Please contact your administrator.' };
      }

      const redirectUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/dashboard'
        : `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: false,
        }
      });

      if (error) {
        console.error('❌ Magic link error:', error);
        return { error: error.message };
      }

      console.log('✅ Magic link sent successfully');
      return {};
    } catch (error) {
      console.error('❌ Magic link error:', error);
      return { error: 'Failed to send magic link. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      setUser(null);
      setSession(null);
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Failed to send reset email. Please try again.' };
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithMagicLink,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
