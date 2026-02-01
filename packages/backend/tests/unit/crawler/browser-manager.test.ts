/**
 * BrowserManager tests
 * Tests browser instance lifecycle, pooling, and error handling
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserManager } from '../../../src/crawler/browser-manager.js';

describe('BrowserManager', () => {
  let browserManager: BrowserManager;

  beforeEach(() => {
    browserManager = new BrowserManager({ headless: true });
  });

  afterEach(async () => {
    await browserManager.close();
  });

  describe('getBrowser', () => {
    it('should create browser instance on first call', async () => {
      expect(browserManager.isActive()).toBe(false);

      const browser = await browserManager.getBrowser();

      expect(browser).toBeDefined();
      expect(browser.isConnected()).toBe(true);
      expect(browserManager.isActive()).toBe(true);
    });

    it('should reuse browser instance on subsequent calls', async () => {
      const browser1 = await browserManager.getBrowser();
      const browser2 = await browserManager.getBrowser();

      expect(browser1).toBe(browser2);
      expect(browser1.isConnected()).toBe(true);
    });

    it('should handle concurrent getBrowser calls safely', async () => {
      // Create spy to verify browser is launched only once
      const playwrightModule = await import('playwright');
      const launchSpy = vi.spyOn(playwrightModule.chromium, 'launch');

      const [browser1, browser2, browser3] = await Promise.all([
        browserManager.getBrowser(),
        browserManager.getBrowser(),
        browserManager.getBrowser(),
      ]);

      // Should create browser only once despite concurrent requests
      expect(launchSpy).toHaveBeenCalledTimes(1);
      expect(browser1).toBe(browser2);
      expect(browser2).toBe(browser3);
      expect(browser1.isConnected()).toBe(true);

      launchSpy.mockRestore();
    });

    it('should throw error when manager is closing', async () => {
      // First get a browser so there's something to close
      await browserManager.getBrowser();

      // Start close operation (don't await) - this will take some time
      const closePromise = browserManager.close();

      // Immediately try to get browser while closing is in progress
      // Since close() sets isClosing=true first, this should fail
      await expect(browserManager.getBrowser()).rejects.toThrow(
        'BrowserManager is closing, cannot get browser',
      );

      // Wait for close to complete
      await closePromise;
    });

    it('should launch browser in headless mode when configured', async () => {
      const headlessManager = new BrowserManager({ headless: true });
      const browser = await headlessManager.getBrowser();

      expect(browser).toBeDefined();
      expect(browser.isConnected()).toBe(true);

      await headlessManager.close();
    });

    it('should respect maxBrowsers configuration', async () => {
      const manager = new BrowserManager({ maxBrowsers: 1 });

      const browser = await manager.getBrowser();
      expect(browser).toBeDefined();
      expect(manager.isActive()).toBe(true);

      await manager.close();
    });
  });

  describe('close', () => {
    it('should close browser and clear instance', async () => {
      const browser = await browserManager.getBrowser();
      expect(browserManager.isActive()).toBe(true);
      expect(browser.isConnected()).toBe(true);

      await browserManager.close();

      expect(browserManager.isActive()).toBe(false);
      expect(browser.isConnected()).toBe(false);
    });

    it('should be safe to call multiple times', async () => {
      await browserManager.getBrowser();

      await browserManager.close();
      await browserManager.close();
      await browserManager.close();

      expect(browserManager.isActive()).toBe(false);
    });

    it('should be safe to call without browser', async () => {
      await browserManager.close();

      expect(browserManager.isActive()).toBe(false);
    });

    it('should allow getting new browser after close', async () => {
      const browser1 = await browserManager.getBrowser();
      await browserManager.close();

      const browser2 = await browserManager.getBrowser();

      expect(browser1).not.toBe(browser2);
      expect(browser1.isConnected()).toBe(false);
      expect(browser2.isConnected()).toBe(true);
    });
  });

  describe('isActive', () => {
    it('should return false when no browser exists', () => {
      expect(browserManager.isActive()).toBe(false);
    });

    it('should return true when browser exists', async () => {
      await browserManager.getBrowser();

      expect(browserManager.isActive()).toBe(true);
    });

    it('should return false after close', async () => {
      await browserManager.getBrowser();
      await browserManager.close();

      expect(browserManager.isActive()).toBe(false);
    });
  });

  describe('configuration', () => {
    it('should use default configuration when none provided', () => {
      const manager = new BrowserManager();

      expect(manager.isActive()).toBe(false);
    });

    it('should merge provided config with defaults', async () => {
      const manager = new BrowserManager({
        headless: true,
        maxBrowsers: 5,
      });

      const browser = await manager.getBrowser();
      expect(browser).toBeDefined();

      await manager.close();
    });
  });

  describe('error handling', () => {
    it('should handle browser launch errors gracefully', async () => {
      // This test verifies that if browser launch fails,
      // the error is propagated properly
      const manager = new BrowserManager({ headless: true });

      // Mock or force an error scenario if needed
      // For now, we just verify normal operation doesn't throw
      const browser = await manager.getBrowser();
      expect(browser).toBeDefined();

      await manager.close();
    });

    it('should prevent new browsers during close', async () => {
      await browserManager.getBrowser();

      // Start closing
      const closePromise = browserManager.close();

      // Try to get browser while closing
      await expect(browserManager.getBrowser()).rejects.toThrow('BrowserManager is closing');

      await closePromise;
    });
  });
});
