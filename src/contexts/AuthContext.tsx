import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SessionManager } from '@/lib/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  hasAccess: boolean;
  loading: boolean;
  needsOnboarding: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  submitAccessCode: (code: string) => Promise<{ error: any }>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const checkUserAccess = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('user_has_access', {
        user_id: userId
      });
      if (error) throw error;
      setHasAccess(data || false);
    } catch (error) {
      console.error('Error checking user access:', error);
      setHasAccess(false);
    }
  };

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_sportsbook')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // If no profile exists or no sportsbook preference, needs onboarding
      setNeedsOnboarding(!data || !data.preferred_sportsbook);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setNeedsOnboarding(true);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Update session expiry on successful auth
          SessionManager.updateSessionExpiry();
          
          // Check access and onboarding after setting user
          setTimeout(() => {
            checkUserAccess(session.user.id);
            checkOnboardingStatus(session.user.id);
          }, 0);
        } else {
          setHasAccess(false);
          SessionManager.clearSession();
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          checkUserAccess(session.user.id);
          checkOnboardingStatus(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    SessionManager.clearSession();
    await supabase.auth.signOut();
  };

  const submitAccessCode = async (code: string) => {
    if (!user) {
      return { error: { message: 'Must be logged in to submit access code' } };
    }

    try {
      // First, check if the code exists and is valid
      const { data: codeData, error: codeError } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        return { error: { message: 'Invalid or expired access code' } };
      }

      // Check if code has expired
      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        return { error: { message: 'Access code has expired' } };
      }

      // Check if code has reached max uses
      if (codeData.max_uses && codeData.current_uses >= codeData.max_uses) {
        return { error: { message: 'Access code has reached maximum uses' } };
      }

      // Check if user already used this code
      const { data: existingAccess } = await supabase
        .from('user_access')
        .select('*')
        .eq('user_id', user.id)
        .eq('access_code_id', codeData.id)
        .single();

      if (existingAccess) {
        // User already has access with this code
        setHasAccess(true);
        return { error: null };
      }

      // Grant access to user
      const { error: insertError } = await supabase
        .from('user_access')
        .insert({
          user_id: user.id,
          access_code_id: codeData.id
        });

      if (insertError) {
        return { error: insertError };
      }

      // Update code usage count
      await supabase
        .from('access_codes')
        .update({ current_uses: codeData.current_uses + 1 })
        .eq('id', codeData.id);

      setHasAccess(true);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const completeOnboarding = () => {
    setNeedsOnboarding(false);
  };

  const value = {
    user,
    session,
    hasAccess,
    loading,
    needsOnboarding,
    signUp,
    signIn,
    signOut,
    submitAccessCode,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}