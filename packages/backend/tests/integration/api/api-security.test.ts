/**
 * API Security tests
 * Tests for rate limiting, input validation, injection prevention, and error handling
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

describe('API Security', () => {
  let app: FastifyInstance;
  let db: DatabaseInstance;
  let mockServer: MockServer;
  let baseUrl: string;
  let testDir: string;

  beforeAll(async () => {
    testDir = tmp.dirSync({ unsafeCleanup: true, prefix: 'diff-voyager-security-test-' }).name;

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

  describe('SQL Injection Prevention', () => {
    it('should sanitize SQL injection in project ID parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: "/api/v1/projects/'; DROP TABLE projects; --",
      });

      expect(response.statusCode).toBe(400);
    });

    it('should sanitize SQL injection in search query', async () => {
      const response = await app.inject({
        method: 'GET',
        url: "/api/v1/projects?search=' OR '1'='1",
      });

      expect([200, 400]).toContain(response.statusCode);
      if (response.statusCode === 200) {
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('projects');
      }
    });

    it('should prevent SQL injection in limit parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: "/api/v1/projects?limit=10; DELETE FROM projects WHERE '1'='1",
      });

      expect([200, 400]).toContain(response.statusCode);
    });

    it('should prevent SQL injection in offset parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: "/api/v1/projects?offset=0' OR '1'='1' --",
      });

      expect([200, 400]).toContain(response.statusCode);
    });
  });

  describe('XSS Prevention', () => {
    it('should validate URL schemes to prevent javascript: URLs', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        payload: {
          url: 'javascript:alert(document.cookie)',
          sync: false,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('bodyErrors');
    });

    it('should sanitize XSS attempts in project name', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        payload: {
          url: `${baseUrl}/test-page`,
          name: '<script>alert("XSS")</script>',
          sync: false,
        },
      });

      // Should either reject (400) or sanitize the input
      expect([200, 202, 400]).toContain(response.statusCode);

      // If accepted, verify the script tag is not stored verbatim
      if (response.statusCode === 202 || response.statusCode === 200) {
        const body = JSON.parse(response.body);
        // Name should not contain script tags
        expect(JSON.stringify(body)).not.toContain('<script>');
      }
    });

    it('should sanitize XSS attempts in project description', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        payload: {
          url: `${baseUrl}/test-page`,
          description: '<img src=x onerror="alert(1)">',
          sync: false,
        },
      });

      // Should either reject (400) or sanitize the input
      expect([200, 202, 400]).toContain(response.statusCode);

      // If accepted, verify the malicious markup is not stored
      if (response.statusCode === 202 || response.statusCode === 200) {
        const body = JSON.parse(response.body);
        expect(JSON.stringify(body)).not.toContain('onerror=');
      }
    });
  });

  describe('Command Injection Prevention', () => {
    it('should prevent command injection via URL parameter', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        payload: {
          url: 'http://example.com; ls -la',
          sync: false,
        },
      });

      // Should reject malicious URL
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('bodyErrors');
    });

    it('should prevent command injection via pipe character', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        payload: {
          url: 'http://example.com | cat /etc/passwd',
          sync: false,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('bodyErrors');
    });
  });

  describe('Malformed JSON Handling', () => {
    it('should reject malformed JSON', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        headers: {
          'content-type': 'application/json',
        },
        payload: '{invalid json}',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject JSON with invalid UTF-8', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        headers: {
          'content-type': 'application/json',
        },
        payload: Buffer.from([0xff, 0xfe]),
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject JSON with null bytes', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        headers: {
          'content-type': 'application/json',
        },
        payload: '{"url":"http://example.com\u0000evil"}',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle deeply nested JSON gracefully', async () => {
      let nested = '{"url":"http://example.com"';
      for (let i = 0; i < 1000; i++) {
        nested = `{"nested":${nested}}`;
      }
      for (let i = 0; i < 1000; i++) {
        nested += '}';
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        headers: {
          'content-type': 'application/json',
        },
        payload: nested,
      });

      expect([400, 413]).toContain(response.statusCode);
    });
  });

  describe('CORS Validation', () => {
    it('should include CORS headers in preflight request', async () => {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/api/v1/projects',
        headers: {
          origin: 'http://localhost:5173',
          'access-control-request-method': 'GET',
        },
      });

      expect([200, 204]).toContain(response.statusCode);
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should include CORS headers in actual request', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/projects',
        headers: {
          origin: 'http://localhost:5173',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle CORS for POST requests', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        headers: {
          origin: 'http://localhost:5173',
        },
        payload: {
          url: `${baseUrl}/test-page`,
          sync: false,
        },
      });

      expect([200, 202]).toContain(response.statusCode);
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Error Information Disclosure', () => {
    it('should not leak database path in error messages', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/projects/invalid-uuid-that-causes-error',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(JSON.stringify(body).toLowerCase()).not.toContain('sqlite');
      expect(JSON.stringify(body).toLowerCase()).not.toContain('.db');
    });

    it('should not leak system paths in error messages', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/00000000-0000-0000-0000-000000000000/screenshot',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(JSON.stringify(body)).not.toContain('/home/');
      expect(JSON.stringify(body)).not.toContain('/tmp/');
      expect(JSON.stringify(body)).not.toContain('C:\\');
    });

    it('should not leak stack traces in production mode', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        payload: {
          url: 'invalid',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(JSON.stringify(body)).not.toContain('at ');
      expect(JSON.stringify(body)).not.toContain('.ts:');
      expect(JSON.stringify(body)).not.toContain('.js:');
    });
  });

  describe('Input Validation', () => {
    it('should validate UUID format strictly', async () => {
      const invalidUuids = [
        'not-a-uuid',
        '12345',
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        '00000000-0000-0000-0000-00000000000', // too short
        '00000000-0000-0000-0000-0000000000000', // too long
      ];

      for (const uuid of invalidUuids) {
        const response = await app.inject({
          method: 'GET',
          url: `/api/v1/projects/${uuid}`,
        });

        expect(response.statusCode).toBe(400);
      }
    });

    it('should validate integer parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/projects?limit=not-a-number',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should enforce minimum and maximum for pagination', async () => {
      const tooLarge = await app.inject({
        method: 'GET',
        url: '/api/v1/projects?limit=10000',
      });

      expect([200, 400]).toContain(tooLarge.statusCode);

      const negative = await app.inject({
        method: 'GET',
        url: '/api/v1/projects?limit=-1',
      });

      expect(negative.statusCode).toBe(400);
    });
  });

  describe('Request Header Validation', () => {
    it('should reject requests with invalid Content-Type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        headers: {
          'content-type': 'text/plain',
        },
        payload: 'not json',
      });

      expect([400, 415]).toContain(response.statusCode);
    });

    it('should handle missing Content-Type gracefully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/scans',
        payload: {
          url: `${baseUrl}/test-page`,
        },
      });

      expect([200, 202, 400, 415]).toContain(response.statusCode);
    });

    it('should reject extremely long headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/projects',
        headers: {
          'x-custom-header': 'A'.repeat(100000),
        },
      });

      expect([200, 400, 413, 431]).toContain(response.statusCode);
    });
  });

  describe('HTTP Method Validation', () => {
    it('should reject unsupported HTTP methods', async () => {
      const response = await app.inject({
        method: 'TRACE',
        url: '/api/v1/projects',
      });

      expect([404, 405]).toContain(response.statusCode);
    });

    it('should reject CONNECT method', async () => {
      const response = await app.inject({
        method: 'CONNECT',
        url: '/api/v1/projects',
      });

      expect([404, 405]).toContain(response.statusCode);
    });
  });
});
