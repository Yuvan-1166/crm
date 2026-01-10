import { memo } from 'react';
import Sidebar from '../layout/Sidebar';

/**
 * Mobile sidebar overlay component
 * Shows sidebar in a modal overlay for mobile devices
 */
const MobileSidebar = memo(({
  isOpen,
  onClose,
  activeStage,
  onStageChange,
  contactCounts,
  activeView,
  onViewChange,
}) => {
  if (!isOpen) return null;

  const handleStageChange = (stage) => {
    onStageChange(stage);
    onClose();
  };

  const handleViewChange = (view) => {
    onViewChange(view);
    onClose();
  };

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar Panel */}
      <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
        <Sidebar
          activeStage={activeStage}
          onStageChange={handleStageChange}
          contactCounts={contactCounts}
          collapsed={false}
          onToggle={onClose}
          onViewChange={handleViewChange}
          activeView={activeView}
        />
      </div>
    </div>
  );
});

MobileSidebar.displayName = 'MobileSidebar';

export default MobileSidebar;
