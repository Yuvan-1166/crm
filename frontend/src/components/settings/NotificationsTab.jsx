import { memo } from 'react';
import { DEFAULT_NOTIFICATIONS } from './utils/settingsHelpers';

/**
 * Toggle switch component
 */
const ToggleSwitch = memo(({ checked, onChange }) => (
  <div className="relative">
    <input 
      type="checkbox" 
      defaultChecked={checked}
      onChange={onChange}
      className="sr-only peer" 
    />
    <div className="w-11 h-6 bg-gray-200 peer-checked:bg-sky-500 rounded-full transition-colors" />
    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
  </div>
));

ToggleSwitch.displayName = 'ToggleSwitch';

/**
 * Notification item component
 */
const NotificationItem = memo(({ item, onChange }) => (
  <label 
    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
  >
    <div>
      <p className="font-medium text-gray-900">{item.label}</p>
      <p className="text-sm text-gray-500">{item.desc}</p>
    </div>
    <ToggleSwitch checked={item.checked} onChange={onChange} />
  </label>
));

NotificationItem.displayName = 'NotificationItem';

/**
 * Notifications tab component
 * Manages notification preferences
 */
const NotificationsTab = memo(({ notifications = DEFAULT_NOTIFICATIONS, onToggle }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        <p className="text-gray-500 mt-1">Choose what updates you receive</p>
      </div>

      <div className="space-y-1">
        {notifications.map((item) => (
          <NotificationItem
            key={item.id}
            item={item}
            onChange={() => onToggle?.(item.id)}
          />
        ))}
      </div>
    </div>
  );
});

NotificationsTab.displayName = 'NotificationsTab';

export default NotificationsTab;
