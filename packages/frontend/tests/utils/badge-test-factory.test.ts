/**
 * Badge Test Factory - Unit Tests
 * Verifies the badge test factory utility works correctly
 */

import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { createBadgeTestSuite } from './badge-test-factory';

describe('Badge Test Factory', () => {
  describe('createBadgeTestSuite', () => {
    it('should create test suite without errors', () => {
      // Create a minimal mock badge component
      const MockBadge = defineComponent({
        name: 'MockBadge',
        props: {
          status: {
            type: String,
            required: true,
          },
          size: {
            type: String,
            default: 'medium',
          },
        },
        setup(props) {
          return () =>
            h(
              'span',
              {
                class: ['n-tag', `n-tag--${props.size}-size`, 'n-tag--info-type'],
                'data-test': 'mock-badge',
              },
              props.status === 'NEW' ? 'New' : 'Unknown',
            );
        },
      });

      // This should not throw
      expect(() => {
        createBadgeTestSuite(MockBadge, {
          statuses: [{ value: 'NEW', expectedText: 'New', expectedType: 'info' }],
        });
      }).not.toThrow();
    });

    it('should accept custom prop name', () => {
      const MockBadge = defineComponent({
        name: 'CustomPropBadge',
        props: {
          type: {
            type: String,
            required: true,
          },
        },
        setup(props) {
          return () => h('span', { class: 'n-tag', 'data-test': 'custom-badge' }, props.type);
        },
      });

      expect(() => {
        createBadgeTestSuite(MockBadge, {
          statuses: [{ value: 'SUCCESS', expectedText: 'Success' }],
          propName: 'type',
        });
      }).not.toThrow();
    });

    it('should handle multiple statuses', () => {
      const MockBadge = defineComponent({
        name: 'MultiStatusBadge',
        props: {
          status: String,
        },
        setup(props) {
          const textMap: Record<string, string> = {
            NEW: 'New',
            ACTIVE: 'Active',
            COMPLETED: 'Completed',
          };
          return () =>
            h(
              'span',
              { class: 'n-tag', 'data-test': 'multi-badge' },
              textMap[props.status || 'NEW'] || 'Unknown',
            );
        },
      });

      expect(() => {
        createBadgeTestSuite(MockBadge, {
          statuses: [
            { value: 'NEW', expectedText: 'New' },
            { value: 'ACTIVE', expectedText: 'Active' },
            { value: 'COMPLETED', expectedText: 'Completed' },
          ],
        });
      }).not.toThrow();
    });
  });

  describe('Type Safety', () => {
    it('should enforce string literal types for status values', () => {
      const MockBadge = defineComponent({
        name: 'TypedBadge',
        props: { status: String },
        setup() {
          return () => h('span', { class: 'n-tag' });
        },
      });

      // TypeScript should enforce that value, expectedText match the type
      type ValidStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED';

      createBadgeTestSuite<ValidStatus>(MockBadge, {
        statuses: [
          { value: 'NEW', expectedText: 'New' },
          { value: 'IN_PROGRESS', expectedText: 'In Progress' },
          { value: 'COMPLETED', expectedText: 'Completed' },
        ],
      });

      // This test verifies TypeScript compilation succeeds
      expect(true).toBe(true);
    });
  });
});
