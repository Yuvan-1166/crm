import { memo } from 'react';
import { GoogleLogin } from '@react-oauth/google';

/**
 * Loading spinner for authentication
 */
const LoadingSpinner = memo(({ message, spinnerColor = 'border-sky-500' }) => (
  <div className="flex items-center justify-center py-3">
    <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${spinnerColor}`} />
    <span className="ml-3 text-gray-600">{message}</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Google login button wrapper with loading state
 */
const GoogleLoginButton = memo(({
  loading,
  loadingMessage = 'Signing in...',
  spinnerColor = 'border-sky-500',
  onSuccess,
  onError,
  useOneTap = false,
  text = 'signin_with',
}) => (
  <div className="flex flex-col items-center gap-4">
    {loading ? (
      <LoadingSpinner message={loadingMessage} spinnerColor={spinnerColor} />
    ) : (
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          useOneTap={useOneTap}
          theme="outline"
          size="large"
          text={text}
          shape="rectangular"
          logo_alignment="left"
        />
      </div>
    )}
  </div>
));

GoogleLoginButton.displayName = 'GoogleLoginButton';

export default GoogleLoginButton;
