import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { Bell, Menu, ChevronDown } from 'lucide-react';
import Profile from '../layout/Profile';
import { getInitials, getPageTitle } from './utils/dashboardHelpers';

/**
 * Notification bell component
 */
const NotificationBell = memo(() => (
  <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
    <Bell className="w-5 h-5 text-gray-600" />
    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
  </button>
));

NotificationBell.displayName = 'NotificationBell';

/**
 * User menu button component
 */
const UserMenuButton = memo(({ user, isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-lg py-1.5 pr-2 transition-colors"
  >
    <div className="hidden sm:block text-right">
      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
      <p className="text-xs text-gray-500">{user?.department || user?.role}</p>
    </div>
    <div className="relative">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
        {getInitials(user?.name)}
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
    </div>
    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </button>
));

UserMenuButton.displayName = 'UserMenuButton';

/**
 * Dashboard header component
 * Contains page title, notifications, and user menu
 */
const DashboardHeader = memo(({
  activeView,
  activeStage,
  user,
  logout,
  onMobileMenuOpen,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen(prev => !prev);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Left - Mobile Menu & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuOpen}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Page Title - Desktop */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900">
              {getPageTitle(activeView, activeStage)}
            </h1>
          </div>
        </div>

        {/* Right - Notifications & User Menu */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          {/* User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <UserMenuButton
              user={user}
              isOpen={userMenuOpen}
              onClick={toggleUserMenu}
            />

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <Profile 
                user={user}
                logout={logout}
                setUserMenuOpen={setUserMenuOpen}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
