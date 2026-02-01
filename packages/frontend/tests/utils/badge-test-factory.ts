/**
 * Badge Test Factory
 * Shared test utility for testing badge components with standard behavior
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { Component } from 'vue';

export interface BadgeStatusConfig<T extends string> {
  value: T;
  expectedText: string;
  expectedType?: string;
}

export interface BadgeTestConfig<T extends string> {
  statuses: Array<BadgeStatusConfig<T>>;
  propName?: string;
}

/**
 * Creates a standard test suite for badge components
 * @param BadgeComponent - Vue component to test
 * @param config - Configuration with statuses and prop name
 */
export function createBadgeTestSuite<T extends string>(
  BadgeComponent: Component,
  config: BadgeTestConfig<T>,
): void {
  const propName = config.propName || 'status';

  describe(`${BadgeComponent.name || 'Badge'} - Standard Badge Behavior`, () => {
    config.statuses.forEach(({ value, expectedText, expectedType }) => {
      it(`should render "${value}" badge correctly`, () => {
        const wrapper = mount(BadgeComponent, {
          props: { [propName]: value },
        });

        expect(wrapper.text()).toContain(expectedText);

        if (expectedType) {
          expect(wrapper.find('.n-tag').classes()).toContain(`n-tag--${expectedType}-type`);
        }
      });
    });

    it('should support different sizes', () => {
      const wrapper = mount(BadgeComponent, {
        props: {
          [propName]: config.statuses[0].value,
          size: 'large',
        },
      });

      expect(wrapper.find('.n-tag').classes()).toContain('n-tag--large-size');
    });

    it('should have data-test attribute', () => {
      const wrapper = mount(BadgeComponent, {
        props: { [propName]: config.statuses[0].value },
      });

      expect(wrapper.attributes('data-test')).toBeDefined();
    });
  });
}
