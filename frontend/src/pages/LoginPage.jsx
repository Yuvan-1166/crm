import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleLogin } from '../services/authService';
import { Mail, UserPlus, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Get invite token from URL if present
  const inviteToken = searchParams.get('invite');
  const [isInvite, setIsInvite] = useState(!!inviteToken);

  useEffect(() => {
    if (inviteToken) {
      setIsInvite(true);
    }
  }, [inviteToken]);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      // Pass invite token if present
      const data = await googleLogin(credentialResponse.credential, inviteToken);
      login(data.user, data.token);
      
      // Navigation will be handled by the route protection logic in App.jsx
      // If user needs onboarding, they'll be redirected to /onboarding
      // If profile is complete, they'll go to /dashboard
    } catch (err) {
      const errorCode = err.response?.data?.code;
      const errorMessage = err.response?.data?.message;
      
      // Handle specific error codes with friendly messages
      if (errorCode === 'NOT_INVITED') {
        setError('You haven\'t been invited to this platform yet. Please ask your administrator for an invitation.');
      } else if (errorCode === 'EMAIL_MISMATCH') {
        setError(errorMessage);
      } else if (errorCode === 'INVALID_INVITE') {
        setError('This invitation link is invalid or has expired. Please ask your administrator for a new invitation.');
      } else if (errorCode === 'PENDING_INVITATION') {
        setError('Please use the invitation link sent to your email to complete your registration.');
      } else if (errorCode === 'ACCOUNT_DISABLED') {
        setError('Your account has been disabled. Please contact your administrator.');
      } else {
        setError(errorMessage || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-50 blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md border border-sky-100">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl shadow-lg mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          
          {isInvite ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3">
                <CheckCircle className="w-4 h-4" />
                You've been invited!
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Accept Invitation</h1>
              <p className="text-gray-500">Sign in with your Google account to join the team</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
              <p className="text-gray-500">Sign in to your CRM account</p>
            </>
          )}
        </div>

        {/* Invitation Info Banner */}
        {isInvite && !error && (
          <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-sky-800 font-medium">Complete your registration</p>
                <p className="text-xs text-sky-600 mt-1">
                  Click the button below to sign in with Google and join your team.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Google Login Button */}
        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
              <span className="ml-3 text-gray-600">
                {isInvite ? 'Setting up your account...' : 'Signing in...'}
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={!isInvite}
                theme="outline"
                size="large"
                text={isInvite ? "continue_with" : "signin_with"}
                shape="rectangular"
                logo_alignment="left"
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-400">Secure login</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Access Note for non-invited users */}
        {!isInvite && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">Invitation Required</p>
                <p className="text-xs text-amber-700 mt-1">
                  Only invited team members can access this platform. 
                  Contact your administrator if you need access.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Text */}
        <p className="text-center text-sm text-gray-500">
          By signing in, you agree to our{' '}
          <a href="#" className="text-sky-600 hover:text-sky-700 font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-sky-600 hover:text-sky-700 font-medium">
            Privacy Policy
          </a>
        </p>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400">
            © 2024 CRM System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
