import { useState, useEffect } from 'react';
import { PieChart, Clock, TrendingUp } from 'lucide-react';
import * as advancedAnalyticsService from '../../services/advancedAnalyticsService';
import * as cookieCache from '../../utils/cookieCache';

const ContactLifecycleCard = ({ filters, onLoadTime }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    const startTime = performance.now();
    setLoading(true);
    setError(null);

    try {
      const cached = cookieCache.getCachedReport('contact-lifecycle', filters);
      
      if (cached) {
        setData(cached.data);
        onLoadTime(Math.round(performance.now() - startTime), true);
        setLoading(false);
        return;
      }

      const response = await advancedAnalyticsService.getContactLifecycle(filters);
      setData(response.data);
      cookieCache.cacheReport('contact-lifecycle', filters, response.data);
      onLoadTime(Math.round(performance.now() - startTime), false);
    } catch (err) {
      setError(err.message || 'Failed to load contact lifecycle data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { statusDistribution, timeInStage, temperatureDistribution } = data;

  const statusColors = {
    LEAD: '#6B7280',
    MQL: '#3B82F6',
    SQL: '#6366F1',
    OPPORTUNITY: '#8B5CF6',
    CUSTOMER: '#10B981',
    EVANGELIST: '#F59E0B',
    DORMANT: '#EF4444',
  };

  const tempColors = {
    HOT: '#EF4444',
    WARM: '#F59E0B',
    COLD: '#3B82F6',
  };

  return (
    <div className="space-y-6">
      {/* Status Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Status Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusDistribution.map((status) => (
            <div
              key={status.status}
              className="p-4 rounded-lg border-2 transition-transform hover:scale-105"
              style={{ borderColor: statusColors[status.status] }}
            >
              <div className="text-sm font-medium text-gray-600 mb-1">{status.status}</div>
              <div className="text-2xl font-bold" style={{ color: statusColors[status.status] }}>
                {status.count}
              </div>
              <div className="text-xs text-gray-500 mt-1">{status.percentage}% of total</div>
            </div>
          ))}
        </div>
      </div>

      {/* Time in Stage */}
      {timeInStage.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Average Time in Each Stage
          </h3>
          <div className="space-y-3">
            {timeInStage.map((stage) => {
              const days = Math.round(stage.avg_days_in_stage || 0);
              const maxDays = Math.max(...timeInStage.map(s => s.avg_days_in_stage || 0));
              const percentage = maxDays > 0 ? (days / maxDays) * 100 : 0;

              return (
                <div key={stage.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{stage.status}</span>
                    <span className="text-sm text-gray-600">{days} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full flex items-center px-3 transition-all duration-500"
                      style={{
                        width: `${Math.max(percentage, 10)}%`,
                        backgroundColor: statusColors[stage.status],
                      }}
                    >
                      <span className="text-xs text-white font-medium">{days}d</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Temperature Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Temperature Distribution
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {temperatureDistribution.map((temp) => (
            <div
              key={temp.temperature}
              className="p-6 rounded-lg border-2 text-center transition-transform hover:scale-105"
              style={{ borderColor: tempColors[temp.temperature] }}
            >
              <div className="text-3xl mb-2">
                {temp.temperature === 'HOT' ? '🔥' : temp.temperature === 'WARM' ? '🌡️' : '❄️'}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-1">{temp.temperature}</div>
              <div className="text-2xl font-bold" style={{ color: tempColors[temp.temperature] }}>
                {temp.count}
              </div>
              <div className="text-xs text-gray-500 mt-1">{temp.percentage}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactLifecycleCard;
