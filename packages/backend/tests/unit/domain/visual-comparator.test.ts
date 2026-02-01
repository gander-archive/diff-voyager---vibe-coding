/**
 * Visual Comparator unit tests
 */

import { DiffSeverity, DiffType } from '@gander-tools/diff-voyager-shared';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import * as VisualComparator from '../../../src/domain/visual-comparator.js';

// Helper to create a test PNG buffer
function createTestImage(
  width: number,
  height: number,
  color: [number, number, number, number],
): Buffer {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = color[0]; // R
      png.data[idx + 1] = color[1]; // G
      png.data[idx + 2] = color[2]; // B
      png.data[idx + 3] = color[3]; // A
    }
  }
  return PNG.sync.write(png);
}

// Helper to create an image with a colored region
function createImageWithRegion(
  width: number,
  height: number,
  bgColor: [number, number, number, number],
  regionX: number,
  regionY: number,
  regionW: number,
  regionH: number,
  regionColor: [number, number, number, number],
): Buffer {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      if (x >= regionX && x < regionX + regionW && y >= regionY && y < regionY + regionH) {
        png.data[idx] = regionColor[0];
        png.data[idx + 1] = regionColor[1];
        png.data[idx + 2] = regionColor[2];
        png.data[idx + 3] = regionColor[3];
      } else {
        png.data[idx] = bgColor[0];
        png.data[idx + 1] = bgColor[1];
        png.data[idx + 2] = bgColor[2];
        png.data[idx + 3] = bgColor[3];
      }
    }
  }
  return PNG.sync.write(png);
}

describe('VisualComparator', () => {
  describe('compare', () => {
    it('should return no diff for identical images', () => {
      const image = createTestImage(100, 100, [255, 255, 255, 255]);

      const result = VisualComparator.compare(image, image);

      expect(result.diffPixels).toBe(0);
      expect(result.diffPercentage).toBe(0);
      expect(result.thresholdExceeded).toBe(false);
    });

    it('should detect completely different images', () => {
      const white = createTestImage(100, 100, [255, 255, 255, 255]);
      const black = createTestImage(100, 100, [0, 0, 0, 255]);

      const result = VisualComparator.compare(white, black);

      expect(result.diffPixels).toBe(10000); // 100x100
      expect(result.diffPercentage).toBe(100);
      expect(result.thresholdExceeded).toBe(true);
    });

    it('should calculate correct diff percentage for partial difference', () => {
      // Create a 100x100 white image
      const baseline = createTestImage(100, 100, [255, 255, 255, 255]);
      // Create a 100x100 image with 10x10 black region (1% difference)
      const current = createImageWithRegion(
        100,
        100,
        [255, 255, 255, 255],
        0,
        0,
        10,
        10,
        [0, 0, 0, 255],
      );

      const result = VisualComparator.compare(baseline, current);

      expect(result.diffPixels).toBe(100); // 10x10
      expect(result.diffPercentage).toBe(1);
    });

    it('should respect custom threshold', () => {
      const baseline = createTestImage(100, 100, [255, 255, 255, 255]);
      const current = createImageWithRegion(
        100,
        100,
        [255, 255, 255, 255],
        0,
        0,
        10,
        10,
        [0, 0, 0, 255],
      );

      // With 0.5% threshold, 1% diff should exceed
      const resultLowThreshold = VisualComparator.compare(baseline, current, { threshold: 0.5 });
      expect(resultLowThreshold.thresholdExceeded).toBe(true);

      // With 2% threshold, 1% diff should not exceed
      const resultHighThreshold = VisualComparator.compare(baseline, current, { threshold: 2 });
      expect(resultHighThreshold.thresholdExceeded).toBe(false);
    });

    it('should generate diff image when requested', () => {
      const white = createTestImage(100, 100, [255, 255, 255, 255]);
      const black = createTestImage(100, 100, [0, 0, 0, 255]);

      const result = VisualComparator.compare(white, black, { generateDiffImage: true });

      expect(result.diffImage).toBeDefined();
      expect(result.diffImage).toBeInstanceOf(Buffer);
      // Verify it's a valid PNG
      if (!result.diffImage) {
        throw new Error('diffImage is undefined');
      }
      const diffPng = PNG.sync.read(result.diffImage);
      expect(diffPng.width).toBe(100);
      expect(diffPng.height).toBe(100);
    });

    it('should not generate diff image by default', () => {
      const white = createTestImage(100, 100, [255, 255, 255, 255]);
      const black = createTestImage(100, 100, [0, 0, 0, 255]);

      const result = VisualComparator.compare(white, black);

      expect(result.diffImage).toBeUndefined();
    });

    it('should handle images of different sizes', () => {
      const small = createTestImage(50, 50, [255, 255, 255, 255]);
      const large = createTestImage(100, 100, [255, 255, 255, 255]);

      const result = VisualComparator.compare(small, large);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('size');
    });

    it('should use default threshold of 0.01%', () => {
      const baseline = createTestImage(10000, 1, [255, 255, 255, 255]); // 10000 pixels
      // 1 different pixel = 0.01%
      const current = createImageWithRegion(
        10000,
        1,
        [255, 255, 255, 255],
        0,
        0,
        1,
        1,
        [0, 0, 0, 255],
      );

      const result = VisualComparator.compare(baseline, current);

      // 1 pixel out of 10000 = 0.01%
      expect(result.diffPercentage).toBeCloseTo(0.01, 2);
      expect(result.thresholdExceeded).toBe(false);
    });

    it('should apply threshold configuration correctly', () => {
      // Create images with measurable difference (10x10 black region = 1% of 100x100)
      const baseline = createTestImage(100, 100, [255, 255, 255, 255]);
      const withDifference = createImageWithRegion(
        100,
        100,
        [255, 255, 255, 255],
        0,
        0,
        10,
        10,
        [0, 0, 0, 255],
      );

      // With low threshold (strict) - 1% diff should exceed 0.5% threshold
      const strictResult = VisualComparator.compare(baseline, withDifference, {
        threshold: 0.5, // 0.5% tolerance
      });

      // With high threshold (permissive) - 1% diff should not exceed 2% threshold
      const permissiveResult = VisualComparator.compare(baseline, withDifference, {
        threshold: 2, // 2% tolerance
      });

      // Verify threshold behavior
      expect(strictResult.thresholdExceeded).toBe(true);
      expect(permissiveResult.thresholdExceeded).toBe(false);

      // Both should have same diff percentage (1%)
      expect(strictResult.diffPercentage).toBe(permissiveResult.diffPercentage);
      expect(strictResult.diffPercentage).toBe(1);
    });
  });

  describe('createVisualChange', () => {
    it('should create change object with correct type', () => {
      const result = {
        diffPixels: 100,
        diffPercentage: 1,
        thresholdExceeded: true,
        width: 100,
        height: 100,
      };

      const change = VisualComparator.createVisualChange(result);

      expect(change.type).toBe(DiffType.VISUAL);
    });

    it('should return CRITICAL severity when threshold exceeded', () => {
      const result = {
        diffPixels: 1000,
        diffPercentage: 10,
        thresholdExceeded: true,
        width: 100,
        height: 100,
      };

      const change = VisualComparator.createVisualChange(result);

      expect(change.severity).toBe(DiffSeverity.CRITICAL);
    });

    it('should return WARNING severity when threshold not exceeded but has diff', () => {
      const result = {
        diffPixels: 10,
        diffPercentage: 0.1,
        thresholdExceeded: false,
        width: 100,
        height: 100,
      };

      const change = VisualComparator.createVisualChange(result);

      expect(change.severity).toBe(DiffSeverity.WARNING);
    });

    it('should return INFO severity when no diff', () => {
      const result = {
        diffPixels: 0,
        diffPercentage: 0,
        thresholdExceeded: false,
        width: 100,
        height: 100,
      };

      const change = VisualComparator.createVisualChange(result);

      expect(change.severity).toBe(DiffSeverity.INFO);
    });

    it('should include percentage in description', () => {
      const result = {
        diffPixels: 500,
        diffPercentage: 5,
        thresholdExceeded: true,
        width: 100,
        height: 100,
      };

      const change = VisualComparator.createVisualChange(result);

      expect(change.description).toContain('5.00%');
      expect(change.description).toContain('500');
    });
  });
});
