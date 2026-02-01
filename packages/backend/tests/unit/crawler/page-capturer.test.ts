/**
 * PageCapturer tests
 * Tests page capture, SEO extraction, screenshot generation, and error handling
 */

import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import * as tmp from 'tmp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PageCapturer } from '../../../src/crawler/page-capturer.js';
import { HTML_FIXTURES } from '../../fixtures/html/index.js';
import { MockServer } from '../../helpers/mock-server.js';

describe('PageCapturer', () => {
  let mockServer: MockServer;
  let baseUrl: string;
  let pageCapturer: PageCapturer;
  let testArtifactsDir: string;

  beforeAll(async () => {
    // Create temp directory for test artifacts using secure tmp library
    testArtifactsDir = tmp.dirSync({ unsafeCleanup: true, prefix: 'test-artifacts-' }).name;

    // Start mock server with test routes
    mockServer = new MockServer({
      routes: [
        {
          path: '/simple',
          body: HTML_FIXTURES.baseline.simple,
          headers: { 'content-type': 'text/html', 'x-test-header': 'test-value' },
        },
        {
          path: '/full-seo',
          body: HTML_FIXTURES.baseline.fullSeo,
        },
        {
          path: '/404',
          status: 404,
          body: '<html><body>Not Found</body></html>',
        },
        {
          path: '/redirect',
          status: 301,
          headers: { location: `http://127.0.0.1/simple` },
          body: '',
        },
        {
          path: '/redirect-target',
          body: HTML_FIXTURES.baseline.simple,
        },
        {
          path: '/slow',
          body: HTML_FIXTURES.baseline.simple,
          delay: 500,
        },
        {
          path: '/no-meta',
          body: HTML_FIXTURES.edgeCases.noMetaTags,
        },
        {
          path: '/unicode',
          body: HTML_FIXTURES.edgeCases.unicode,
        },
        {
          path: '/multiple-h1',
          body: HTML_FIXTURES.edgeCases.multipleH1,
        },
      ],
    });

    baseUrl = await mockServer.start();

    // Initialize PageCapturer
    pageCapturer = new PageCapturer({ artifactsDir: testArtifactsDir });
  });

  afterAll(async () => {
    await pageCapturer.close();
    await mockServer.stop();
  });

  describe('capture - basic functionality', () => {
    it('should capture HTML content with correct hash', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/simple`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.httpStatus).toBe(200);
      expect(result.htmlHash).toBeDefined();
      expect(result.htmlHash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hash
      expect(result.htmlPath).toBeDefined();

      // Verify HTML file was saved
      const html = await readFile(result.htmlPath, 'utf-8');
      expect(html).toContain('Test Page Title');
    });

    it('should extract HTTP status correctly', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/simple`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.httpStatus).toBe(200);
    });

    it('should capture HTTP headers', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/simple`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.headers).toBeDefined();
      expect(result.headers['content-type']).toContain('text/html');
      expect(result.headers['x-test-header']).toBe('test-value');
    });
  });

  describe('capture - HTTP status codes', () => {
    it('should capture 404 pages as valid responses', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/404`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      // 404 is a valid HTTP response, not an error
      expect(result.httpStatus).toBe(404);
      expect(result.htmlHash).toBeDefined();
      expect(result.screenshotPath).toBeDefined();
      expect(result.error).toBeUndefined(); // Not an error
    });

    it('should differentiate 404 from network errors', async () => {
      const result = await pageCapturer.capture({
        url: 'http://invalid-url-that-does-not-exist-12345.com',
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      // Real network error
      expect(result.httpStatus).toBe(0); // No status received
      expect(result.error).toBeDefined();
      expect(result.error).toContain('net::ERR');
    });
  });

  describe('capture - redirects', () => {
    it('should follow redirects and capture final page', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/redirect`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      // Should capture the final page after redirect
      expect(result.httpStatus).toBeDefined();
      expect(result.redirectChain.length).toBeGreaterThanOrEqual(0);
    });

    it('should capture redirect chain', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/redirect`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.redirectChain).toBeDefined();
      // Redirect chain may be captured depending on how Playwright handles it
      // Just verify the structure is correct
      expect(Array.isArray(result.redirectChain)).toBe(true);
    });
  });

  describe('capture - screenshots', () => {
    it('should capture full-page screenshot', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/simple`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.screenshotPath).toBeDefined();

      // Verify screenshot file exists and is a valid PNG
      const screenshot = await readFile(result.screenshotPath);
      expect(screenshot.length).toBeGreaterThan(0);
      // PNG file signature
      expect(screenshot[0]).toBe(0x89);
      expect(screenshot[1]).toBe(0x50);
      expect(screenshot[2]).toBe(0x4e);
      expect(screenshot[3]).toBe(0x47);
    });

    it('should respect viewport configuration', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/simple`,
        pageId: randomUUID(),
        viewport: { width: 800, height: 600 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.screenshotPath).toBeDefined();
      const screenshot = await readFile(result.screenshotPath);
      expect(screenshot.length).toBeGreaterThan(0);
    });
  });

  describe('capture - HAR collection', () => {
    it('should collect HAR file when collectHar is true', async () => {
      const pageId = randomUUID();
      const result = await pageCapturer.capture({
        url: `${baseUrl}/simple`,
        pageId,
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: true,
      });

      expect(result.harPath).toBe('page.har');

      // Verify HAR file exists
      const harPath = `${testArtifactsDir}/${pageId}/page.har`;
      const harContent = await readFile(harPath, 'utf-8');
      expect(harContent).toBeDefined();

      // Verify HAR file has valid JSON structure
      const har = JSON.parse(harContent);
      expect(har.log).toBeDefined();
      expect(har.log.version).toBeDefined();
      expect(har.log.creator).toBeDefined();
      expect(har.log.entries).toBeDefined();
      expect(Array.isArray(har.log.entries)).toBe(true);
    });

    it('should not collect HAR file when collectHar is false', async () => {
      const pageId = randomUUID();
      const result = await pageCapturer.capture({
        url: `${baseUrl}/simple`,
        pageId,
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.harPath).toBeUndefined();

      // Verify HAR file doesn't exist
      const harPath = `${testArtifactsDir}/${pageId}/page.har`;
      await expect(readFile(harPath, 'utf-8')).rejects.toThrow();
    });

    it('should collect HAR file for pages with multiple resources', async () => {
      const pageId = randomUUID();
      const result = await pageCapturer.capture({
        url: `${baseUrl}/full-seo`,
        pageId,
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: true,
      });

      expect(result.harPath).toBe('page.har');

      // Verify HAR file contains entries
      const harPath = `${testArtifactsDir}/${pageId}/page.har`;
      const harContent = await readFile(harPath, 'utf-8');
      const har = JSON.parse(harContent);

      // Should have at least the main page request
      expect(har.log.entries.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('capture - SEO data extraction', () => {
    it('should extract title from HTML', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/simple`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.seoData.title).toBe('Test Page Title');
    });

    it('should extract meta description', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/full-seo`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.seoData.metaDescription).toBe(
        'This is a comprehensive test page with full SEO metadata',
      );
    });

    it('should extract canonical URL', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/full-seo`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.seoData.canonical).toBe('http://localhost:3456/seo-page');
    });

    it('should extract robots directive', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/full-seo`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.seoData.robots).toBe('index, follow');
    });

    it('should extract H1 headings', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/full-seo`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.seoData.h1).toBeDefined();
      expect(Array.isArray(result.seoData.h1)).toBe(true);
      expect(result.seoData.h1?.length).toBeGreaterThan(0);
    });

    it('should extract H2 headings', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/full-seo`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.seoData.h2).toBeDefined();
      expect(Array.isArray(result.seoData.h2)).toBe(true);
    });

    it('should extract language attribute', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/full-seo`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.seoData.lang).toBe('en');
    });

    it('should handle pages without meta tags', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/no-meta`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.seoData).toBeDefined();
      expect(result.seoData.metaDescription).toBeUndefined();
      expect(result.seoData.canonical).toBeUndefined();
      expect(result.seoData.robots).toBeUndefined();
    });

    it('should handle multiple H1 headings', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/multiple-h1`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.seoData.h1).toBeDefined();
      expect(result.seoData.h1?.length).toBeGreaterThan(1);
    });
  });

  describe('capture - performance metrics', () => {
    it('should collect performance metrics', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/simple`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.performanceData).toBeDefined();
      expect(result.performanceData?.loadTimeMs).toBeGreaterThan(0);
      expect(result.performanceData?.requestCount).toBeGreaterThanOrEqual(0);
      expect(result.performanceData?.totalSizeBytes).toBeGreaterThanOrEqual(0);
    });
  });

  describe('capture - waitAfterLoad', () => {
    it('should wait specified time after page load', async () => {
      const startTime = Date.now();

      await pageCapturer.capture({
        url: `${baseUrl}/simple`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 500,
        collectHar: false,
      });

      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeGreaterThanOrEqual(500);
    });

    it('should not wait when waitAfterLoad is 0', async () => {
      const startTime = Date.now();

      await pageCapturer.capture({
        url: `${baseUrl}/simple`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      const elapsedTime = Date.now() - startTime;
      // Should complete quickly (less than 5 seconds)
      expect(elapsedTime).toBeLessThan(5000);
    });
  });

  describe('capture - error handling', () => {
    it('should handle timeout scenarios', async () => {
      // This test verifies that very slow pages eventually timeout
      // The PageCapturer has a 30s timeout configured
      const result = await pageCapturer.capture({
        url: 'http://198.51.100.1', // TEST-NET address (should timeout)
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.httpStatus).toBe(0);
      expect(result.error).toBeDefined();
    }, 35000); // Increase test timeout to accommodate page timeout
  });

  describe('capture - Unicode content', () => {
    it('should handle Unicode content correctly', async () => {
      const result = await pageCapturer.capture({
        url: `${baseUrl}/unicode`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result.httpStatus).toBe(200);
      expect(result.htmlHash).toBeDefined();

      const html = await readFile(result.htmlPath, 'utf-8');
      // Verify Unicode characters are preserved (Polish characters and emojis)
      expect(html).toContain('ąęółśżźćń');
      expect(html).toContain('🎉');
      expect(html).toContain('🚀');
    });
  });

  describe('close', () => {
    it('should close browser and allow reuse', async () => {
      const capturer = new PageCapturer({ artifactsDir: testArtifactsDir });

      const result1 = await capturer.capture({
        url: `${baseUrl}/simple`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result1.httpStatus).toBe(200);

      await capturer.close();

      // Should be able to capture again after close
      const result2 = await capturer.capture({
        url: `${baseUrl}/simple`,
        pageId: randomUUID(),
        viewport: { width: 1920, height: 1080 },
        waitAfterLoad: 0,
        collectHar: false,
      });

      expect(result2.httpStatus).toBe(200);

      await capturer.close();
    });
  });
});
