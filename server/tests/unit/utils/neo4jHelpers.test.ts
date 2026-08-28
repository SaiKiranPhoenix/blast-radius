import neo4j from 'neo4j-driver';
import { describe, expect, it } from 'vitest';
import { nodeProps, toInt } from '../../../src/utils/neo4jHelpers';

describe('neo4jHelpers', () => {
  describe('toInt', () => {
    it('converts Neo4j Integer objects to numbers', () => {
      expect(toInt(neo4j.int(42))).toBe(42);
    });

    it('passes regular JavaScript numbers through unchanged', () => {
      expect(toInt(12)).toBe(12);
    });

    it('handles zero correctly', () => {
      expect(toInt(neo4j.int(0))).toBe(0);
    });

    it('handles integer-like objects from mocked records', () => {
      expect(toInt({ low: 7, high: 0 })).toBe(7);
    });
  });

  describe('nodeProps', () => {
    it('converts a node property map into a plain object', () => {
      const result = nodeProps({
        properties: {
          id: 'svc-auth',
          dependencyCount: neo4j.int(2),
        },
      });

      expect(result).toEqual({
        id: 'svc-auth',
        dependencyCount: 2,
      });
    });

    it('converts nested integer properties', () => {
      const result = nodeProps({
        properties: {
          counts: {
            dependencies: neo4j.int(3),
          },
        },
      });

      expect(result).toEqual({
        counts: {
          dependencies: 3,
        },
      });
    });

    it('returns an empty object for a node with no properties', () => {
      expect(nodeProps({})).toEqual({});
    });
  });
});
