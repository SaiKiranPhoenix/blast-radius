import neo4j from 'neo4j-driver';

type Neo4jIntegerLike = {
  low: number;
  high: number;
  toNumber?: () => number;
};

type Neo4jNodeLike = {
  properties?: Record<string, unknown>;
};

function isNeo4jIntegerLike(value: unknown): value is Neo4jIntegerLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'low' in value &&
    'high' in value &&
    typeof (value as Neo4jIntegerLike).low === 'number' &&
    typeof (value as Neo4jIntegerLike).high === 'number'
  );
}

export function toInt(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (neo4j.isInt(value)) {
    return value.toNumber();
  }

  if (isNeo4jIntegerLike(value)) {
    return typeof value.toNumber === 'function' ? value.toNumber() : value.low;
  }

  throw new TypeError('Expected a Neo4j integer or JavaScript number');
}

export function normalizeNeo4jValue(value: unknown): unknown {
  if (neo4j.isInt(value) || isNeo4jIntegerLike(value)) {
    return toInt(value);
  }

  if (Array.isArray(value)) {
    return value.map(normalizeNeo4jValue);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        normalizeNeo4jValue(nestedValue),
      ]),
    );
  }

  return value;
}

export function nodeProps<T = Record<string, unknown>>(
  node: unknown,
): T {
  const properties =
    typeof node === 'object' && node !== null && 'properties' in node
      ? ((node as Neo4jNodeLike).properties ?? {})
      : {};

  return normalizeNeo4jValue(properties) as T;
}
