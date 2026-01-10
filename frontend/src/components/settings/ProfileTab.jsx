import { memo } from 'react';
import { getInitials } from './utils/settingsHelpers';

/**
 * Profile tab component
 * Displays and allows editing of user profile information
 */
const ProfileTab = memo(({ user, onSave }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        <p className="text-gray-500 mt-1">Update your personal details</p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
          {getInitials(user?.name)}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{user?.name}</h3>
          <p className="text-gray-500">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            defaultValue={user?.name}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            defaultValue={user?.email}
            disabled
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            defaultValue={user?.phone}
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <input
            type="text"
            defaultValue={user?.department}
            placeholder="e.g., Sales, Marketing"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={onSave}
          className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-sky-500/25"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
});

ProfileTab.displayName = 'ProfileTab';

export default ProfileTab;
