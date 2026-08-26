import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, CreditCard, MapPin, FileText, Users, Filter, ArrowRight } from 'lucide-react';
import { useDatasetContext } from '@/hooks/useDatasetContext';
import type { TimelineEvent } from '@/types';

const eventIcons = {
  call: Phone,
  transaction: CreditCard,
  location: MapPin,
  case: FileText,
  meeting: Users,
};

const eventColors = {
  call: '#3b82f6',
  transaction: '#f59e0b',
  location: '#06b6d4',
  case: '#ef4444',
  meeting: '#a855f7',
};

type FilterType = 'all' | 'call' | 'transaction' | 'location' | 'case';

export function Timeline() {
  const { dataset, loadDemoData, analyzing } = useDatasetContext();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [entityFilter, setEntityFilter] = useState('');
  const navigate = useNavigate();

  const filteredEvents = useMemo(() => {
    if (!dataset) return [];
    return dataset.timeline.filter(e => {
      if (filterType !== 'all' && e.type !== filterType && !(filterType === 'location' && e.type === 'meeting')) return false;
      if (entityFilter.trim()) {
        const q = entityFilter.toLowerCase();
        if (!e.entity.toLowerCase().includes(q) &&
            !e.description.toLowerCase().includes(q) &&
            !e.relatedEntities.some(r => r.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [dataset, filterType, entityFilter]);

  if (!dataset) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No dataset loaded.</p>
          <button onClick={loadDemoData} disabled={analyzing} className="btn-primary">
            {analyzing ? 'Processing...' : 'Load Demo Investigation'}
          </button>
        </div>
      </div>
    );
  }

  // Group by date
  const groupedByDate = filteredEvents.reduce((acc, event) => {
    const date = event.timestamp.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white mb-1">Investigation Timeline</h1>
        <p className="text-sm text-gray-500">Chronological view of all detected events and activities</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">Event Type:</span>
        </div>
        {(['all', 'call', 'transaction', 'location', 'case'] as FilterType[]).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
              filterType === type ? 'bg-accent-600 text-white' : 'bg-ink-700 text-gray-400 hover:text-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            placeholder="Filter by entity or keyword..."
            className="input-field text-sm"
          />
        </div>
        <span className="text-xs text-gray-500">{filteredEvents.length} events</span>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="solid-panel p-8 text-center text-gray-500">
            No events match the current filters.
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-sm font-medium text-gray-300 font-mono">{date}</div>
                <div className="flex-1 h-px bg-ink-700" />
                <span className="text-xs text-gray-500">{groupedByDate[date].length} events</span>
              </div>
              <div className="relative pl-6 space-y-2">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-ink-700" />
                {groupedByDate[date].map(event => {
                  const Icon = eventIcons[event.type] ?? Phone;
                  const color = eventColors[event.type] ?? '#6b7280';
                  return (
                    <div key={event.id} className="relative">
                      <div
                        className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full border-2 border-ink-950"
                        style={{ background: color }}
                      />
                      <button
                        onClick={() => event.entity && navigate(`/network?entity=${event.entity}`)}
                        className="w-full text-left flex items-start gap-3 p-3 rounded-lg bg-ink-850 border border-ink-700 hover:border-ink-600 transition-colors"
                      >
                        <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-mono">
                              {event.timestamp.slice(11, 16)}
                            </span>
                            <span className="text-sm text-gray-200">{event.description}</span>
                          </div>
                          {event.relatedEntities.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-gray-600">Related:</span>
                              {event.relatedEntities.map(re => (
                                <span key={re} className="text-[10px] text-accent-400 font-mono">{re}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        {event.entity && (
                          <ArrowRight className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-1" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
