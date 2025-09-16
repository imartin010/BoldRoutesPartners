import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

// 🧪 TESTING MODE: Auto-login with gmrolz account
// TODO: Remove this when ready to restore real authentication
const TESTING_MODE = false;
const TEST_USER: Partial<User> = {
  id: 'test-gmrolz-user-id',
  email: 'gmrolz@testing.com',
  user_metadata: {
    full_name: 'gmrolz',
    username: 'gmrolz'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  identities: [],
  factors: [],
  aud: 'authenticated',
  role: 'authenticated'
};

const TEST_SESSION: Partial<Session> = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: TEST_USER as User
};

/**
 * Hook for managing Supabase authentication state
 * 🧪 CURRENTLY IN TESTING MODE: Auto-authenticates with gmrolz account
 * Provides real-time auth status and user information
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (TESTING_MODE) {
      // 🧪 TESTING: Auto-login with gmrolz account
      console.log('🧪 TESTING MODE: Auto-authenticating with gmrolz account');
      console.log('📝 To restore real auth: Set TESTING_MODE = false in useAuth.ts');
      
      setTimeout(() => {
        setUser(TEST_USER as User);
        setSession(TEST_SESSION as Session);
        setLoading(false);
        console.log('✅ Test user gmrolz logged in successfully');
      }, 500); // Small delay to simulate loading
      
      return; // Skip real auth setup
    }

    // 🔐 REAL AUTH CODE (currently disabled)
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in:', session?.user?.email);
            break;
          case 'SIGNED_OUT':
            console.log('User signed out');
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed for:', session?.user?.email);
            break;
          case 'USER_UPDATED':
            console.log('User updated:', session?.user?.email);
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session,
  };
}
