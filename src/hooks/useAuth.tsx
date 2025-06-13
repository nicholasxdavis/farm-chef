
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Check for backup login
    if (email === 'chef@farmesilla.com' && password === 'FARM1840!') {
      // Create a mock session for backup login
      const mockUser = {
        id: 'backup-chef-user',
        email: 'chef@farmesilla.com',
        user_metadata: { role: 'chef' }
      } as User;
      
      setUser(mockUser);
      setSession({ user: mockUser } as Session);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    // Handle backup user logout
    if (user?.id === 'backup-chef-user') {
      setUser(null);
      setSession(null);
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut
  };
};
