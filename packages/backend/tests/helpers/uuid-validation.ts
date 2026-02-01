import type { FastifyInstance } from 'fastify';
import { expect } from 'vitest';

/**
 * Test helper for UUID validation in API endpoints
 *
 * Verifies that invalid UUID format returns 400 error.
 * Can be used directly inside an `it` block.
 *
 * @param app - Fastify application instance
 * @param endpoint - API endpoint URL with parameter placeholder (e.g., '/api/v1/projects/:projectId/runs')
 * @param paramName - Name of the path parameter to replace (e.g., 'projectId')
 * @param method - HTTP method to test (default: 'GET')
 *
 * @example
 * ```typescript
 * import { testInvalidUuidRejection } from '../../helpers/uuid-validation';
 *
 * it('should validate UUID format for projectId', async () => {
 *   await testInvalidUuidRejection(app, '/api/v1/projects/:projectId/runs', 'projectId');
 * });
 * ```
 */
export async function testInvalidUuidRejection(
  app: FastifyInstance,
  endpoint: string,
  paramName: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
) {
  const url = endpoint.replace(`:${paramName}`, 'invalid-uuid');

  const response = await app.inject({
    method,
    url,
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body).toBeDefined();
}
