import { memo } from 'react';

/**
 * Background decoration with blur effect circles
 */
const BackgroundDecoration = memo(({ mode = 'default' }) => {
  if (mode === 'admin-register') {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-200 rounded-full opacity-40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-100 rounded-full opacity-30 blur-3xl" />
      </div>
    );
  }

  if (mode === 'invite') {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full opacity-50 blur-3xl" />
      </div>
    );
  }

  // Default mode
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full opacity-50 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-50 blur-3xl" />
    </div>
  );
});

BackgroundDecoration.displayName = 'BackgroundDecoration';

export default BackgroundDecoration;
