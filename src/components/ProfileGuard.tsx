import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProfileCompletionForm from './ProfileCompletionForm';
import LoadingSpinner from './LoadingSpinner';

interface ProfileGuardProps {
  children: React.ReactNode;
}

export default function ProfileGuard({ children }: ProfileGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setProfileCompleted(false);
          setIsLoading(false);
          return;
        }

        // Check if user has completed their profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('profile_completed')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error checking profile status:', error);
          setProfileCompleted(false);
        } else {
          setProfileCompleted(profile?.profile_completed || false);
        }

        // If profile not completed, show the form
        if (!profile?.profile_completed) {
          setShowProfileForm(true);
        }
      } catch (error) {
        console.error('Profile check error:', error);
        setProfileCompleted(false);
        setShowProfileForm(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileStatus();
  }, []);

  const handleProfileComplete = () => {
    setProfileCompleted(true);
    setShowProfileForm(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (showProfileForm && !profileCompleted) {
    return <ProfileCompletionForm onComplete={handleProfileComplete} />;
  }

  return <>{children}</>;
}
