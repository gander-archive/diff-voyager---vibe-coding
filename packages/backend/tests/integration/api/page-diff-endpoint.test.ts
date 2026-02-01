/**
 * Page diff endpoint integration tests
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

describe('GET /api/v1/pages/:pageId/diff', () => {
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

  it('should return 404 for non-existent page', async () => {
    const nonExistentId = randomUUID();
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/pages/${nonExistentId}/diff`,
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('Page not found');
  });

  it('should return 404 if no comparison exists (baseline only)', async () => {
    const project = await projectRepo.create({
      name: 'Test Project',
      baseUrl: 'https://example.com',
      config: {
        crawl: false,
        viewport: { width: 1920, height: 1080 },
        visualDiffThreshold: 0.01,
      },
    });

    const baselineRun = await runRepo.create({
      projectId: project.id,
      isBaseline: true,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const page = await pageRepo.create({
      projectId: project.id,
      normalizedUrl: 'https://example.com/',
      originalUrl: 'https://example.com/',
    });

    await snapshotRepo.create({
      runId: baselineRun.id,
      pageId: page.id,
      isBaseline: true,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash1',
      headers: { 'content-type': 'text/html' },
      seo: { title: 'Home', metaDescription: 'Homepage' },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/pages/${page.id}/diff`,
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('No comparison run found');
  });

  it('should return null diff when no changes detected', async () => {
    const project = await projectRepo.create({
      name: 'Test Project',
      baseUrl: 'https://example.com',
      config: {
        crawl: false,
        viewport: { width: 1920, height: 1080 },
        visualDiffThreshold: 0.01,
      },
    });

    const baselineRun = await runRepo.create({
      projectId: project.id,
      isBaseline: true,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const comparisonRun = await runRepo.create({
      projectId: project.id,
      isBaseline: false,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const page = await pageRepo.create({
      projectId: project.id,
      normalizedUrl: 'https://example.com/',
      originalUrl: 'https://example.com/',
    });

    // Baseline snapshot
    await snapshotRepo.create({
      runId: baselineRun.id,
      pageId: page.id,
      isBaseline: true,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash1',
      headers: { 'content-type': 'text/html' },
      seo: { title: 'Home', metaDescription: 'Homepage' },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    // Comparison snapshot (identical)
    await snapshotRepo.create({
      runId: comparisonRun.id,
      pageId: page.id,
      isBaseline: false,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash1',
      headers: { 'content-type': 'text/html' },
      seo: { title: 'Home', metaDescription: 'Homepage' },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/pages/${page.id}/diff`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.hasChanges).toBe(false);
    expect(body.seoChanges).toEqual([]);
    expect(body.headerChanges).toEqual([]);
    expect(body.performanceChanges).toEqual([]);
  });

  it('should return SEO changes when title changed', async () => {
    const project = await projectRepo.create({
      name: 'Test Project',
      baseUrl: 'https://example.com',
      config: {
        crawl: false,
        viewport: { width: 1920, height: 1080 },
        visualDiffThreshold: 0.01,
      },
    });

    const baselineRun = await runRepo.create({
      projectId: project.id,
      isBaseline: true,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const comparisonRun = await runRepo.create({
      projectId: project.id,
      isBaseline: false,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const page = await pageRepo.create({
      projectId: project.id,
      normalizedUrl: 'https://example.com/',
      originalUrl: 'https://example.com/',
    });

    // Baseline snapshot
    await snapshotRepo.create({
      runId: baselineRun.id,
      pageId: page.id,
      isBaseline: true,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash1',
      headers: { 'content-type': 'text/html' },
      seo: { title: 'Old Title', metaDescription: 'Homepage' },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    // Comparison snapshot (title changed)
    await snapshotRepo.create({
      runId: comparisonRun.id,
      pageId: page.id,
      isBaseline: false,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash2',
      headers: { 'content-type': 'text/html' },
      seo: { title: 'New Title', metaDescription: 'Homepage' },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/pages/${page.id}/diff`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.hasChanges).toBe(true);
    expect(body.seoChanges).toHaveLength(1);
    expect(body.seoChanges[0].field).toBe('title');
    expect(body.seoChanges[0].baseline).toBe('Old Title');
    expect(body.seoChanges[0].current).toBe('New Title');
  });

  it('should return header changes when headers modified', async () => {
    const project = await projectRepo.create({
      name: 'Test Project',
      baseUrl: 'https://example.com',
      config: {
        crawl: false,
        viewport: { width: 1920, height: 1080 },
        visualDiffThreshold: 0.01,
      },
    });

    const baselineRun = await runRepo.create({
      projectId: project.id,
      isBaseline: true,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const comparisonRun = await runRepo.create({
      projectId: project.id,
      isBaseline: false,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const page = await pageRepo.create({
      projectId: project.id,
      normalizedUrl: 'https://example.com/',
      originalUrl: 'https://example.com/',
    });

    // Baseline snapshot
    await snapshotRepo.create({
      runId: baselineRun.id,
      pageId: page.id,
      isBaseline: true,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash1',
      headers: { 'content-type': 'text/html', 'cache-control': 'no-cache' },
      seo: { title: 'Home', metaDescription: 'Homepage' },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    // Comparison snapshot (cache-control changed)
    await snapshotRepo.create({
      runId: comparisonRun.id,
      pageId: page.id,
      isBaseline: false,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash1',
      headers: { 'content-type': 'text/html', 'cache-control': 'max-age=3600' },
      seo: { title: 'Home', metaDescription: 'Homepage' },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/pages/${page.id}/diff`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.hasChanges).toBe(true);
    expect(body.headerChanges).toHaveLength(1);
    expect(body.headerChanges[0].header).toBe('cache-control');
    expect(body.headerChanges[0].baseline).toBe('no-cache');
    expect(body.headerChanges[0].current).toBe('max-age=3600');
  });

  it('should return performance changes when metrics differ', async () => {
    const project = await projectRepo.create({
      name: 'Test Project',
      baseUrl: 'https://example.com',
      config: {
        crawl: false,
        viewport: { width: 1920, height: 1080 },
        visualDiffThreshold: 0.01,
      },
    });

    const baselineRun = await runRepo.create({
      projectId: project.id,
      isBaseline: true,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const comparisonRun = await runRepo.create({
      projectId: project.id,
      isBaseline: false,
      config: {
        viewport: { width: 1920, height: 1080 },
        captureScreenshots: true,
        captureHar: false,
      },
    });

    const page = await pageRepo.create({
      projectId: project.id,
      normalizedUrl: 'https://example.com/',
      originalUrl: 'https://example.com/',
    });

    // Baseline snapshot
    await snapshotRepo.create({
      runId: baselineRun.id,
      pageId: page.id,
      isBaseline: true,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash1',
      headers: { 'content-type': 'text/html' },
      seo: { title: 'Home', metaDescription: 'Homepage' },
      performanceData: { loadTimeMs: 1000, requestCount: 10, totalSizeBytes: 50000 },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    // Comparison snapshot (loadTimeMs increased)
    await snapshotRepo.create({
      runId: comparisonRun.id,
      pageId: page.id,
      isBaseline: false,
      capturedAt: new Date(),
      httpStatus: 200,
      htmlHash: 'hash1',
      headers: { 'content-type': 'text/html' },
      seo: { title: 'Home', metaDescription: 'Homepage' },
      performanceData: { loadTimeMs: 2000, requestCount: 10, totalSizeBytes: 50000 },
      hasScreenshot: true,
      hasHar: false,
      hasDiff: false,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/pages/${page.id}/diff`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.hasChanges).toBe(true);
    expect(body.performanceChanges).toHaveLength(1);
    expect(body.performanceChanges[0].metric).toBe('loadTimeMs');
    expect(body.performanceChanges[0].baseline).toBe(1000);
    expect(body.performanceChanges[0].current).toBe(2000);
  });

  it('should validate UUID format for pageId', async () => {
    await testInvalidUuidRejection(app, '/api/v1/pages/:pageId/diff', 'pageId');
  });
});
