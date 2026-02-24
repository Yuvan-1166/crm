import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConnectionStatus, getConnectUrl, disconnectEmail } from '../services/emailService';
import { exportContacts } from '../services/contactService';
import {
  SettingsSidebar,
  ProfileTab,
  IntegrationsTab,
  NotificationsTab,
  SecurityTab,
  PreferencesTab,
  SuccessMessage,
} from '../components/settings';

/**
 * SettingsPage - Main settings page component
 * 
 * Features:
 * - Profile management
 * - Google account integration (Gmail + Calendar)
 * - Notification preferences
 * - Security information
 * - App preferences
 */
const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('profile');
  
  // Email integration state
  const [emailConnected, setEmailConnected] = useState(false);
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailError, setEmailError] = useState(null);
  const [connectingEmail, setConnectingEmail] = useState(false);
  
  // UI state
  const [successMessage, setSuccessMessage] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportParams, setExportParams] = useState({
    period: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: Math.floor(new Date().getMonth() / 3) + 1,
    status: '',
  });
  
  // Dynamic back navigation based on user role
  const backPath = isAdmin ? '/admin' : '/dashboard';
  const backLabel = isAdmin ? 'Admin Dashboard' : 'Dashboard';

  // Check for OAuth callback params in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('email_connected') === 'true') {
      setEmailConnected(true);
      setActiveTab('integrations');
      setSuccessMessage('Google account connected successfully!');
      window.history.replaceState({}, '', '/settings');
      setTimeout(() => setSuccessMessage(null), 5000);
    } else if (params.get('email_error')) {
      setEmailError('Failed to connect Google account. Please try again.');
      setActiveTab('integrations');
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  // Check email connection status on mount
  useEffect(() => {
    checkEmailStatus();
  }, []);

  /**
   * Check Google connection status
   */
  const checkEmailStatus = useCallback(async () => {
    try {
      setEmailLoading(true);
      const status = await getConnectionStatus();
      setEmailConnected(status.connected);
    } catch (error) {
      console.error('Failed to check email status:', error);
    } finally {
      setEmailLoading(false);
    }
  }, []);

  /**
   * Initiate Google OAuth connection
   */
  const handleConnectEmail = useCallback(async () => {
    try {
      setConnectingEmail(true);
      setEmailError(null);
      const { authUrl } = await getConnectUrl();
      window.location.href = authUrl;
    } catch (error) {
      setEmailError('Failed to initiate connection. Please try again.');
      setConnectingEmail(false);
    }
  }, []);

  /**
   * Disconnect Google account
   */
  const handleDisconnectEmail = useCallback(async () => {
    if (!confirm('Are you sure you want to disconnect your Google account? Gmail and Calendar sync will stop working until you reconnect.')) {
      return;
    }
    
    try {
      setEmailLoading(true);
      await disconnectEmail();
      setEmailConnected(false);
      setSuccessMessage('Google account disconnected');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setEmailError('Failed to disconnect. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  }, []);

  const handleExportDownload = useCallback(async () => {
    try {
      setExportLoading(true);

      const params = {
        period: exportParams.period,
        year: exportParams.year || undefined,
        month: exportParams.period === 'monthly' ? exportParams.month : undefined,
        quarter: exportParams.period === 'quarterly' ? exportParams.quarter : undefined,
        status: exportParams.status || undefined,
      };

      const blob = await exportContacts(params);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `contacts-${params.period}-${params.year || 'all'}.csv`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage('Export prepared — download should begin shortly.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      alert(err.response?.data?.message || err.message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  }, [exportParams]);
  /**
   * Navigate back to dashboard
   */
  const handleBack = useCallback(() => {
    navigate(backPath);
  }, [navigate, backPath]);

  /**
   * Clear success message
   */
  const handleDismissSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  /**
   * Clear email error
   */
  const handleClearError = useCallback(() => {
    setEmailError(null);
  }, []);

  /**
   * Render the active tab content
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} />;
      
      case 'integrations':
        return (
          <IntegrationsTab
            emailConnected={emailConnected}
            emailLoading={emailLoading}
            emailError={emailError}
            connectingEmail={connectingEmail}
            userEmail={user?.email}
            onConnect={handleConnectEmail}
            onDisconnect={handleDisconnectEmail}
            onClearError={handleClearError}
          />
        );
      
      case 'notifications':
        return <NotificationsTab />;
      
      case 'security':
        return <SecurityTab user={user} />;
      
      case 'preferences':
        return <PreferencesTab />;
      
      default:
        return <ProfileTab user={user} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Fixed Left Sidebar */}
      <SettingsSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={handleBack}
        backLabel={backLabel}
        user={user}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        {/* Success Message */}
        <SuccessMessage 
          message={successMessage} 
          onDismiss={handleDismissSuccess} 
        />

        {/* Content */}
        <div className="p-4 lg:p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
            {isAdmin && (
              <div className="mb-4 border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Admin — Export contacts</h3>
                    <p className="text-xs text-gray-500">Download contacts by month, quarter or year. Leave year blank for a full-yearly export (includes created_year).</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={exportParams.period}
                      onChange={(e) => setExportParams(p => ({ ...p, period: e.target.value }))}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>

                    {exportParams.period === 'monthly' && (
                      <input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Month"
                        value={exportParams.month || ''}
                        onChange={(e) => setExportParams(p => ({ ...p, month: e.target.value ? parseInt(e.target.value) : undefined }))}
                        className="w-20 border rounded px-2 py-1 text-sm"
                      />
                    )}

                    {exportParams.period === 'quarterly' && (
                      <input
                        type="number"
                        min="1"
                        max="4"
                        placeholder="Quarter"
                        value={exportParams.quarter || ''}
                        onChange={(e) => setExportParams(p => ({ ...p, quarter: e.target.value ? parseInt(e.target.value) : undefined }))}
                        className="w-24 border rounded px-2 py-1 text-sm"
                      />
                    )}

                    <input
                      type="number"
                      placeholder="Year (optional)"
                      value={exportParams.year || ''}
                      onChange={(e) => setExportParams(p => ({ ...p, year: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-28 border rounded px-2 py-1 text-sm"
                    />

                    <select
                      value={exportParams.status}
                      onChange={(e) => setExportParams(p => ({ ...p, status: e.target.value }))}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">All</option>
                      <option value="LEAD">LEAD</option>
                      <option value="MQL">MQL</option>
                      <option value="SQL">SQL</option>
                      <option value="OPPORTUNITY">OPPORTUNITY</option>
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="EVANGELIST">EVANGELIST</option>
                      <option value="DORMANT">DORMANT</option>
                    </select>

                    <button
                      onClick={handleExportDownload}
                      disabled={exportLoading}
                      className="bg-sky-500 text-white px-3 py-1 rounded text-sm"
                    >
                      {exportLoading ? 'Preparing...' : 'Download'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
