import { memo } from 'react';
import { X } from 'lucide-react';

/**
 * Error state component for the FollowupsPage
 */
const ErrorState = memo(({ error, onBack, backLabel = 'Dashboard' }) => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <X className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Contact</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={onBack}
        className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
      >
        Back to {backLabel}
      </button>
    </div>
  </div>
));

ErrorState.displayName = 'ErrorState';

export default ErrorState;
