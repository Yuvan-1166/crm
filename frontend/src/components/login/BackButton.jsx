import { memo } from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * Back button for navigating between login modes
 */
const BackButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
    aria-label="Go back"
  >
    <ArrowLeft className="w-5 h-5" />
  </button>
));

BackButton.displayName = 'BackButton';

export default BackButton;
