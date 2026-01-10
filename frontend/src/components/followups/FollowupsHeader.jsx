import { memo } from 'react';
import { ArrowLeft, Search, Plus, Star } from 'lucide-react';
import { getInitials, formatRating, getContactStatusColor } from './utils/followupHelpers';

/**
 * Header component for the FollowupsPage
 * Contains navigation, contact info, search, and quick actions
 */
const FollowupsHeader = memo(({
  contact,
  sessionsCount,
  averageRating,
  searchQuery,
  onSearchChange,
  onBack,
  onAddSession,
  backLabel = 'Dashboard',
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back button and contact info */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
              title={`Back to ${backLabel}`}
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
            </button>
            
            {/* Contact Quick Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-sky-500/20">
                {getInitials(contact?.name)}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{contact?.name}</h1>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getContactStatusColor(contact?.status)}`}>
                    {contact?.status}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{sessionsCount} sessions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions by status, mode, feedback..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>

          {/* Right: Quick Stats & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-100">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold text-amber-700">{formatRating(averageRating)}</span>
            </div>
            <button 
              onClick={onAddSession}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl hover:from-sky-600 hover:to-indigo-600 transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Session
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

FollowupsHeader.displayName = 'FollowupsHeader';

export default FollowupsHeader;
