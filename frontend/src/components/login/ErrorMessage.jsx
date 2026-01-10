import { memo } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Error message alert for login forms
 */
const ErrorMessage = memo(({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
