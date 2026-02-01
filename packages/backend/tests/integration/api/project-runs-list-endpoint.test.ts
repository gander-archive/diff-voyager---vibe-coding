/**
 * Project runs list endpoint integration tests
 */

import { randomUUID } from 'node:crypto';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import * as tmp from 'tmp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeDatabase,
  createDatabase,
  type DatabaseInstance,
} from '../../../src/storage/database.js';
import { ProjectRepository } from '../../../src/storage/repositories/project-repository.js';
import { RunRepository } from '../../../src/storage/repositories/run-repository.js';
import { createTestApp } from '../../helpers/test-db.js';
import { testInvalidUuidRejection } from '../../helpers/uuid-validation.js';

describe('GET /api/v1/projects/:projectId/runs', () => {
  let app: FastifyInstance;
  let db: DatabaseInstance;
  let projectRepo: ProjectRepository;
  let runRepo: RunRepository;
  let testDir: string;

  beforeAll(async () => {
    // Setup test directory
    testDir = tmp.dirSync({ unsafeCleanup: true, prefix: 'diff-voyager-test-' }).name;

    const dbPath = join(testDir, 'test.db');
    const artifactsDir = join(testDir, 'artifacts');
    await mkdir(artifactsDir, { recursive: true });

    // Create database
    db = createDatabase({ dbPath, baseDir: testDir, artifactsDir });

    // Create repositories
    projectRepo = new ProjectRepository(db);
    runRepo = new RunRepository(db);

    // Create app
    app = await createTestApp({ db, artifactsDir });
  });

  afterAll(async () => {
    closeDatabase(db);
    await rm(testDir, { recursive: true, force: true });
  });

  it('should return 404 for non-existent project', async () => {
    const nonExistentId = randomUUID();
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${nonExistentId}/runs`,
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('Project not found');
  });

  it('should return empty list when project has no runs', async () => {
    const project = await projectRepo.create({
      name: 'Test Project',
      baseUrl: 'https://example.com',
      config: {
        crawl: false,
        viewport: { width: 1920, height: 1080 },
        visualDiffThreshold: 0.01,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${project.id}/runs`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.runs).toEqual([]);
    expect(body.pagination.total).toBe(0);
  });

  it('should return all runs for a project sorted by createdAt DESC', async () => {
    const project = await projectRepo.create({
      name: 'Test Project',
      baseUrl: 'https://example.com',
      config: {
        crawl: false,
        viewport: { width: 1920, height: 1080 },
        visualDiffThreshold: 0.01,
      },
    });

    // Create baseline run
    const baselineRun = await runRepo.create({
      projectId: project.id,
      isBaseline: true,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Create comparison run
    const comparisonRun = await runRepo.create({
      projectId: project.id,
      isBaseline: false,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${project.id}/runs`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.runs).toHaveLength(2);
    expect(body.pagination.total).toBe(2);

    // Should be sorted by createdAt DESC (newest first)
    expect(body.runs[0].id).toBe(comparisonRun.id);
    expect(body.runs[1].id).toBe(baselineRun.id);

    // Check that baseline is included
    expect(body.runs.some((r) => r.isBaseline)).toBe(true);
  });

  it('should support pagination with limit parameter', async () => {
    const project = await projectRepo.create({
      name: 'Test Project',
      baseUrl: 'https://example.com',
      config: {
        crawl: false,
        viewport: { width: 1920, height: 1080 },
        visualDiffThreshold: 0.01,
      },
    });

    // Create 3 runs
    await runRepo.create({
      projectId: project.id,
      isBaseline: true,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });
    await runRepo.create({
      projectId: project.id,
      isBaseline: false,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });
    await runRepo.create({
      projectId: project.id,
      isBaseline: false,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${project.id}/runs?limit=2`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.runs).toHaveLength(2);
    expect(body.pagination.limit).toBe(2);
    expect(body.pagination.hasMore).toBe(true);
  });

  it('should support pagination with offset parameter', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectRepo.db.prepare('SELECT id FROM projects ORDER BY created_at DESC LIMIT 1').get().id}/runs?offset=1`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.runs).toHaveLength(2); // 3 total - 1 offset = 2
    expect(body.pagination.offset).toBe(1);
  });

  it('should include run details', async () => {
    const project = await projectRepo.create({
      name: 'Test Project',
      baseUrl: 'https://example.com',
      config: {
        crawl: false,
        viewport: { width: 1920, height: 1080 },
        visualDiffThreshold: 0.01,
      },
    });

    await runRepo.create({
      projectId: project.id,
      isBaseline: true,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${project.id}/runs`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    const run = body.runs[0];

    expect(run.id).toBeDefined();
    expect(run.projectId).toBe(project.id);
    expect(run.isBaseline).toBeDefined();
    expect(run.status).toBeDefined();
    expect(run.createdAt).toBeDefined();
  });

  it('should validate UUID format for projectId', async () => {
    await testInvalidUuidRejection(app, '/api/v1/projects/:projectId/runs', 'projectId');
  });
});
