import { memo } from 'react';
import { ContactGrid } from '../contacts';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import CalendarView from '../calendar/CalendarView';
import { GmailView } from '../gmail';
import { VIEW_TYPES } from './utils/dashboardHelpers';

/**
 * Main content area component
 * Renders the appropriate view based on activeView
 */
const MainContent = memo(({
  activeView,
  activeStage,
  contacts,
  loading,
  onContactSelect,
  onEmailClick,
  onFollowupsClick,
  onAddContact,
}) => {
  return (
    <main className="p-4 lg:p-6">
      {activeView === VIEW_TYPES.ANALYTICS ? (
        <AnalyticsDashboard />
      ) : activeView === VIEW_TYPES.CALENDAR ? (
        <CalendarView />
      ) : activeView === VIEW_TYPES.GMAIL ? (
        <GmailView />
      ) : (
        <ContactGrid
          contacts={contacts}
          onContactSelect={onContactSelect}
          onEmailClick={onEmailClick}
          onFollowupsClick={onFollowupsClick}
          onAddContact={onAddContact}
          loading={loading}
          activeStage={activeStage}
        />
      )}
    </main>
  );
});

MainContent.displayName = 'MainContent';

export default MainContent;
