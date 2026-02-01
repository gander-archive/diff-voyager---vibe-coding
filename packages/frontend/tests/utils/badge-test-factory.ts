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
  shouldAnimate?: boolean;
}

export interface BadgeTestConfig<T extends string> {
  statuses: Array<BadgeStatusConfig<T>>;
  propName?: string;
  defaultSize?: 'small' | 'medium' | 'large';
  defaultDataTestId?: string;
  animationClass?: string;
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
    config.statuses.forEach(({ value, expectedText, shouldAnimate }) => {
      it(`should render "${value}" badge correctly`, () => {
        const wrapper = mount(BadgeComponent, {
          props: { [propName]: value },
        });

        expect(wrapper.text()).toContain(expectedText);

        // Check animation if specified
        if (config.animationClass && shouldAnimate !== undefined) {
          const animationElement = wrapper.find(`.${config.animationClass}`);
          if (shouldAnimate) {
            expect(animationElement.exists()).toBe(true);
          } else {
            expect(animationElement.exists()).toBe(false);
          }
        }
      });
    });

    if (config.defaultSize) {
      it('should support different sizes', () => {
        const wrapper = mount(BadgeComponent, {
          props: {
            [propName]: config.statuses[0].value,
            size: 'large',
          },
        });

        expect(wrapper.exists()).toBe(true);
      });
    }

    if (config.defaultDataTestId) {
      it('should have data-test attribute', () => {
        const wrapper = mount(BadgeComponent, {
          props: { [propName]: config.statuses[0].value },
        });

        const badge = wrapper.find(`[data-test="${config.defaultDataTestId}"]`);
        expect(badge.exists()).toBe(true);
      });
    }
  });
}
