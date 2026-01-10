import { memo } from 'react';
import { Mail, Check, X, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { GMAIL_BENEFITS } from './utils/settingsHelpers';

/**
 * Gmail integration card component
 */
const GmailIntegration = memo(({
  emailConnected,
  emailLoading,
  connectingEmail,
  userEmail,
  onConnect,
  onDisconnect,
}) => (
  <div className={`border rounded-2xl p-6 transition-all ${
    emailConnected ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
  }`}>
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25">
        <Mail className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Gmail</h3>
          {emailConnected && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Connected
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Send emails to contacts directly from your Gmail account
        </p>
        {emailConnected && (
          <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Connected as {userEmail}
          </p>
        )}
      </div>
      <div>
        {emailLoading ? (
          <div className="flex items-center gap-2 text-gray-500 px-4 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Checking...</span>
          </div>
        ) : emailConnected ? (
          <button
            onClick={onDisconnect}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={connectingEmail}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-sky-500/25"
          >
            {connectingEmail ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>

    {/* Benefits section - shown when not connected */}
    {!emailConnected && !emailLoading && (
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Benefits of connecting Gmail:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GMAIL_BENEFITS.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-sky-500" />
              {benefit}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
));

GmailIntegration.displayName = 'GmailIntegration';

/**
 * Coming soon integration placeholder
 */
const ComingSoonIntegration = memo(({ icon, name, description }) => (
  <div className="border border-dashed border-gray-200 rounded-2xl p-6 opacity-60">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <h3 className="font-semibold text-gray-500">{name}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  </div>
));

ComingSoonIntegration.displayName = 'ComingSoonIntegration';

/**
 * Integrations tab component
 * Manages external service connections (Gmail, etc.)
 */
const IntegrationsTab = memo(({
  emailConnected,
  emailLoading,
  emailError,
  connectingEmail,
  userEmail,
  onConnect,
  onDisconnect,
  onClearError,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
        <p className="text-gray-500 mt-1">Connect external services to enhance your workflow</p>
      </div>

      {/* Error Alert */}
      {emailError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 flex-1">{emailError}</p>
          <button onClick={onClearError} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Gmail Integration */}
      <GmailIntegration
        emailConnected={emailConnected}
        emailLoading={emailLoading}
        connectingEmail={connectingEmail}
        userEmail={userEmail}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />

      {/* Coming Soon - Google Calendar */}
      <ComingSoonIntegration
        icon="📅"
        name="Google Calendar"
        description="Coming soon - Sync meetings and events"
      />
    </div>
  );
});

IntegrationsTab.displayName = 'IntegrationsTab';

export default IntegrationsTab;
