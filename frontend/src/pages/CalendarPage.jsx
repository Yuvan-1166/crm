import { memo } from 'react';
import { useLocation } from 'react-router-dom';
import CalendarView from '../components/calendar/CalendarView';

/**
 * Calendar page - displays calendar view
 */
const CalendarPage = memo(() => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return <CalendarView isAdmin={isAdminRoute} />;
});

CalendarPage.displayName = 'CalendarPage';

export default CalendarPage;
