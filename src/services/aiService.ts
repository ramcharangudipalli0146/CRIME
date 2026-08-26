import type { Dataset, AISettings } from '@/types';
import { getConnections, getDegree, getAttentionBreakdown } from '@/analytics/networkAnalytics';

const DISCLAIMER = 'This is an analytical lead based on synthetic data and does not establish criminal activity, guilt, or wrongdoing. Any real-world action would require authorized investigation and human review.';

export async function generateInvestigationSummary(dataset: Dataset, settings: AISettings): Promise<string> {
  const { entities, relationships, clusters, anomalies } = dataset;
  const topEntity = entities.find(e => e.id === dataset.anomalies[0]?.entity) ?? entities[0];
  const summary = `Network analysis identified ${entities.length} entities and ${relationships.length} relationships across ${clusters.length} clusters. ${anomalies.length} anomalies were detected requiring investigator attention. The most analytically significant entity is ${topEntity.id} (${topEntity.label}) with an attention score of ${topEntity.attentionScore ?? 0}. ${DISCLAIMER}`;
  return mockDelay(summary);
}

export async function analyzeEntity(entityId: string, dataset: Dataset, settings: AISettings): Promise<string> {
  const entity = dataset.entities.find(e => e.id === entityId);
  if (!entity) return mockDelay('Entity not found.');
  const conns = getConnections(entityId, dataset);
  const degree = getDegree(entityId, dataset);
  const breakdown = getAttentionBreakdown(entityId, dataset);
  const commLinks = conns.filter(c => c.relationship === 'called').length;
  const finLinks = conns.filter(c => c.relationship === 'transacted').length;
  const caseLinks = conns.filter(c => c.relationship === 'mentioned_in').length;
  const cluster = dataset.clusters.find(c => c.entities.includes(entityId));
  const entityAnomalies = dataset.anomalies.filter(a => a.entity === entityId);

  const parts: string[] = [];
  parts.push(`Entity ${entity.id} (${entity.label}) has ${degree} total connections, including ${commLinks} communication links, ${finLinks} transaction links, and ${caseLinks} case associations.`);
  if (cluster) parts.push(`It participates in ${cluster.name}, described as "${cluster.description}".`);
  if (entityAnomalies.length > 0) parts.push(`${entityAnomalies.length} unusual pattern(s) were identified: ${entityAnomalies.map(a => a.title).join(', ')}.`);
  parts.push(`The analytical attention score of ${entity.attentionScore ?? 0}/100 is driven by: ${breakdown.map(b => `${b.factor} (+${b.points})`).join(', ')}.`);
  parts.push('These findings represent potential associations and unusual patterns that may warrant further review by an authorized investigator.');
  parts.push(DISCLAIMER);
  return mockDelay(parts.join(' '));
}

export async function explainRelationship(sourceId: string, targetId: string, dataset: Dataset, settings: AISettings): Promise<string> {
  const source = dataset.entities.find(e => e.id === sourceId);
  const target = dataset.entities.find(e => e.id === targetId);
  if (!source || !target) return mockDelay('Entities not found.');
  const rels = dataset.relationships.filter(r =>
    (r.source === sourceId && r.target === targetId) ||
    (r.source === targetId && r.target === sourceId)
  );
  if (rels.length === 0) return mockDelay(`No direct relationship found between ${sourceId} and ${targetId}.`);
  const relSummary = rels.map(r => `${r.type} (strength: ${r.strength}, weight: ${r.weight})`).join('; ');
  return mockDelay(`The relationship between ${source.label} and ${target.label} involves: ${relSummary}. This represents a potential association that requires verification. ${DISCLAIMER}`);
}

export async function summarizeNetwork(dataset: Dataset, settings: AISettings): Promise<string> {
  const { entities, relationships, clusters, anomalies } = dataset;
  const clusterSummary = clusters.map(c => `${c.name}: ${c.entities.length} entities (${c.description})`).join('; ');
  return mockDelay(`The network contains ${entities.length} entities connected by ${relationships.length} relationships, organized into ${clusters.length} clusters. ${clusterSummary}. ${anomalies.length} anomalies were detected. These findings represent analytical leads, not factual accusations. ${DISCLAIMER}`);
}

function mockDelay(text: string): Promise<string> {
  return new Promise(resolve => setTimeout(() => resolve(text), 400 + Math.random() * 600));
}

export async function testConnection(settings: AISettings): Promise<{ success: boolean; message: string }> {
  if (settings.provider === 'mock') {
    return { success: true, message: 'Mock AI provider is always available.' };
  }
  if (!settings.endpoint) {
    return { success: false, message: 'No endpoint configured.' };
  }
  return { success: false, message: 'External AI providers are not connected in this prototype. Using mock responses.' };
}
