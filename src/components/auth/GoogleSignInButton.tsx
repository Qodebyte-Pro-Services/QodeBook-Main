"use client";

import { GoogleCredentialResponse, GoogleLogin } from '@react-oauth/google';
import axiosInstance from '@/lib/axios';
import Cookies from "js-cookie";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type AuthResponse = {
  message: string;
  token: string;
}

const GoogleSignInButton = ({path}: {path: string}) => {
  const router = useRouter();
  
  // Check if Google Client ID is configured
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    console.error('Google Client ID not configured');
    return <div className="text-red-500 text-sm">Google Sign-In not configured</div>;
  }
  
  const handleSuccess = async (credentialResponse: GoogleCredentialResponse) => {
    const idToken = credentialResponse.credential;
    try {
      const { data } = await axiosInstance.post('/api/auth/social-login/google', {
        idToken,
      });
      const { message, token } = data as AuthResponse;
      Cookies.set("authToken", token, {
        expires: 1,
        sameSite: "strict",
        secure: process.env.NEXT_PUBLIC_NODE_ENV === "prod",
      });
      toast.success(message);
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push(`${path}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleError = () => {
    console.log('Google Login Failed - FedCM Error');
    toast.error('Google Sign-In failed. Please try again or use email login.');
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap={false}
      auto_select={false}
    />
  );
}

export default GoogleSignInButton;