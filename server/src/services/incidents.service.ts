import { getDriver } from '../config/neo4j';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { nodeProps, toInt } from '../utils/neo4jHelpers';
import type { IncidentSummary, IncidentDetail, DeploymentSummary } from '../types/incident.types';
import type { ServiceSummary } from '../types/service.types';

export const getIncidents = async (filters?: {
  status?: string;
  severity?: string;
}): Promise<IncidentSummary[]> => {
  const driver = getDriver();
  const session = driver.session({ database: env.NEO4J_DATABASE });
  try {
    const whereClauses: string[] = [];
    const params: Record<string, string> = {};

    if (filters?.status) {
      whereClauses.push('i.status = $status');
      params.status = filters.status;
    }

    if (filters?.severity) {
      whereClauses.push('i.severity = $severity');
      params.severity = filters.severity;
    }

    const query = `
      MATCH (i:Incident)
      ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''}
      OPTIONAL MATCH (i)-[:CAUSED_BY]->(root:Service)
      OPTIONAL MATCH (i)-[:AFFECTED]->(affected:Service)
      RETURN i, root, count(DISTINCT affected) AS affectedServiceCount
      ORDER BY i.started_at DESC
    `;
    const result = await session.run(query, params);

    return result.records.map((record) => {
      const i = nodeProps<IncidentSummary>(record.get('i'));
      const rootNode = record.get('root');
      return {
        ...i,
        affectedServiceCount: toInt(record.get('affectedServiceCount')),
        rootCauseService: rootNode ? nodeProps<ServiceSummary>(rootNode) : null,
      };
    });
  } finally {
    await session.close();
  }
};

export const getIncidentById = async (id: string): Promise<IncidentDetail> => {
  const driver = getDriver();
  const session = driver.session({ database: env.NEO4J_DATABASE });
  try {
    const query = `
      MATCH (i:Incident {id: $id})
      OPTIONAL MATCH (i)-[:CAUSED_BY]->(root:Service)
      OPTIONAL MATCH (i)-[:AFFECTED]->(affected:Service)
      OPTIONAL MATCH (d:Deployment)-[:TRIGGERED]->(i)
      RETURN i, root, collect(DISTINCT affected) AS affectedServices, d AS deployment
    `;
    const result = await session.run(query, { id });

    if (result.records.length === 0) {
      throw AppError.notFound('incident', id);
    }

    const record = result.records[0];
    const i = nodeProps<IncidentSummary>(record.get('i'));
    const rootNode = record.get('root');
    const affectedServices = record
      .get('affectedServices')
      .map((node: unknown) => nodeProps<ServiceSummary>(node));
    const deploymentNode = record.get('deployment');

    return {
      ...i,
      affectedServiceCount: affectedServices.length,
      rootCauseService: rootNode ? nodeProps<ServiceSummary>(rootNode) : null,
      affectedServices,
      triggeredBy: deploymentNode ? nodeProps<DeploymentSummary>(deploymentNode) : null,
    };
  } finally {
    await session.close();
  }
};
