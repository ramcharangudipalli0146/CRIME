import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, Users, FileText, Phone, CreditCard, MapPin, Car, Link2, ArrowRight } from 'lucide-react';
import { useDatasetContext } from '@/hooks/useDatasetContext';
import type { EntityType } from '@/types';

type TabKey = 'persons' | 'firs' | 'cdrs' | 'transactions' | 'locations' | 'vehicles' | 'relationships';

const tabs: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: 'persons', label: 'Persons', icon: Users },
  { key: 'firs', label: 'FIRs', icon: FileText },
  { key: 'cdrs', label: 'CDRs', icon: Phone },
  { key: 'transactions', label: 'Transactions', icon: CreditCard },
  { key: 'locations', label: 'Locations', icon: MapPin },
  { key: 'vehicles', label: 'Vehicles', icon: Car },
  { key: 'relationships', label: 'Relationships', icon: Link2 },
];

type SortDir = 'asc' | 'desc';

export function DataExplorer() {
  const { dataset, loadDemoData, analyzing } = useDatasetContext();
  const [activeTab, setActiveTab] = useState<TabKey>('persons');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const pageSize = 15;
  const navigate = useNavigate();

  const tableData = useMemo(() => {
    if (!dataset) return { columns: [], rows: [] as Record<string, string | number>[] };
    let rows: Record<string, string | number>[] = [];
    let columns: { key: string; label: string }[] = [];

    switch (activeTab) {
      case 'persons':
        columns = [
          { key: 'id', label: 'ID' }, { key: 'name', label: 'Name' },
          { key: 'age', label: 'Age' }, { key: 'gender', label: 'Gender' },
          { key: 'occupation', label: 'Occupation' }, { key: 'clusterId', label: 'Cluster' },
        ];
        rows = dataset.persons.map(p => ({ ...p, clusterId: (p as any).clusterId !== undefined ? `C${(p as any).clusterId + 1}` : '-' }));
        break;
      case 'firs':
        columns = [
          { key: 'id', label: 'FIR ID' }, { key: 'title', label: 'Title' },
          { key: 'date', label: 'Date' }, { key: 'section', label: 'Section' },
          { key: 'status', label: 'Status' }, { key: 'entities', label: 'Entities' },
        ];
        rows = dataset.firs.map(f => ({ ...f, date: f.date.slice(0, 10), entities: f.entities.join(', ') }));
        break;
      case 'cdrs':
        columns = [
          { key: 'id', label: 'CDR ID' }, { key: 'caller', label: 'Caller' },
          { key: 'receiver', label: 'Receiver' }, { key: 'timestamp', label: 'Time' },
          { key: 'duration', label: 'Duration (s)' }, { key: 'callType', label: 'Type' },
        ];
        rows = dataset.cdrs.map(c => ({ ...c, timestamp: c.timestamp.slice(0, 16).replace('T', ' ') }));
        break;
      case 'transactions':
        columns = [
          { key: 'id', label: 'Txn ID' }, { key: 'sender', label: 'Sender' },
          { key: 'receiver', label: 'Receiver' }, { key: 'amount', label: 'Amount (₹)' },
          { key: 'timestamp', label: 'Time' }, { key: 'transactionType', label: 'Type' },
        ];
        rows = dataset.transactions.map(t => ({ ...t, amount: t.amount, timestamp: t.timestamp.slice(0, 16).replace('T', ' ') }));
        break;
      case 'locations':
        columns = [
          { key: 'id', label: 'ID' }, { key: 'name', label: 'Name' },
          { key: 'type', label: 'Type' },
        ];
        rows = dataset.locations.map(l => ({ ...l }));
        break;
      case 'vehicles':
        columns = [
          { key: 'id', label: 'ID' }, { key: 'type', label: 'Type' },
          { key: 'owner', label: 'Owner' }, { key: 'registration', label: 'Registration' },
        ];
        rows = dataset.vehicles.map(v => ({ ...v }));
        break;
      case 'relationships':
        columns = [
          { key: 'id', label: 'Rel ID' }, { key: 'source', label: 'Source' },
          { key: 'target', label: 'Target' }, { key: 'type', label: 'Type' },
          { key: 'strength', label: 'Strength' }, { key: 'weight', label: 'Weight' },
        ];
        rows = dataset.relationships.map(r => ({ ...r, type: r.type.replace('_', ' ') }));
        break;
    }
    return { columns, rows };
  }, [dataset, activeTab]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return tableData.rows;
    const q = search.toLowerCase();
    return tableData.rows.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    );
  }, [tableData.rows, search]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, sortKey, sortDir]);

  const paginatedRows = sortedRows.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sortedRows.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const navigateToEntity = (id: string) => {
    if (id.match(/^(P|PHONE-|BANK-|LOC-|VEH-|FIR-|ORG-)/)) {
      navigate(`/network?entity=${id}`);
    }
  };

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

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-white mb-1">Data Explorer</h1>
        <p className="text-sm text-gray-500">Browse and search the synthetic investigation dataset</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-ink-700 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(0); setSortKey(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-accent-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs text-gray-600 font-mono">
                {tab.key === 'persons' ? dataset.persons.length :
                 tab.key === 'firs' ? dataset.firs.length :
                 tab.key === 'cdrs' ? dataset.cdrs.length :
                 tab.key === 'transactions' ? dataset.transactions.length :
                 tab.key === 'locations' ? dataset.locations.length :
                 tab.key === 'vehicles' ? dataset.vehicles.length :
                 dataset.relationships.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search..."
            className="input-field pl-9 text-sm"
          />
        </div>
        <span className="text-xs text-gray-500">{sortedRows.length} records</span>
      </div>

      {/* Table */}
      <div className="solid-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-850">
                {tableData.columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-gray-200 whitespace-nowrap"
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (
                        sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </span>
                  </th>
                ))}
                {(activeTab === 'persons' || activeTab === 'firs' || activeTab === 'vehicles') && (
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-400">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, i) => (
                <tr key={i} className="border-b border-ink-700 last:border-0 hover:bg-ink-850/50 transition-colors">
                  {tableData.columns.map(col => (
                    <td key={col.key} className="px-4 py-2 text-gray-300 whitespace-nowrap">
                      {col.key === 'id' || col.key === 'source' || col.key === 'target' || col.key === 'caller' || col.key === 'receiver' || col.key === 'owner' ? (
                        <button
                          onClick={() => navigateToEntity(String(row[col.key]))}
                          className="text-accent-400 hover:text-accent-300 font-mono text-xs"
                        >
                          {String(row[col.key])}
                        </button>
                      ) : col.key === 'amount' ? (
                        <span className="font-mono text-signal-amber">₹{Number(row[col.key]).toLocaleString('en-IN')}</span>
                      ) : col.key === 'status' ? (
                        <span className={`badge ${
                          row[col.key] === 'open' ? 'bg-signal-red/15 text-signal-red' :
                          row[col.key] === 'under_investigation' ? 'bg-signal-amber/15 text-signal-amber' :
                          'bg-signal-green/15 text-signal-green'
                        }`}>{String(row[col.key]).replace('_', ' ')}</span>
                      ) : (
                        String(row[col.key] ?? '-')
                      )}
                    </td>
                  ))}
                  {(activeTab === 'persons' || activeTab === 'firs' || activeTab === 'vehicles') && (
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => navigateToEntity(String(row.id))}
                        className="text-xs text-gray-400 hover:text-accent-400 inline-flex items-center gap-1"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-ink-700">
            <span className="text-xs text-gray-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-ghost text-xs disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-ghost text-xs disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
