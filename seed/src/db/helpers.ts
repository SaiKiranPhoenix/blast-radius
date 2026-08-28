import neo4j from 'neo4j-driver';

export function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (neo4j.isInt(value)) {
    return value.toNumber();
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'low' in value &&
    typeof (value as { low: unknown }).low === 'number'
  ) {
    return (value as { low: number }).low;
  }

  throw new TypeError('Expected numeric Neo4j value');
}
