// ============================================
// CREATE THIS FILE: components/GoogleLoginButton.jsx
// ============================================

'use client';
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import AxiosInstance from '@/components/AxiosInstance';
import { AuthContext } from '@/components/AuthContext';

const GoogleLoginButton = () => {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Initiating Google Sign-In...');
      
      // Step 1: Sign in with Google using Firebase popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Google Sign-In successful:', user.email);

      // Step 2: Get Firebase ID token
      const idToken = await user.getIdToken();
      console.log('Firebase ID token obtained');

      // Step 3: Send ID token to your Django backend
      const response = await AxiosInstance.post('/api/user/v1/google/login/', {
        id_token: idToken
      });

      console.log('Backend response:', response.data);

      // Step 4: Check if login was successful
      // Your backend returns: { message: "Successful", data: {...}, count: null }
      if (response.data.message === 'Successful' && response.data.data) {
        // Use your existing login function from AuthContext
        login(response.data);
        
        // Notify the sidebar about auth change (from your existing code)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('authStateChanged'));
        }
        
        console.log('Google login successful, redirecting to dashboard...');
        router.push('/admindashboard');
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
      
    } catch (err) {
      console.error('Google login error:', err);
      
      // Handle Firebase popup errors
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // User opened another popup, ignore this error
        return;
      } else if (err.response) {
        // Backend error
        const errorMessage = err.response.data?.message 
          || err.response.data?.detail 
          || err.response.data?.error
          || 'Failed to authenticate with Google';
        setError(errorMessage);
      } else if (err.request) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        type="button"
        className={`w-full flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
        }`}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Signing in with Google...
          </span>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-rose-500/20 border border-rose-500/30 text-white rounded-lg text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;