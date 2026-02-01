/**
 * Run details endpoint integration tests
 */

import { randomUUID } from 'node:crypto';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { PageStatus, RunStatus } from '@gander-tools/diff-voyager-shared';
import type { FastifyInstance } from 'fastify';
import * as tmp from 'tmp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeDatabase,
  createDatabase,
  type DatabaseInstance,
} from '../../../src/storage/database.js';
import { PageRepository } from '../../../src/storage/repositories/page-repository.js';
import { ProjectRepository } from '../../../src/storage/repositories/project-repository.js';
import { RunRepository } from '../../../src/storage/repositories/run-repository.js';
import { SnapshotRepository } from '../../../src/storage/repositories/snapshot-repository.js';
import { createTestApp } from '../../helpers/test-db.js';
import { testInvalidUuidRejection } from '../../helpers/uuid-validation.js';

describe('GET /api/v1/runs/:runId', () => {
  let app: FastifyInstance;
  let db: DatabaseInstance;
  let projectRepo: ProjectRepository;
  let runRepo: RunRepository;
  let pageRepo: PageRepository;
  let snapshotRepo: SnapshotRepository;
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
    pageRepo = new PageRepository(db);
    snapshotRepo = new SnapshotRepository(db);

    // Create app
    app = await createTestApp({ db, artifactsDir });
  });

  afterAll(async () => {
    closeDatabase(db);
    await rm(testDir, { recursive: true, force: true });
  });

  it('should return 404 for non-existent run', async () => {
    const nonExistentId = randomUUID();
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/runs/${nonExistentId}`,
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('Run not found');
  });

  it('should return run details for existing run', async () => {
    // Create project and run
    const project = await projectRepo.create({
      name: 'Test Project',
      baseUrl: 'https://example.com',
      config: {
        crawl: false,
        viewport: { width: 1920, height: 1080 },
        visualDiffThreshold: 0.01,
      },
    });

    const run = await runRepo.create({
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
      url: `/api/v1/runs/${run.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(run.id);
    expect(body.projectId).toBe(project.id);
    expect(body.isBaseline).toBe(true);
    expect(body.status).toBe(RunStatus.NEW);
    expect(body.createdAt).toBeDefined();
    expect(body.config).toBeDefined();
  });

  it('should include run statistics', async () => {
    // Create project and run with pages
    const project = await projectRepo.create({
      name: 'Test Project',
      baseUrl: 'https://example.com',
      config: {
        crawl: false,
        viewport: { width: 1920, height: 1080 },
        visualDiffThreshold: 0.01,
      },
    });

    const run = await runRepo.create({
      projectId: project.id,
      isBaseline: true,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    // Create pages
    const page1 = await pageRepo.create({
      projectId: project.id,
      normalizedUrl: 'https://example.com/',
      originalUrl: 'https://example.com/',
    });
    const page2 = await pageRepo.create({
      projectId: project.id,
      normalizedUrl: 'https://example.com/about',
      originalUrl: 'https://example.com/about',
    });

    // Create snapshots for pages
    const snapshot1 = await snapshotRepo.create({
      runId: run.id,
      pageId: page1.id,
      isBaseline: true,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash1',
      headers: { 'content-type': 'text/html' },
      seo: {
        title: 'Test Page',
        description: 'Test description',
      },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });
    const snapshot2 = await snapshotRepo.create({
      runId: run.id,
      pageId: page2.id,
      isBaseline: true,
      capturedAt: new Date(),
      httpStatus: 404,
      htmlHash: 'hash2',
      headers: { 'content-type': 'text/html' },
      seo: {
        title: 'Not Found',
        description: 'Page not found',
      },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    // Update first snapshot to completed status
    await snapshotRepo.update(snapshot1.id, {
      status: PageStatus.COMPLETED,
      httpStatus: 200,
    });

    // Update second snapshot to error status
    await snapshotRepo.update(snapshot2.id, {
      status: PageStatus.ERROR,
      httpStatus: 404,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/runs/${run.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.statistics).toBeDefined();
    expect(body.statistics.totalPages).toBe(2);
    expect(body.statistics.completedPages).toBe(1);
    expect(body.statistics.errorPages).toBe(1);
  });

  it('should validate UUID format for runId', async () => {
    await testInvalidUuidRejection(app, '/api/v1/runs/:runId', 'runId');
  });
});
