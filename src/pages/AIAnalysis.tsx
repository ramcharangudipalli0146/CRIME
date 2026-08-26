import { useState } from 'react';
import { Sparkles, Send, Loader2, FileText, Network, Link2 } from 'lucide-react';
import { useDatasetContext } from '@/hooks/useDatasetContext';
import { generateInvestigationSummary, analyzeEntity, summarizeNetwork, explainRelationship } from '@/services/aiService';

type AnalysisType = 'summary' | 'entity' | 'network' | 'relationship';

export function AIAnalysis() {
  const { dataset, settings, loadDemoData, analyzing } = useDatasetContext();
  const [analysisType, setAnalysisType] = useState<AnalysisType>('summary');
  const [entityId, setEntityId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    if (!dataset) return;
    setLoading(true);
    setResult('');
    try {
      let output = '';
      switch (analysisType) {
        case 'summary':
          output = await generateInvestigationSummary(dataset, settings);
          break;
        case 'entity':
          if (!entityId.trim()) { setLoading(false); return; }
          output = await analyzeEntity(entityId.trim(), dataset, settings);
          break;
        case 'network':
          output = await summarizeNetwork(dataset, settings);
          break;
        case 'relationship':
          if (!sourceId.trim() || !targetId.trim()) { setLoading(false); return; }
          output = await explainRelationship(sourceId.trim(), targetId.trim(), dataset, settings);
          break;
      }
      setResult(output);
    } catch (e) {
      setResult('An error occurred during analysis. Please try again.');
    } finally {
      setLoading(false);
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

  const analysisOptions = [
    { key: 'summary' as const, label: 'Investigation Summary', icon: FileText, desc: 'Overall summary of the entire network analysis' },
    { key: 'entity' as const, label: 'Analyze Entity', icon: Sparkles, desc: 'Deep-dive analysis of a specific entity' },
    { key: 'network' as const, label: 'Summarize Network', icon: Network, desc: 'Summary of network structure and clusters' },
    { key: 'relationship' as const, label: 'Explain Relationship', icon: Link2, desc: 'Explain the connection between two entities' },
  ];

  return (
    <div className="p-6 space-y-4 animate-fade-in max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-accent-400" />
          <h1 className="text-xl font-semibold text-white">AI Analysis</h1>
        </div>
        <p className="text-sm text-gray-500">AI-assisted investigation analysis using {settings.provider === 'mock' ? 'mock responses' : `${settings.provider} (${settings.model || 'default model'})`}</p>
      </div>

      {/* Analysis type selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analysisOptions.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              onClick={() => { setAnalysisType(opt.key); setResult(''); }}
              className={`solid-panel p-4 text-left transition-all ${
                analysisType === opt.key ? 'border-accent-500/50 bg-accent-600/10' : 'hover:border-ink-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${analysisType === opt.key ? 'text-accent-400' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-200">{opt.label}</span>
              </div>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Input fields based on type */}
      <div className="solid-panel p-4 space-y-3">
        {analysisType === 'entity' && (
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Entity ID</label>
            <input
              type="text"
              value={entityId}
              onChange={e => setEntityId(e.target.value)}
              placeholder="e.g. P001"
              className="input-field font-mono text-sm"
            />
          </div>
        )}
        {analysisType === 'relationship' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Source Entity ID</label>
              <input
                type="text"
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
                placeholder="e.g. P001"
                className="input-field font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Target Entity ID</label>
              <input
                type="text"
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                placeholder="e.g. P021"
                className="input-field font-mono text-sm"
              />
            </div>
          </div>
        )}
        <button
          onClick={runAnalysis}
          disabled={loading || (analysisType === 'entity' && !entityId.trim()) || (analysisType === 'relationship' && (!sourceId.trim() || !targetId.trim()))}
          className="btn-primary inline-flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Generate Analysis
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="solid-panel p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent-600/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-400" />
            </div>
            <span className="text-sm font-medium text-gray-200">AI Analysis Result</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="solid-panel p-4 border-amber-500/20 bg-amber-500/5">
        <p className="text-xs text-gray-400 leading-relaxed">
          AI-generated insights are analytical leads, not factual accusations. The AI never determines guilt or criminal status. All outputs require verification by authorized investigators. This prototype uses mock AI responses by default — external AI providers can be configured in Settings.
        </p>
      </div>
    </div>
  );
}
