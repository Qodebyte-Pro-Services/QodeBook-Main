'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useGoogleAuth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const error = searchParams?.get('error');

  useEffect(() => {
    if (error === 'OAuthAccountNotLinked') {
      toast({
        title: 'Account exists',
        description: 'An account already exists with this email. Please sign in instead.',
      });
      router.push('/login');
    } else if (error) {
      toast({
        title: 'Authentication failed',
        description: 'Failed to authenticate with Google. Please try again.',
      });
    }
  }, [error, router, toast]);

  const startGoogleSignup = useCallback(() => {
    signIn('google', { callbackUrl: '/onboarding' });
  }, []);

  return {
    startGoogleSignup,
    isGoogleLoading: false,
  };
};
