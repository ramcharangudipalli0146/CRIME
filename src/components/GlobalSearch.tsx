import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Dataset } from '@/types';
import { searchEntities } from '@/analytics/networkAnalytics';

interface GlobalSearchProps {
  dataset: Dataset | null;
}

const typeColors: Record<string, string> = {
  person: 'text-accent-400',
  phone: 'text-signal-green',
  bank: 'text-signal-amber',
  location: 'text-signal-blue',
  vehicle: 'text-purple-400',
  fir: 'text-signal-red',
  organization: 'text-pink-400',
};

export function GlobalSearch({ dataset }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReturnType<typeof searchEntities>>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dataset || query.length < 1) {
      setResults([]);
      return;
    }
    setResults(searchEntities(query, dataset));
  }, [query, dataset]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectEntity = (id: string) => {
    navigate(`/network?entity=${id}`);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search entities, IDs, names..."
          className="w-72 pl-9 pr-3 py-2 bg-ink-850 border border-ink-600 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-ink-800 border border-ink-600 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
          {results.map(r => (
            <button
              key={r.id}
              onClick={() => selectEntity(r.id)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-ink-700 transition-colors text-left border-b border-ink-700 last:border-0"
            >
              <span className={`text-xs font-mono uppercase ${typeColors[r.type] ?? 'text-gray-400'}`}>{r.type}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-200 truncate">{r.label}</div>
                <div className="text-xs text-gray-500 font-mono">{r.id}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
