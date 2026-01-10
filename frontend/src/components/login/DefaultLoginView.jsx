import { memo } from 'react';
import { Building2, Mail, Crown, ArrowRight } from 'lucide-react';
import ErrorMessage from './ErrorMessage';
import GoogleLoginButton from './GoogleLoginButton';
import LoginFooter from './LoginFooter';

/**
 * Invitation required notice
 */
const InvitationNotice = memo(() => (
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
));

InvitationNotice.displayName = 'InvitationNotice';

/**
 * Divider with text
 */
const Divider = memo(() => (
  <div className="flex items-center my-6">
    <div className="flex-1 border-t border-gray-200" />
    <span className="px-4 text-sm text-gray-400">or</span>
    <div className="flex-1 border-t border-gray-200" />
  </div>
));

Divider.displayName = 'Divider';

/**
 * Create organization CTA button
 */
const CreateOrgButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30"
  >
    <div className="flex items-center justify-center gap-3">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
        <Crown className="w-5 h-5" />
      </div>
      <div className="text-left">
        <p className="text-sm font-bold">Create New Organization</p>
        <p className="text-xs text-amber-100">Set up your company as an Admin</p>
      </div>
      <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
    </div>
  </button>
));

CreateOrgButton.displayName = 'CreateOrgButton';

/**
 * Default login view
 */
const DefaultLoginView = memo(({
  error,
  loading,
  onGoogleSuccess,
  onGoogleError,
  onAdminRegister,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
    {/* Background decoration */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full opacity-50 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-50 blur-3xl" />
    </div>

    {/* Login Card */}
    <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 w-full max-w-md border border-sky-100">
      {/* Logo / Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl shadow-lg shadow-sky-500/30 mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-500">Sign in to your CRM account</p>
      </div>

      <ErrorMessage error={error} />

      <div className="mb-6">
        <GoogleLoginButton
          loading={loading}
          loadingMessage="Signing in..."
          spinnerColor="border-sky-500"
          onSuccess={onGoogleSuccess}
          onError={onGoogleError}
          useOneTap
          text="signin_with"
        />
      </div>

      <InvitationNotice />

      <Divider />

      <CreateOrgButton onClick={onAdminRegister} />

      <LoginFooter showLinks showCopyright />
    </div>
  </div>
));

DefaultLoginView.displayName = 'DefaultLoginView';

export default DefaultLoginView;
