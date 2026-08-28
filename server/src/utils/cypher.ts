/**
 * Cypher queries for the BlastRadius API.
 * Extracted from docs/ARCHITECTURE.md.
 */

// Q1 — Blast Radius (Multi-Hop Traversal)
export const Q_BLAST_RADIUS = `
MATCH path = (root:Service {id: $serviceId})<-[:DEPENDS_ON*1..$maxHops]-(affected:Service)
WITH affected, length(path) AS hops
ORDER BY hops
RETURN affected, hops
`;

// Q2 — Teams to Page
export const Q_TEAMS_TO_PAGE = `
MATCH (root:Service {id: $serviceId})<-[:DEPENDS_ON*1..$maxHops]-(affected:Service)
MATCH (team:Team)-[:OWNS]->(affected)
RETURN DISTINCT team, collect(affected.name) AS affectedServices
`;

// Q3 — Historical Incidents on This Path
export const Q_HISTORICAL_INCIDENTS = `
MATCH (i:Incident)-[:CAUSED_BY]->(root:Service {id: $serviceId})
MATCH (i)-[:AFFECTED]->(s:Service)
RETURN i, collect(s.name) AS affectedServices
ORDER BY i.started_at DESC
`;

// Q4 — Longest Dependency Chain
export const Q_LONGEST_CHAIN = `
MATCH path = (s:Service)-[:DEPENDS_ON*]->(t:Service)
WHERE NOT (t)-[:DEPENDS_ON]->()
RETURN s.name AS source, t.name AS sink, length(path) AS depth
ORDER BY depth DESC
LIMIT 10
`;

// Q5 — Service Dependency Summary
export const Q_SERVICE_DEPENDENCIES = `
MATCH (s:Service {id: $serviceId})
OPTIONAL MATCH (s)-[:DEPENDS_ON]->(upstream:Service)
OPTIONAL MATCH (downstream:Service)-[:DEPENDS_ON]->(s)
OPTIONAL MATCH (team:Team)-[:OWNS]->(s)
RETURN s, collect(DISTINCT upstream) AS upstream,
       collect(DISTINCT downstream) AS downstream, team
`;
