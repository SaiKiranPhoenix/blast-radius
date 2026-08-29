import { getDriver } from '../config/neo4j';
import { env } from '../config/env';
import { Q_BLAST_RADIUS, Q_SERVICE_DEPENDENCIES } from '../utils/cypher';
import type { ServiceSummary, ServiceDetail } from '../types/service.types';
import type { BlastRadiusResult, DependencyResult } from '../types/graph.types';
import { AppError } from '../utils/AppError';
import { nodeProps, toInt } from '../utils/neo4jHelpers';
import type { IncidentSummary } from '../types/incident.types';
import type { TeamSummary } from '../types/team.types';

export const getServices = async (filters?: {
  tier?: string;
  type?: string;
  teamId?: string;
}): Promise<ServiceSummary[]> => {
  const driver = getDriver();
  const session = driver.session({ database: env.NEO4J_DATABASE });
  try {
    let query = `
      MATCH (s:Service)
      `;

    const whereClauses: string[] = [];
    const params: Record<string, string> = {};

    if (filters?.tier) {
      whereClauses.push('s.tier = $tier');
      params.tier = filters.tier;
    }
    if (filters?.type) {
      whereClauses.push('s.type = $type');
      params.type = filters.type;
    }
    if (filters?.teamId) {
      whereClauses.push('team.id = $teamId');
      params.teamId = filters.teamId;
    }

    if (filters?.teamId) {
      query += `MATCH (team:Team)-[:OWNS]->(s)\n`;
    } else {
      query += `OPTIONAL MATCH (team:Team)-[:OWNS]->(s)\n`;
    }

    if (whereClauses.length > 0) {
      query += `WHERE ${whereClauses.join(' AND ')}\n`;
    }

    query += `
      OPTIONAL MATCH (s)-[:DEPENDS_ON]->(upstream:Service)
      OPTIONAL MATCH (downstream:Service)-[:DEPENDS_ON]->(s)
      RETURN s, team, count(DISTINCT upstream) AS dependencyCount, count(DISTINCT downstream) AS dependentCount
      ORDER BY s.name ASC
    `;

    const result = await session.run(query, params);
    return result.records.map((record) => {
      const s = nodeProps<ServiceSummary>(record.get('s'));
      const teamNode = record.get('team');
      return {
        ...s,
        dependencyCount: toInt(record.get('dependencyCount')),
        dependentCount: toInt(record.get('dependentCount')),
        team: teamNode ? nodeProps<TeamSummary>(teamNode) : null,
      };
    });
  } finally {
    await session.close();
  }
};

export const getServiceById = async (id: string): Promise<ServiceDetail> => {
  const driver = getDriver();
  const session = driver.session({ database: env.NEO4J_DATABASE });
  try {
    const query = `
      MATCH (s:Service {id: $id})
      OPTIONAL MATCH (team:Team)-[:OWNS]->(s)
      OPTIONAL MATCH (s)-[:DEPENDS_ON]->(upstream:Service)
      OPTIONAL MATCH (downstream:Service)-[:DEPENDS_ON]->(s)
      RETURN s, team, count(DISTINCT upstream) AS dependencyCount, count(DISTINCT downstream) AS dependentCount
    `;
    const result = await session.run(query, { id });

    if (result.records.length === 0) {
      throw AppError.notFound('service', id);
    }

    const record = result.records[0];
    const s = nodeProps<ServiceDetail>(record.get('s'));
    const teamNode = record.get('team');

    return {
      ...s,
      dependencyCount: toInt(record.get('dependencyCount')),
      dependentCount: toInt(record.get('dependentCount')),
      team: teamNode ? nodeProps<TeamSummary>(teamNode) : null,
    };
  } finally {
    await session.close();
  }
};

export const getBlastRadius = async (
  id: string,
  maxHops: number = 5,
): Promise<BlastRadiusResult> => {
  const driver = getDriver();
  const session = driver.session({ database: env.NEO4J_DATABASE });
  try {
    // 1. Get Root Service
    const rootService = await getServiceById(id);

    // 2. Q1 — Blast Radius
    const blastResult = await session.run(Q_BLAST_RADIUS, { serviceId: id, maxHops });
    const hopsMap: Record<number, ServiceSummary[]> = {};
    blastResult.records.forEach((record) => {
      const hop = toInt(record.get('hops'));
      const service = nodeProps<ServiceSummary>(record.get('affected'));
      if (!hopsMap[hop]) hopsMap[hop] = [];
      hopsMap[hop].push(service);
    });

    const hops = Object.entries(hopsMap).map(([hop, services]) => ({
      hop: parseInt(hop, 10),
      services,
    }));

    // 3. Q2 — Teams to Page
    const teamsResult = await session.run(
      `
      MATCH (root:Service {id: $serviceId})<-[:DEPENDS_ON*1..$maxHops]-(affected:Service)
      MATCH (team:Team)-[:OWNS]->(affected)
      RETURN DISTINCT team, collect(DISTINCT affected.name) AS affectedServices
    `,
      { serviceId: id, maxHops },
    );

    const teamsToPage = teamsResult.records.map((record) => ({
      team: nodeProps<TeamSummary>(record.get('team')),
      affectedServices: record.get('affectedServices'),
    }));

    // 4. Q3 — Historical Incidents
    const incidentsResult = await session.run(
      `
      MATCH (i:Incident)-[:CAUSED_BY]->(root:Service {id: $serviceId})
      OPTIONAL MATCH (i)-[:AFFECTED]->(s:Service)
      RETURN i, collect(DISTINCT s.name) AS affectedServices
      ORDER BY i.started_at DESC
    `,
      { serviceId: id },
    );

    const historicalIncidents = incidentsResult.records.map((record) => {
      const i = nodeProps<IncidentSummary>(record.get('i'));
      const affected = record.get('affectedServices');
      return {
        ...i,
        affectedServiceCount: affected.length,
        rootCauseService: rootService,
      };
    });

    return {
      rootService,
      hops,
      totalAffected: blastResult.records.length,
      teamsToPage,
      historicalIncidents,
    };
  } finally {
    await session.close();
  }
};

export const getDependencies = async (id: string): Promise<DependencyResult> => {
  const driver = getDriver();
  const session = driver.session({ database: env.NEO4J_DATABASE });
  try {
    const result = await session.run(Q_SERVICE_DEPENDENCIES, { serviceId: id });
    if (result.records.length === 0) {
      throw AppError.notFound('service', id);
    }

    const record = result.records[0];
    const service = nodeProps<ServiceSummary>(record.get('s'));
    const teamNode = record.get('team');
    const upstreamNodes = record.get('upstream');
    const downstreamNodes = record.get('downstream');

    const upstream = upstreamNodes.map((n: unknown) => nodeProps<ServiceSummary>(n));
    const downstream = downstreamNodes.map((n: unknown) => nodeProps<ServiceSummary>(n));

    // Also fetch incidents caused by this service
    const incidentsResult = await session.run(
      `
      MATCH (i:Incident)-[:CAUSED_BY]->(s:Service {id: $id})
      RETURN i
      ORDER BY i.started_at DESC
    `,
      { id },
    );

    const incidents = incidentsResult.records.map((record) =>
      nodeProps<IncidentSummary>(record.get('i')),
    );

    return {
      service: {
        ...service,
        dependencyCount: upstream.length,
        dependentCount: downstream.length,
        team: teamNode ? nodeProps<TeamSummary>(teamNode) : null,
      },
      upstream,
      downstream,
      team: teamNode ? nodeProps<TeamSummary>(teamNode) : null,
      incidents,
    };
  } finally {
    await session.close();
  }
};
