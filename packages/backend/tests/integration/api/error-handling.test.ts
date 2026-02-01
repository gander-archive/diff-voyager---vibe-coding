/**
 * API Error Handling tests
 * Tests for error responses, payload limits, and concurrent operations
 */

import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import * as tmp from 'tmp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../../src/api/app.js';
import {
  closeDatabase,
  createDatabase,
  type DatabaseInstance,
} from '../../../src/storage/database.js';
import { createDrizzleDb } from '../../../src/storage/drizzle/db.js';
import { HTML_FIXTURES } from '../../fixtures/html/index.js';
import { MockServer } from '../../helpers/mock-server.js';

describe('API Error Handling', () => {
  let app: FastifyInstance;
  let db: DatabaseInstance;
  let mockServer: MockServer;
  let baseUrl: string;
  let testDir: string;

  beforeAll(async () => {
    testDir = tmp.dirSync({ unsafeCleanup: true, prefix: 'diff-voyager-error-test-' }).name;

    const dbPath = join(testDir, 'test.db');
    const artifactsDir = join(testDir, 'artifacts');
    await mkdir(artifactsDir, { recursive: true });

    db = createDatabase({ dbPath, baseDir: testDir, artifactsDir });
    const drizzleDb = createDrizzleDb(db);

    app = await createApp({ db, drizzleDb, artifactsDir, disableLogging: true });

    mockServer = new MockServer({
      routes: [{ path: '/test-page', body: HTML_FIXTURES.baseline.simple }],
    });
    baseUrl = await mockServer.start();
  });

  afterAll(async () => {
    await mockServer.stop();
    closeDatabase(db);
    await rm(testDir, { recursive: true, force: true });
  });

  describe('Payload Size Limits', () => {
    it('should handle large but valid payloads', async () => {
      // Create a large but reasonable payload (100KB description)
      const largeDescription = 'x'.repeat(100000);
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        payload: {
          url: `${baseUrl}/test-page`,
          name: 'Test Project',
          description: largeDescription,
          sync: false,
        },
      });

      // Should accept large but valid payloads (or reject gracefully)
      expect([200, 202, 400, 413]).toContain(response.statusCode);
    });

    it('should reject extremely large payloads', async () => {
      // Create an extremely large payload (10MB)
      const hugePayload = { url: `${baseUrl}/test-page`, data: 'x'.repeat(10000000) };
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        payload: hugePayload,
      });

      // Should reject with 413 (Payload Too Large) or 400 (Bad Request)
      expect([400, 413]).toContain(response.statusCode);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent scan creations', async () => {
      // Two simultaneous scan creations
      const [response1, response2] = await Promise.all([
        app.inject({
          method: 'POST',
          url: '/api/v1/scans',
          payload: {
            url: `${baseUrl}/test-page`,
            name: 'Project A',
            sync: false,
          },
        }),
        app.inject({
          method: 'POST',
          url: '/api/v1/scans',
          payload: {
            url: `${baseUrl}/test-page`,
            name: 'Project B',
            sync: false,
          },
        }),
      ]);

      // Both should succeed (different projects)
      expect([200, 202]).toContain(response1.statusCode);
      expect([200, 202]).toContain(response2.statusCode);

      // Should create different projects
      const body1 = JSON.parse(response1.body);
      const body2 = JSON.parse(response2.body);
      expect(body1.projectId).not.toBe(body2.projectId);
    });
  });
});
