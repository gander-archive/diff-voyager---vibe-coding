/**
 * UUID Validation Helper - Unit Tests
 * Verifies the UUID validation helper utility exports correctly
 */

import { describe, expect, it } from 'vitest';
import { testInvalidUuidRejection } from './uuid-validation.js';

describe('UUID Validation Helper', () => {
  it('should export testInvalidUuidRejection function', () => {
    expect(testInvalidUuidRejection).toBeDefined();
    expect(typeof testInvalidUuidRejection).toBe('function');
  });

  it('should have correct function signature (2 required params, 1 optional)', () => {
    // Function.length returns number of required parameters
    expect(testInvalidUuidRejection.length).toBe(2);
  });

  it('should be importable from helpers directory', () => {
    // This test passing means the import worked correctly
    expect(testInvalidUuidRejection).toBeTruthy();
  });
});
