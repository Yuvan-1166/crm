import { memo } from 'react';
import { Check, X } from 'lucide-react';

/**
 * Success message banner component
 */
const SuccessMessage = memo(({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <div className="p-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
        <Check className="w-5 h-5 text-green-600" />
        <p className="text-sm text-green-800 font-medium">{message}</p>
        <button 
          onClick={onDismiss} 
          className="ml-auto text-green-600 hover:text-green-800"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

SuccessMessage.displayName = 'SuccessMessage';

export default SuccessMessage;
