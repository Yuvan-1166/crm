import { memo } from 'react';

/**
 * Loading spinner component for the FollowupsPage
 */
const LoadingState = memo(() => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
  </div>
));

LoadingState.displayName = 'LoadingState';

export default LoadingState;
