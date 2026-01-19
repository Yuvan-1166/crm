import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleLogin } from '../services/authService';
import { wakeUp } from '../services/healthService';
import {
  AdminRegisterView,
  InviteView,
  DefaultLoginView,
  LOGIN_MODES,
  getErrorMessage,
  ERROR_MESSAGES,
} from '../components/login';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Mode states: 'default' | 'admin-register' | 'invite'
  const [mode, setMode] = useState(LOGIN_MODES.DEFAULT);

  // Get invite token from URL if present
  const inviteToken = searchParams.get('invite');

  // Wake up backend/DB on login page load (entry point)
  useEffect(() => {
    wakeUp();
  }, []);

  useEffect(() => {
    if (inviteToken) {
      setMode(LOGIN_MODES.INVITE);
    }
  }, [inviteToken]);

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const isAdminRegistration = mode === LOGIN_MODES.ADMIN_REGISTER;
      const data = await googleLogin(
        credentialResponse.credential,
        mode === LOGIN_MODES.INVITE ? inviteToken : null,
        isAdminRegistration
      );

      login(data.user, data.token);

      // If new admin, redirect to onboarding
      if (data.isNewAdmin) {
        navigate('/onboarding');
      }
      // Navigation will be handled by the route protection logic in App.jsx
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [mode, inviteToken, login, navigate]);

  const handleGoogleError = useCallback(() => {
    setError(ERROR_MESSAGES.GOOGLE_ERROR);
  }, []);

  const handleSwitchToAdminRegister = useCallback(() => {
    setMode(LOGIN_MODES.ADMIN_REGISTER);
    setError('');
  }, []);

  const handleBackToDefault = useCallback(() => {
    setMode(LOGIN_MODES.DEFAULT);
    setError('');
  }, []);

  // Admin Registration Mode
  if (mode === LOGIN_MODES.ADMIN_REGISTER) {
    return (
      <AdminRegisterView
        error={error}
        loading={loading}
        onGoogleSuccess={handleGoogleSuccess}
        onGoogleError={handleGoogleError}
        onBack={handleBackToDefault}
      />
    );
  }

  // Invite Mode
  if (mode === LOGIN_MODES.INVITE) {
    return (
      <InviteView
        error={error}
        loading={loading}
        onGoogleSuccess={handleGoogleSuccess}
        onGoogleError={handleGoogleError}
      />
    );
  }

  // Default Login Mode
  return (
    <DefaultLoginView
      error={error}
      loading={loading}
      onGoogleSuccess={handleGoogleSuccess}
      onGoogleError={handleGoogleError}
      onAdminRegister={handleSwitchToAdminRegister}
    />
  );
};

export default LoginPage;
