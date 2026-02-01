/**
 * Run pages list endpoint integration tests
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
import { PageRepository } from '../../../src/storage/repositories/page-repository.js';
import { ProjectRepository } from '../../../src/storage/repositories/project-repository.js';
import { RunRepository } from '../../../src/storage/repositories/run-repository.js';
import { SnapshotRepository } from '../../../src/storage/repositories/snapshot-repository.js';
import { createTestApp } from '../../helpers/test-db.js';
import { testInvalidUuidRejection } from '../../helpers/uuid-validation.js';

describe('GET /api/v1/runs/:runId/pages', () => {
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
      url: `/api/v1/runs/${nonExistentId}/pages`,
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('Run not found');
  });

  it('should return empty list when run has no pages', async () => {
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
      url: `/api/v1/runs/${run.id}/pages`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.pages).toEqual([]);
    expect(body.pagination.total).toBe(0);
  });

  it('should return all pages for a run with snapshot data', async () => {
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

    // Create snapshots
    await snapshotRepo.create({
      runId: run.id,
      pageId: page1.id,
      isBaseline: true,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash1',
      headers: { 'content-type': 'text/html' },
      seo: { title: 'Home', description: 'Homepage' },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });
    await snapshotRepo.create({
      runId: run.id,
      pageId: page2.id,
      isBaseline: true,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash2',
      headers: { 'content-type': 'text/html' },
      seo: { title: 'About', description: 'About page' },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/runs/${run.id}/pages`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.pages).toHaveLength(2);
    expect(body.pages[0].url).toBeDefined();
    expect(body.pages[0].status).toBeDefined();
    expect(body.pages[0].httpStatus).toBeDefined();
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

    const run = await runRepo.create({
      projectId: project.id,
      isBaseline: true,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    // Create 3 pages with snapshots
    for (let i = 0; i < 3; i++) {
      const page = await pageRepo.create({
        projectId: project.id,
        normalizedUrl: `https://example.com/page${i}`,
        originalUrl: `https://example.com/page${i}`,
      });
      await snapshotRepo.create({
        runId: run.id,
        pageId: page.id,
        isBaseline: true,
        capturedAt: new Date(),
        httpStatus: 200,
        htmlHash: `hash${i}`,
        headers: { 'content-type': 'text/html' },
        seo: { title: `Page ${i}`, description: `Page ${i} description` },
        hasScreenshot: true,
        hasHar: false,
        hasDiff: false,
      });
    }

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/runs/${run.id}/pages?limit=2`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.pages).toHaveLength(2);
    expect(body.pagination.limit).toBe(2);
    expect(body.pagination.hasMore).toBe(true);
  });

  it('should filter by status', async () => {
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

    // Create page with completed snapshot
    const page1 = await pageRepo.create({
      projectId: project.id,
      normalizedUrl: 'https://example.com/success',
      originalUrl: 'https://example.com/success',
    });
    await snapshotRepo.create({
      runId: run.id,
      pageId: page1.id,
      isBaseline: true,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash1',
      headers: { 'content-type': 'text/html' },
      seo: { title: 'Success', description: 'Success page' },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    // Create page with error snapshot
    const page2 = await pageRepo.create({
      projectId: project.id,
      normalizedUrl: 'https://example.com/error',
      originalUrl: 'https://example.com/error',
    });
    const snapshot2 = await snapshotRepo.create({
      runId: run.id,
      pageId: page2.id,
      isBaseline: true,
      capturedAt: new Date(),
      httpStatus: 404,
      htmlHash: 'hash2',
      headers: { 'content-type': 'text/html' },
      seo: { title: 'Error', description: 'Error page' },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });
    // Update to error status
    await snapshotRepo.update(snapshot2.id, {
      status: 'error',
      httpStatus: 404,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/runs/${run.id}/pages?status=error`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.pages).toHaveLength(1);
    expect(body.pages[0].status).toBe('error');
  });

  it('should validate UUID format for runId', async () => {
    await testInvalidUuidRejection(app, '/api/v1/runs/:runId/pages', 'runId');
  });
});
