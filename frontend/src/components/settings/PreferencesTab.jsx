import { memo } from 'react';
import { PREFERENCE_OPTIONS } from './utils/settingsHelpers';

/**
 * Select input component for preferences
 */
const SelectInput = memo(({ label, options, defaultValue, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select 
      defaultValue={defaultValue}
      onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
    >
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
));

SelectInput.displayName = 'SelectInput';

/**
 * Preferences tab component
 * Manages app-wide settings and preferences
 */
const PreferencesTab = memo(({ onSave }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
        <p className="text-gray-500 mt-1">Customize your CRM experience</p>
      </div>

      <div className="space-y-6">
        <SelectInput
          label="Default Pipeline View"
          options={PREFERENCE_OPTIONS.pipelineViews}
          defaultValue="Lead"
        />
        
        <SelectInput
          label="Contacts per Page"
          options={PREFERENCE_OPTIONS.contactsPerPage}
          defaultValue="25"
        />

        <SelectInput
          label="Date Format"
          options={PREFERENCE_OPTIONS.dateFormats}
          defaultValue="MM/DD/YYYY"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={onSave}
          className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-sky-500/25"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
});

PreferencesTab.displayName = 'PreferencesTab';

export default PreferencesTab;
