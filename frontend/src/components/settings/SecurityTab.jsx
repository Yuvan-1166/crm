import { memo } from 'react';
import { Shield } from 'lucide-react';

/**
 * Security info card component
 */
const SecurityInfoCard = memo(({ label, description, value }) => (
  <div className="p-4 border border-gray-200 rounded-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
        {value}
      </span>
    </div>
  </div>
));

SecurityInfoCard.displayName = 'SecurityInfoCard';

/**
 * Security tab component
 * Displays account security information
 */
const SecurityTab = memo(({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Security</h2>
        <p className="text-gray-500 mt-1">Manage your account security settings</p>
      </div>

      {/* OAuth Status Banner */}
      <div className="p-5 bg-green-50 border border-green-200 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Google OAuth Active</h3>
            <p className="text-sm text-green-700 mt-1">
              Your account is secured with Google authentication. No password is stored.
            </p>
          </div>
        </div>
      </div>

      {/* Security Info Cards */}
      <div className="space-y-4">
        <SecurityInfoCard
          label="Account Role"
          description="Your permission level"
          value={user?.role?.toLowerCase() || 'user'}
        />
        
        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Account Email</p>
              <p className="text-sm text-gray-500">Primary authentication email</p>
            </div>
            <span className="text-sm text-gray-600">{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

SecurityTab.displayName = 'SecurityTab';

export default SecurityTab;
