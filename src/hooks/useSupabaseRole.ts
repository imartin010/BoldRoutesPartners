import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSupabaseRoleReturn {
  role: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get current user's role from Supabase profiles table
 * Automatically refetches when auth state changes
 */
export function useSupabaseRole(): UseSupabaseRoleReturn {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRole = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        setRole(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.session.user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error(`Failed to fetch user role: ${profileError.message}`);
      }

      setRole(profile?.role || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchRole();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        fetchRole();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    role,
    isAdmin: role === 'admin',
    isLoading,
    error,
    refetch: fetchRole,
  };
}
