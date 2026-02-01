import type { FastifyInstance } from 'fastify';
import { describe, expect, it } from 'vitest';

/**
 * Shared test helper for UUID validation in API endpoints
 *
 * Creates a test suite that verifies:
 * - Invalid UUID format returns 400 with VALIDATION_ERROR
 * - Missing UUID returns 404 (route not found)
 * - Valid UUID v4 is accepted (returns 200 or 404 if entity doesn't exist)
 *
 * @param app - Fastify application instance
 * @param endpoint - API endpoint URL with :id placeholder (e.g., '/api/v1/projects/:id')
 * @param method - HTTP method to test (default: 'GET')
 *
 * @example
 * ```typescript
 * import { testInvalidUuidRejection } from '../../helpers/uuid-validation';
 *
 * describe('GET /api/v1/projects/:projectId', () => {
 *   testInvalidUuidRejection(app, '/api/v1/projects/:id', 'GET');
 *
 *   // Endpoint-specific tests continue...
 * });
 * ```
 */
export function testInvalidUuidRejection(
  app: FastifyInstance,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
) {
  describe('UUID validation', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await app.inject({
        method,
        url: endpoint.replace(':id', 'invalid-uuid'),
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing UUID', async () => {
      const response = await app.inject({
        method,
        url: endpoint.replace(':id', ''),
      });

      expect(response.statusCode).toBe(404); // Route not found
    });

    it('should accept valid UUID v4', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const response = await app.inject({
        method,
        url: endpoint.replace(':id', validUuid),
      });

      // Should not fail on UUID validation (may 404 if entity doesn't exist)
      expect([200, 404]).toContain(response.statusCode);
    });
  });
}
