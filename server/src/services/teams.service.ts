import { getDriver } from '../config/neo4j';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { nodeProps, toInt } from '../utils/neo4jHelpers';
import type { TeamSummaryWithCounts, TeamDetail, TeamSummary } from '../types/team.types';
import type { ServiceSummary } from '../types/service.types';
import type { IncidentSummary } from '../types/incident.types';

export const getTeams = async (): Promise<TeamSummaryWithCounts[]> => {
  const driver = getDriver();
  const session = driver.session({ database: env.NEO4J_DATABASE });
  try {
    const query = `
      MATCH (team:Team)
      OPTIONAL MATCH (team)-[:OWNS]->(s:Service)
      OPTIONAL MATCH (team)-[:OWNS]->(:Service)<-[:CAUSED_BY|AFFECTED]-(i:Incident {status: 'active'})
      RETURN team, count(DISTINCT s) AS serviceCount, count(DISTINCT i) AS activeIncidentCount
      ORDER BY team.name ASC
    `;
    const result = await session.run(query);
    
    return result.records.map((record) => {
      const team = nodeProps<TeamSummary>(record.get('team'));
      return {
        ...team,
        serviceCount: toInt(record.get('serviceCount')),
        activeIncidentCount: toInt(record.get('activeIncidentCount')),
      };
    });
  } finally {
    await session.close();
  }
};

export const getTeamById = async (id: string): Promise<TeamDetail> => {
  const driver = getDriver();
  const session = driver.session({ database: env.NEO4J_DATABASE });
  try {
    const query = `
      MATCH (team:Team {id: $id})
      OPTIONAL MATCH (team)-[:OWNS]->(s:Service)
      OPTIONAL MATCH (team)-[:OWNS]->(s2:Service)<-[:CAUSED_BY|AFFECTED]-(i:Incident {status: 'active'})
      RETURN team, collect(DISTINCT s) AS services, collect(DISTINCT i) AS activeIncidents
    `;
    const result = await session.run(query, { id });

    if (result.records.length === 0) {
      throw AppError.notFound('team', id);
    }

    const record = result.records[0];
    const team = nodeProps<TeamSummary>(record.get('team'));
    const services = record
      .get('services')
      .map((node: unknown) => nodeProps<ServiceSummary>(node));
    const activeIncidents = record
      .get('activeIncidents')
      .map((node: unknown) => nodeProps<IncidentSummary>(node));

    return {
      ...team,
      services,
      activeIncidents,
    };
  } finally {
    await session.close();
  }
};
