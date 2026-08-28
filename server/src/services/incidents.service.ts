import { getDriver } from '../config/neo4j';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { nodeProps } from '../utils/neo4jHelpers';
import type { IncidentSummary, IncidentDetail, DeploymentSummary } from '../types/incident.types';
import type { ServiceSummary } from '../types/service.types';

export const getIncidents = async (): Promise<IncidentSummary[]> => {
  const driver = getDriver();
  const session = driver.session({ database: env.NEO4J_DATABASE });
  try {
    const query = `
      MATCH (i:Incident)
      OPTIONAL MATCH (i)-[:CAUSED_BY]->(root:Service)
      OPTIONAL MATCH (i)-[:AFFECTED]->(affected:Service)
      RETURN i, root, count(DISTINCT affected) AS affectedServiceCount
      ORDER BY i.started_at DESC
    `;
    const result = await session.run(query);
    
    return result.records.map(record => {
      const i = nodeProps(record.get('i')) as IncidentSummary;
      const rootNode = record.get('root');
      return {
        ...i,
        affectedServiceCount: record.get('affectedServiceCount').toNumber(),
        rootCauseService: rootNode ? (nodeProps(rootNode) as ServiceSummary) : null,
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
    const i = nodeProps(record.get('i')) as IncidentSummary;
    const rootNode = record.get('root');
    const affectedServices = record.get('affectedServices').map((n: any) => nodeProps(n)) as ServiceSummary[];
    const deploymentNode = record.get('deployment');
    
    return {
      ...i,
      affectedServiceCount: affectedServices.length,
      rootCauseService: rootNode ? (nodeProps(rootNode) as ServiceSummary) : null,
      affectedServices,
      triggeredBy: deploymentNode ? (nodeProps(deploymentNode) as DeploymentSummary) : null,
    };
  } finally {
    await session.close();
  }
};
