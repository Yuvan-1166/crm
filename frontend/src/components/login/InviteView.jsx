import { memo } from 'react';
import { UserPlus, CheckCircle, Mail } from 'lucide-react';
import ErrorMessage from './ErrorMessage';
import GoogleLoginButton from './GoogleLoginButton';
import LoginFooter from './LoginFooter';

/**
 * Invitation info banner
 */
const InvitationBanner = memo(() => (
  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Mail className="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <p className="text-sm text-emerald-800 font-medium">Complete your registration</p>
        <p className="text-xs text-emerald-600 mt-1">
          Click the button below to sign in with Google and join your team.
        </p>
      </div>
    </div>
  </div>
));

InvitationBanner.displayName = 'InvitationBanner';

/**
 * Invite mode view for invited users
 */
const InviteView = memo(({
  error,
  loading,
  onGoogleSuccess,
  onGoogleError,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
    {/* Background decoration */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-50 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full opacity-50 blur-3xl" />
    </div>

    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 w-full max-w-md border border-emerald-100">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg shadow-emerald-500/30 mb-4">
          <UserPlus className="w-8 h-8 text-white" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-3">
          <CheckCircle className="w-4 h-4" />
          You've been invited!
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Accept Invitation</h1>
        <p className="text-gray-500">Sign in with your Google account to join the team</p>
      </div>

      {/* Show banner only when there's no error */}
      {!error && <InvitationBanner />}

      <ErrorMessage error={error} />

      <GoogleLoginButton
        loading={loading}
        loadingMessage="Setting up your account..."
        spinnerColor="border-emerald-500"
        onSuccess={onGoogleSuccess}
        onError={onGoogleError}
        text="continue_with"
      />

      <p className="text-center text-xs text-gray-400 mt-8">
        By signing in, you agree to our Terms and Privacy Policy
      </p>
    </div>
  </div>
));

InviteView.displayName = 'InviteView';

export default InviteView;
