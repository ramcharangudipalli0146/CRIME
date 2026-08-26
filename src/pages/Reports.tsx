import { useState, useMemo } from 'react';
import { FileText, Download, FileJson, FileSpreadsheet, Printer, ShieldAlert } from 'lucide-react';
import { useDatasetContext } from '@/hooks/useDatasetContext';
import { computeMetrics } from '@/analytics/networkAnalytics';
import { generateInvestigationSummary } from '@/services/aiService';

export function Reports() {
  const { dataset, settings, loadDemoData, analyzing } = useDatasetContext();
  const [aiSummary, setAiSummary] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);

  const metrics = useMemo(() => dataset ? computeMetrics(dataset) : null, [dataset]);

  const generateAI = async () => {
    if (!dataset) return;
    setGeneratingAI(true);
    const summary = await generateInvestigationSummary(dataset, settings);
    setAiSummary(summary);
    setGeneratingAI(false);
  };

  const downloadJSON = () => {
    if (!dataset || !metrics) return;
    const report = buildReport(dataset, metrics, aiSummary);
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `investigation-report-${Date.now()}.json`);
  };

  const downloadCSV = () => {
    if (!dataset || !metrics) return;
    const csv = buildCSV(dataset, metrics);
    const blob = new Blob([csv], { type: 'text/csv' });
    triggerDownload(blob, `investigation-report-${Date.now()}.csv`);
  };

  const printReport = () => {
    window.print();
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

  if (!metrics) return null;

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-start justify-between print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">Report Generation</h1>
          <p className="text-sm text-gray-500">Generate and export investigation analysis reports</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadCSV} className="btn-secondary inline-flex items-center gap-2 text-sm">
            <FileSpreadsheet className="w-4 h-4" /> CSV
          </button>
          <button onClick={downloadJSON} className="btn-secondary inline-flex items-center gap-2 text-sm">
            <FileJson className="w-4 h-4" /> JSON
          </button>
          <button onClick={printReport} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Report preview */}
      <div className="solid-panel p-8 max-w-4xl mx-auto bg-white text-gray-900 print:bg-white print:text-black print:border-0 print:shadow-none" id="report-content">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Investigation Analysis Report</h1>
          <p className="text-sm text-gray-500 mt-1">AI-Powered Criminal Network Analysis System — SIH Prototype</p>
          <p className="text-xs text-gray-400 mt-1">Generated: {new Date().toLocaleString('en-IN')}</p>
        </div>

        {/* Executive Summary */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Executive Summary</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This report presents an analysis of a synthetic investigation dataset containing {metrics.totalEntities} entities
            and {metrics.totalRelationships} relationships. The analysis identified {metrics.detectedClusters} clusters,
            detected {metrics.anomaliesDetected} anomalies, and flagged {metrics.highConnectivityEntities} high-connectivity entities
            for further review. All findings represent analytical leads based on pattern detection and do not establish criminal activity.
          </p>
        </section>

        {/* Dataset Overview */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Dataset Overview</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200"><td className="py-1.5 text-gray-500">Source</td><td className="py-1.5 text-gray-900 capitalize">{dataset.metadata.source}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5 text-gray-500">Persons</td><td className="py-1.5 text-gray-900">{dataset.persons.length}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5 text-gray-500">Phones</td><td className="py-1.5 text-gray-900">{dataset.phones.length}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5 text-gray-500">Bank Accounts</td><td className="py-1.5 text-gray-900">{dataset.banks.length}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5 text-gray-500">Locations</td><td className="py-1.5 text-gray-900">{dataset.locations.length}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5 text-gray-500">Vehicles</td><td className="py-1.5 text-gray-900">{dataset.vehicles.length}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5 text-gray-500">FIRs</td><td className="py-1.5 text-gray-900">{dataset.firs.length}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5 text-gray-500">CDRs</td><td className="py-1.5 text-gray-900">{dataset.cdrs.length}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5 text-gray-500">Transactions</td><td className="py-1.5 text-gray-900">{dataset.transactions.length}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5 text-gray-500">Location Events</td><td className="py-1.5 text-gray-900">{dataset.locationEvents.length}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1.5 text-gray-500">Relationships</td><td className="py-1.5 text-gray-900">{dataset.relationships.length}</td></tr>
            </tbody>
          </table>
        </section>

        {/* Key Entities */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Key Entities (Top Connected)</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-300"><th className="py-1.5 text-left text-gray-500">Entity ID</th><th className="py-1.5 text-left text-gray-500">Degree</th></tr></thead>
            <tbody>
              {metrics.topConnected.map(t => (
                <tr key={t.entityId} className="border-b border-gray-100"><td className="py-1.5 font-mono">{t.entityId}</td><td className="py-1.5">{t.degree}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Detected Clusters */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Detected Clusters</h2>
          {dataset.clusters.map(c => (
            <div key={c.id} className="mb-2 p-2 bg-gray-50 rounded">
              <div className="font-medium text-sm">{c.name} — {c.entities.length} entities</div>
              <div className="text-xs text-gray-500">{c.description}</div>
            </div>
          ))}
        </section>

        {/* Detected Anomalies */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Detected Anomalies</h2>
          {dataset.anomalies.map(a => (
            <div key={a.id} className="mb-2 p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{a.title}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 capitalize">{a.severity}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{a.description}</div>
            </div>
          ))}
        </section>

        {/* AI Summary */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2 print:hidden">
            <h2 className="text-lg font-semibold text-gray-800">AI-Generated Summary</h2>
            <button onClick={generateAI} disabled={generatingAI} className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 inline-flex items-center gap-1">
              {generatingAI ? 'Generating...' : 'Generate'}
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2 hidden print:block">AI-Generated Summary</h2>
          {aiSummary ? (
            <p className="text-sm text-gray-600 leading-relaxed">{aiSummary}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Click "Generate" to produce an AI summary.</p>
          )}
        </section>

        {/* Disclaimer */}
        <section className="border-t border-gray-200 pt-4">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed">
              This prototype uses synthetic data for demonstration purposes. Analytical outputs represent potential patterns or associations and do not establish criminal activity, guilt, or wrongdoing. Any real-world deployment would require appropriate legal authorization, privacy protections, security controls, and human investigator review.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function buildReport(dataset: any, metrics: any, aiSummary: string) {
  return {
    title: 'Investigation Analysis Report',
    generatedAt: new Date().toISOString(),
    system: 'AI-Powered Criminal Network Analysis System — SIH Prototype',
    executiveSummary: {
      totalEntities: metrics.totalEntities,
      totalRelationships: metrics.totalRelationships,
      detectedClusters: metrics.detectedClusters,
      anomaliesDetected: metrics.anomaliesDetected,
      highConnectivityEntities: metrics.highConnectivityEntities,
    },
    datasetOverview: {
      source: dataset.metadata.source,
      persons: dataset.persons.length,
      phones: dataset.phones.length,
      banks: dataset.banks.length,
      locations: dataset.locations.length,
      vehicles: dataset.vehicles.length,
      firs: dataset.firs.length,
      cdrs: dataset.cdrs.length,
      transactions: dataset.transactions.length,
      locationEvents: dataset.locationEvents.length,
      relationships: dataset.relationships.length,
    },
    keyEntities: metrics.topConnected,
    clusters: dataset.clusters,
    anomalies: dataset.anomalies,
    aiSummary,
    disclaimer: 'This prototype uses synthetic data for demonstration purposes. Analytical outputs represent potential patterns or associations and do not establish criminal activity, guilt, or wrongdoing.',
  };
}

function buildCSV(dataset: any, metrics: any): string {
  const lines: string[] = [];
  lines.push('Section,Key,Value');
  lines.push(`Overview,Total Entities,${metrics.totalEntities}`);
  lines.push(`Overview,Total Relationships,${metrics.totalRelationships}`);
  lines.push(`Overview,Detected Clusters,${metrics.detectedClusters}`);
  lines.push(`Overview,Anomalies Detected,${metrics.anomaliesDetected}`);
  lines.push(`Overview,High-Connectivity Entities,${metrics.highConnectivityEntities}`);
  lines.push('');
  lines.push('Top Entity,Degree');
  metrics.topConnected.forEach((t: any) => lines.push(`${t.entityId},${t.degree}`));
  lines.push('');
  lines.push('Cluster ID,Cluster Name,Entity Count,Description');
  dataset.clusters.forEach((c: any) => lines.push(`${c.id},${c.name},${c.entities.length},${c.description}`));
  lines.push('');
  lines.push('Anomaly ID,Severity,Type,Entity,Title,Description');
  dataset.anomalies.forEach((a: any) => lines.push(`${a.id},${a.severity},${a.type},${a.entity},"${a.title}","${a.description}"`));
  return lines.join('\n');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
