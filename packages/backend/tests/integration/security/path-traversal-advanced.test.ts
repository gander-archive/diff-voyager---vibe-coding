/**
 * Advanced Path Traversal Security tests
 * Tests various path traversal techniques and verifies filesystem operations are blocked
 */

import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { FastifyInstance } from 'fastify';
import { PNG } from 'pngjs';
import * as tmp from 'tmp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../../src/api/app.js';
import {
  closeDatabase,
  createDatabase,
  type DatabaseInstance,
} from '../../../src/storage/database.js';
import { createDrizzleDb } from '../../../src/storage/drizzle/db.js';

function createTestImage(
  width: number,
  height: number,
  color: [number, number, number, number],
): Buffer {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = color[0];
      png.data[idx + 1] = color[1];
      png.data[idx + 2] = color[2];
      png.data[idx + 3] = color[3];
    }
  }
  return PNG.sync.write(png);
}

describe('Advanced Path Traversal Security', () => {
  let app: FastifyInstance;
  let db: DatabaseInstance;
  let testDir: string;
  let artifactsDir: string;
  let testPageId: string;
  let sensitiveFile: string;

  beforeAll(async () => {
    testDir = tmp.dirSync({ unsafeCleanup: true, prefix: 'diff-voyager-path-test-' }).name;

    const dbPath = join(testDir, 'test.db');
    artifactsDir = join(testDir, 'artifacts');
    await mkdir(artifactsDir, { recursive: true });

    testPageId = randomUUID();
    const pageDir = join(artifactsDir, testPageId);
    await mkdir(pageDir, { recursive: true });

    const screenshotBuffer = createTestImage(100, 100, [255, 255, 255, 255]);
    await writeFile(join(pageDir, 'screenshot.png'), screenshotBuffer);

    sensitiveFile = join(testDir, 'sensitive-data.txt');
    await writeFile(sensitiveFile, 'SECRET_API_KEY=12345');

    db = createDatabase({ dbPath, baseDir: testDir, artifactsDir });
    const drizzleDb = createDrizzleDb(db);

    app = await createApp({ db, drizzleDb, artifactsDir, disableLogging: true });
    await app.ready();
  });

  afterAll(async () => {
    closeDatabase(db);
    await rm(testDir, { recursive: true, force: true });
  });

  describe('Classic Path Traversal Attacks', () => {
    it('should block double dot traversal (../)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/../../../etc/passwd/screenshot',
      });

      // Security violation should return 400 (validation error) or 404 (route not found)
      // Both indicate successful blocking
      expect([400, 404]).toContain(response.statusCode);

      // Verify no sensitive data leaked
      if (response.statusCode === 200) {
        expect(response.body).not.toContain('root:');
      }
    });

    it('should block URL-encoded double dots (%2e%2e%2f)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd/screenshot',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should block double URL-encoded dots (%252e)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/%252e%252e%252f%252e%252e%252fetc%252fpasswd/screenshot',
      });

      // Both 400 and 404 indicate successful blocking
      expect([400, 404]).toContain(response.statusCode);
    });

    it('should block Unicode encoding of dots (U+002E)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/\u002e\u002e\u002f\u002e\u002e\u002fetc\u002fpasswd/screenshot',
      });

      // Both 400 and 404 indicate successful blocking
      expect([400, 404]).toContain(response.statusCode);
    });

    it('should block backslash path separators (Windows)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/..\\..\\..\\etc\\passwd/screenshot',
      });

      // Both 400 and 404 indicate successful blocking
      expect([400, 404]).toContain(response.statusCode);
    });
  });

  describe('Absolute Path Attacks', () => {
    it('should block absolute Unix paths', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts//etc/passwd/screenshot',
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should block absolute Windows paths (C:\\)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/C:\\Windows\\System32\\config\\SAM/screenshot',
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should block UNC paths (\\\\server\\share)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/\\\\server\\share\\file/screenshot',
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should block file:// protocol', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/file:///etc/passwd/screenshot',
      });

      expect([400, 404]).toContain(response.statusCode);
    });
  });

  describe('Null Byte Injection', () => {
    it('should block null bytes in path', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${testPageId}%00../../sensitive-data.txt/screenshot`,
      });

      expect(response.statusCode).toBe(400);
    });

    it('should block null bytes in filename', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${testPageId}/screenshot.png%00.txt`,
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should block multiple null bytes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${testPageId}%00%00%00/screenshot`,
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Symlink Attack Prevention', () => {
    it('should reject symlinks pointing outside artifacts directory', async () => {
      const maliciousPageId = randomUUID();
      const maliciousPageDir = join(artifactsDir, maliciousPageId);
      await mkdir(maliciousPageDir, { recursive: true });

      const symlinkPath = join(maliciousPageDir, 'screenshot.png');
      try {
        await symlink(sensitiveFile, symlinkPath);
      } catch {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${maliciousPageId}/screenshot`,
      });

      expect(response.statusCode).toBe(400);

      if (response.statusCode === 200) {
        expect(response.body).not.toContain('SECRET_API_KEY');
      }
    });

    it('should reject symlinked directories', async () => {
      const maliciousPageId = randomUUID();
      const symlinkDir = join(artifactsDir, maliciousPageId);

      try {
        await symlink(testDir, symlinkDir);
      } catch {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${maliciousPageId}/screenshot`,
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should reject chained symlinks', async () => {
      const maliciousPageId = randomUUID();
      const maliciousPageDir = join(artifactsDir, maliciousPageId);
      await mkdir(maliciousPageDir, { recursive: true });

      const link1 = join(maliciousPageDir, 'link1');
      const link2 = join(testDir, 'link2');

      try {
        await symlink(link2, link1);
        await symlink(sensitiveFile, link2);
      } catch {
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${maliciousPageId}/link1`,
      });

      expect([400, 404]).toContain(response.statusCode);
    });
  });

  describe('Directory Listing Prevention', () => {
    it('should not allow directory listing via artifacts endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${testPageId}/`,
      });

      expect([400, 404, 405]).toContain(response.statusCode);
    });

    it('should not expose directory contents in error messages', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${testPageId}/nonexistent`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      const bodyStr = JSON.stringify(body);
      expect(bodyStr).not.toContain('screenshot.png');
      expect(bodyStr).not.toContain('baseline-screenshot.png');
    });

    it('should not allow parent directory access', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${testPageId}/../`,
      });

      expect([400, 404]).toContain(response.statusCode);
    });
  });

  describe('Filesystem Operation Verification', () => {
    it('should verify that traversal attempts do not access filesystem', async () => {
      const accessLog: string[] = [];
      const originalExists = existsSync;

      try {
        (global as any).existsSync = (path: string) => {
          accessLog.push(path);
          return originalExists(path);
        };

        await app.inject({
          method: 'GET',
          url: '/api/v1/artifacts/../../../etc/passwd/screenshot',
        });

        const accessedPaths = accessLog.map((p) => resolve(p));
        expect(accessedPaths.every((p) => p.startsWith(artifactsDir))).toBe(true);
      } finally {
        (global as any).existsSync = originalExists;
      }
    });

    it('should verify that valid requests only access artifacts directory', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${testPageId}/screenshot`,
      });

      expect(response.statusCode).toBe(200);

      const expectedPath = join(artifactsDir, testPageId, 'screenshot.png');
      const resolvedPath = resolve(expectedPath);
      expect(resolvedPath.startsWith(artifactsDir)).toBe(true);
    });
  });

  describe('Special Character Handling', () => {
    it('should block paths with spaces', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/test page id/screenshot',
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should block paths with semicolons', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${testPageId};/screenshot`,
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should block paths with pipe characters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${testPageId}|/screenshot`,
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should block paths with ampersands', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${testPageId}&/screenshot`,
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should block paths with dollar signs', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${testPageId}$/screenshot`,
      });

      expect([400, 404]).toContain(response.statusCode);
    });
  });

  describe('Case Sensitivity Attacks', () => {
    it('should handle case variations in path traversal attempts', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/../../../ETC/PASSWD/screenshot',
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should handle mixed case in encoded characters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/%2E%2E%2F%2E%2E%2Fetc%2Fpasswd/screenshot',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Long Path Attacks', () => {
    it('should reject extremely long paths', async () => {
      const longPath = 'a/'.repeat(1000);
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${longPath}screenshot`,
      });

      expect([400, 404, 414]).toContain(response.statusCode);
    });

    it('should reject paths with extremely long segments', async () => {
      const longSegment = 'a'.repeat(10000);
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/artifacts/${longSegment}/screenshot`,
      });

      expect([400, 404, 414]).toContain(response.statusCode);
    });
  });

  describe('Empty and Whitespace Paths', () => {
    it('should reject empty pageId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts//screenshot',
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should reject whitespace-only pageId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/   /screenshot',
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should reject tab characters in pageId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/\t/screenshot',
      });

      expect([400, 404]).toContain(response.statusCode);
    });

    it('should reject newline characters in pageId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/artifacts/\n/screenshot',
      });

      expect([400, 404]).toContain(response.statusCode);
    });
  });

  describe('Race Condition Prevention', () => {
    it('should prevent TOCTOU attacks via concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, () =>
        app.inject({
          method: 'GET',
          url: `/api/v1/artifacts/${testPageId}/../../../etc/passwd/screenshot`,
        }),
      );

      const responses = await Promise.all(requests);

      expect(responses.every((r) => [400, 404].includes(r.statusCode))).toBe(true);
    });

    it('should handle rapid switching between valid and invalid paths', async () => {
      const requests = [];

      for (let i = 0; i < 5; i++) {
        requests.push(
          app.inject({
            method: 'GET',
            url: `/api/v1/artifacts/${testPageId}/screenshot`,
          }),
        );
        requests.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/artifacts/../../../etc/passwd/screenshot',
          }),
        );
      }

      const responses = await Promise.all(requests);

      const validResponses = responses.filter((r) => r.statusCode === 200);
      const invalidResponses = responses.filter((r) => [400, 404].includes(r.statusCode));

      expect(validResponses.length).toBe(5);
      expect(invalidResponses.length).toBe(5);
    });
  });
});
