import { memo } from 'react';
import { Building2, Users, Shield, Sparkles, Crown } from 'lucide-react';
import BackButton from './BackButton';
import ErrorMessage from './ErrorMessage';
import GoogleLoginButton from './GoogleLoginButton';
import LoginFooter from './LoginFooter';
import { ADMIN_FEATURES } from './utils/loginHelpers';

/**
 * Icon component resolver
 */
const IconMap = {
  Building2,
  Users,
  Shield,
};

/**
 * Feature item component
 */
const FeatureItem = memo(({ icon, title, description, bgColor, iconBg, iconColor }) => {
  const Icon = IconMap[icon];
  
  return (
    <div className={`flex items-center gap-3 p-3 ${bgColor} rounded-xl`}>
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
});

FeatureItem.displayName = 'FeatureItem';

/**
 * Admin registration view
 */
const AdminRegisterView = memo(({
  error,
  loading,
  onGoogleSuccess,
  onGoogleError,
  onBack,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
    {/* Background decoration */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200 rounded-full opacity-40 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-200 rounded-full opacity-40 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-100 rounded-full opacity-30 blur-3xl" />
    </div>

    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-amber-100">
      <BackButton onClick={onBack} />

      {/* Header */}
      <div className="text-center mb-8 mt-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-xl shadow-amber-500/30 mb-6">
          <Crown className="w-10 h-10 text-white" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          New Administrator
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
          Create Your Organization
        </h1>
        <p className="text-gray-500 leading-relaxed">
          Set up your CRM account and start managing your team
        </p>
      </div>

      {/* Features */}
      <div className="mb-8 space-y-3">
        {ADMIN_FEATURES.map((feature) => (
          <FeatureItem key={feature.icon} {...feature} />
        ))}
      </div>

      <ErrorMessage error={error} />

      <GoogleLoginButton
        loading={loading}
        loadingMessage="Creating your account..."
        spinnerColor="border-amber-500"
        onSuccess={onGoogleSuccess}
        onError={onGoogleError}
        text="continue_with"
      />

      <LoginFooter />
    </div>
  </div>
));

AdminRegisterView.displayName = 'AdminRegisterView';

export default AdminRegisterView;
