import { memo } from 'react';
import { X } from 'lucide-react';

/**
 * Error alert component
 * Displays error messages with dismiss functionality
 */
const ErrorAlert = memo(({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="mx-4 lg:mx-6 mt-3">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <svg 
          className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
        <button 
          onClick={onDismiss} 
          className="text-red-500 hover:text-red-700"
          aria-label="Dismiss error"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

ErrorAlert.displayName = 'ErrorAlert';

export default ErrorAlert;
