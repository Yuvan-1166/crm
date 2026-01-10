import { memo, useState, useCallback } from 'react';
import { Phone, Mail, Users, Video, Star, Plus, ChevronDown, Edit, MessageSquare } from 'lucide-react';
import { formatDate, formatTime, getStatusBadgeColor } from './utils/followupHelpers';

/**
 * Get mode icon based on contact mode
 */
const getModeIcon = (mode) => {
  const icons = {
    CALL: Phone,
    EMAIL: Mail,
    DEMO: Users,
    MEET: Video,
  };
  const Icon = icons[mode] || Phone;
  return <Icon className="w-4 h-4" />;
};

/**
 * Individual session row component
 */
const SessionRow = memo(({ 
  session, 
  index, 
  isSelected, 
  isExpanded,
  contactStatus,
  onSelect, 
  onToggleExpand 
}) => {
  const statusColors = {
    CONNECTED: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    NOT_CONNECTED: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    BAD_TIMING: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  };
  
  const colors = statusColors[session.session_status] || statusColors.BAD_TIMING;

  return (
    <>
      <tr
        onClick={() => onSelect(session)}
        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
          isSelected ? 'bg-sky-50' : ''
        }`}
      >
        <td className="px-4 py-4">
          <span className="w-6 h-6 bg-sky-100 text-sky-700 text-sm font-medium rounded-full flex items-center justify-center">
            {index + 1}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className="px-2 py-1 bg-sky-100 text-sky-700 text-sm font-medium rounded">
            {session.stage || contactStatus || 'MQL'} #{session.session_no || index + 1}
          </span>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2 text-gray-700">
            {getModeIcon(session.mode_of_contact)}
            <span className="text-sm">{session.mode_of_contact?.replace('_', ' ') || 'CALL'}</span>
          </div>
        </td>
        <td className="px-4 py-4">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colors.bg} ${colors.border}`}>
            <span className={`w-2 h-2 rounded-full ${getStatusBadgeColor(session.session_status)}`} />
            <span className={`text-sm font-medium ${colors.text}`}>
              {session.session_status?.replace('_', ' ')}
            </span>
          </span>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">{session.rating || 0}/10</span>
          </div>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-700">{formatDate(session.created_at)}</span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-gray-700">{formatTime(session.created_at)}</span>
        </td>
        <td className="px-4 py-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(session.session_id);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isExpanded ? 'Collapse feedback' : 'Expand feedback'}
          >
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          </button>
        </td>
      </tr>
      
      {/* Expanded Feedback Row */}
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={8} className="px-4 py-4">
            <div className="flex items-start gap-3 pl-10">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                  <Edit className="w-4 h-4 text-sky-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Feedback / Remarks</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {session.feedback || session.remarks || 'No feedback provided for this session.'}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

SessionRow.displayName = 'SessionRow';

/**
 * Empty state component when no sessions exist
 */
const EmptyState = memo(({ contactName, onAddSession }) => (
  <div className="flex items-center justify-center py-24">
    <div className="text-center max-w-sm">
      <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <MessageSquare className="w-10 h-10 text-sky-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Follow-ups Yet</h3>
      <p className="text-gray-500 mb-6">
        Start tracking your conversations with {contactName} by logging your first session.
      </p>
      <button
        onClick={onAddSession}
        className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl hover:from-sky-600 hover:to-indigo-600 transition-all shadow-lg shadow-sky-500/25 font-medium flex items-center gap-2 mx-auto"
      >
        <Plus className="w-5 h-5" />
        Log First Session
      </button>
    </div>
  </div>
));

EmptyState.displayName = 'EmptyState';

/**
 * Add session footer button
 */
const AddSessionFooter = memo(({ onAddSession }) => (
  <div
    onClick={onAddSession}
    className="border-t border-gray-100 py-4 px-4 flex items-center justify-center gap-2 text-sky-600 hover:bg-gradient-to-r hover:from-sky-50 hover:to-indigo-50 cursor-pointer transition-all group"
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onAddSession()}
  >
    <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center group-hover:bg-sky-200 transition-colors">
      <Plus className="w-5 h-5" />
    </div>
    <span className="font-medium">Log Another Session</span>
  </div>
));

AddSessionFooter.displayName = 'AddSessionFooter';

/**
 * Sessions table component
 * Displays all sessions in a table format with expandable rows for feedback
 */
const SessionsTable = memo(({
  sessions,
  contactName,
  contactStatus,
  selectedSession,
  onSelectSession,
  onAddSession,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const handleToggleExpand = useCallback((sessionId) => {
    setExpandedRow(prev => prev === sessionId ? null : sessionId);
  }, []);

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 flex-1 overflow-hidden flex flex-col">
        <EmptyState contactName={contactName} onAddSession={onAddSession} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mode</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map((session, index) => (
              <SessionRow
                key={session.session_id}
                session={session}
                index={index}
                isSelected={selectedSession?.session_id === session.session_id}
                isExpanded={expandedRow === session.session_id}
                contactStatus={contactStatus}
                onSelect={onSelectSession}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </tbody>
        </table>
      </div>
      <AddSessionFooter onAddSession={onAddSession} />
    </div>
  );
});

SessionsTable.displayName = 'SessionsTable';

export default SessionsTable;
