import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Network } from 'lucide-react';
import { useDatasetContext } from '@/hooks/useDatasetContext';
import type { Anomaly } from '@/types';

type SeverityFilter = 'all' | 'high' | 'medium' | 'low';

export function Alerts() {
  const { dataset, loadDemoData, analyzing } = useDatasetContext();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const navigate = useNavigate();

  const filteredAlerts = useMemo(() => {
    if (!dataset) return [];
    if (severityFilter === 'all') return dataset.anomalies;
    return dataset.anomalies.filter(a => a.severity === severityFilter);
  }, [dataset, severityFilter]);

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

  const counts = {
    high: dataset.anomalies.filter(a => a.severity === 'high').length,
    medium: dataset.anomalies.filter(a => a.severity === 'medium').length,
    low: dataset.anomalies.filter(a => a.severity === 'low').length,
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white mb-1">Analytical Alerts</h1>
        <p className="text-sm text-gray-500">Detected anomalies and unusual patterns requiring investigator attention</p>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setSeverityFilter(severityFilter === 'high' ? 'all' : 'high')}
          className={`solid-panel p-4 text-left transition-all ${severityFilter === 'high' ? 'border-signal-red/50' : ''}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-signal-red" />
            <span className="text-xs text-gray-500">High Priority</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{counts.high}</div>
        </button>
        <button
          onClick={() => setSeverityFilter(severityFilter === 'medium' ? 'all' : 'medium')}
          className={`solid-panel p-4 text-left transition-all ${severityFilter === 'medium' ? 'border-signal-amber/50' : ''}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-signal-amber" />
            <span className="text-xs text-gray-500">Medium Priority</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{counts.medium}</div>
        </button>
        <button
          onClick={() => setSeverityFilter(severityFilter === 'low' ? 'all' : 'low')}
          className={`solid-panel p-4 text-left transition-all ${severityFilter === 'low' ? 'border-signal-blue/50' : ''}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-signal-blue" />
            <span className="text-xs text-gray-500">Informational</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{counts.low}</div>
        </button>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="solid-panel p-8 text-center text-gray-500">
            No alerts match the current filter.
          </div>
        ) : (
          filteredAlerts.map((alert: Anomaly) => (
            <div
              key={alert.id}
              className={`solid-panel p-4 border-l-4 ${
                alert.severity === 'high' ? 'border-l-signal-red' :
                alert.severity === 'medium' ? 'border-l-signal-amber' : 'border-l-signal-blue'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`badge ${
                      alert.severity === 'high' ? 'bg-signal-red/15 text-signal-red' :
                      alert.severity === 'medium' ? 'bg-signal-amber/15 text-signal-amber' :
                      'bg-signal-blue/15 text-signal-blue'
                    }`}>
                      {alert.severity} priority
                    </span>
                    <span className="badge bg-ink-700 text-gray-400 capitalize">{alert.type}</span>
                    <span className="text-xs text-gray-500 font-mono">{alert.id}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{alert.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Entity: <button onClick={() => navigate(`/network?entity=${alert.entity}`)} className="text-accent-400 hover:text-accent-300 font-mono">{alert.entity}</button></span>
                    <span>Time: {new Date(alert.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    {alert.value !== undefined && <span>Value: <span className="font-mono text-gray-300">{alert.value.toLocaleString('en-IN')}</span></span>}
                    {alert.expectedRange && <span>Expected: <span className="font-mono text-gray-400">{alert.expectedRange}</span></span>}
                  </div>
                  {alert.relatedEntities.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-xs text-gray-600">Related:</span>
                      {alert.relatedEntities.map(re => (
                        <button
                          key={re}
                          onClick={() => navigate(`/network?entity=${re}`)}
                          className="text-xs text-accent-400 hover:text-accent-300 font-mono"
                        >
                          {re}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/network?entity=${alert.entity}`)}
                    className="btn-secondary text-xs inline-flex items-center gap-1.5"
                  >
                    <Network className="w-3.5 h-3.5" />
                    Investigate
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Disclaimer */}
      <div className="solid-panel p-4 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 leading-relaxed">
            Alerts represent analytical leads from pattern detection, not confirmed criminal activity. Each alert requires human-in-the-loop review by an authorized investigator before any action is taken.
          </p>
        </div>
      </div>
    </div>
  );
}
