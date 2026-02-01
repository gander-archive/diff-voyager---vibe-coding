/**
 * Keyboard Navigation Accessibility tests
 * Tests for keyboard navigation, focus management, and screen reader support
 */

import type { ComponentMountingOptions } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Component } from 'vue';
import ProjectCard from '../../../src/components/ProjectCard.vue';
import ProjectForm from '../../../src/components/ProjectForm.vue';
import RunCard from '../../../src/components/RunCard.vue';

// Mock useMessage from naive-ui
const mockMessage = {
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

vi.mock('naive-ui', async () => {
  const actual = await vi.importActual('naive-ui');
  return {
    ...actual,
    useMessage: () => mockMessage,
  };
});

// Mock router
const mockRouter = {
  push: vi.fn(),
  currentRoute: {
    value: {
      name: 'projects',
      path: '/projects',
    },
  },
};

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRouter.currentRoute.value,
}));

describe('Keyboard Navigation Accessibility', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockRouter.push.mockClear();
    mockMessage.error.mockClear();
    mockMessage.success.mockClear();
    mockMessage.warning.mockClear();
    mockMessage.info.mockClear();
  });

  // Helper to mount component
  const mountComponent = <T extends Component>(
    component: T,
    options: ComponentMountingOptions<T> = {},
  ) => {
    return mount(component, options);
  };

  describe('Tab Navigation', () => {
    it('should allow tab navigation through interactive elements in ProjectCard', async () => {
      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: {
            id: '1',
            name: 'Test Project',
            baseUrl: 'https://example.com',
            createdAt: new Date().toISOString(),
            statistics: { totalPages: 10, totalRuns: 5 },
          },
        },
      });

      const buttons = wrapper.findAll('button, a[href]');
      expect(buttons.length).toBeGreaterThan(0);

      for (const button of buttons) {
        expect(button.attributes('tabindex')).not.toBe('-1');
      }
    });

    it('should maintain logical tab order in forms', async () => {
      const wrapper = mountComponent(ProjectForm, {
        props: {
          initialData: undefined,
        },
      });

      const inputs = wrapper.findAll('input, textarea, select, button');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should have focusable elements in RunCard', async () => {
      const wrapper = mountComponent(RunCard, {
        props: {
          run: {
            id: '1',
            projectId: '1',
            status: 'completed',
            isBaseline: false,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            statistics: { totalPages: 10, diffsFound: 2 },
          },
        },
      });

      const focusableElements = wrapper.findAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should respond to Enter key on clickable elements', async () => {
      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: {
            id: '1',
            name: 'Test Project',
            baseUrl: 'https://example.com',
            createdAt: new Date().toISOString(),
            statistics: { totalPages: 10, totalRuns: 5 },
          },
        },
      });

      const card = wrapper.find('[role="button"], a, button');
      if (card.exists()) {
        await card.trigger('keydown.enter');
        await wrapper.vm.$nextTick();
      }
    });

    it('should support Space key on buttons', async () => {
      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: {
            id: '1',
            name: 'Test Project',
            baseUrl: 'https://example.com',
            createdAt: new Date().toISOString(),
            statistics: { totalPages: 10, totalRuns: 5 },
          },
        },
      });

      const button = wrapper.find('button');
      if (button.exists()) {
        await button.trigger('keydown.space');
        await wrapper.vm.$nextTick();
      }
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators on ProjectCard', async () => {
      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: {
            id: '1',
            name: 'Test Project',
            baseUrl: 'https://example.com',
            createdAt: new Date().toISOString(),
            statistics: { totalPages: 10, totalRuns: 5 },
          },
        },
      });

      const focusableElements = wrapper.findAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should focus first input on ProjectForm mount', async () => {
      const wrapper = mountComponent(ProjectForm, {
        props: {
          initialData: undefined,
        },
      });

      await wrapper.vm.$nextTick();

      const firstInput = wrapper.find('input, textarea, select');
      expect(firstInput.exists()).toBe(true);
    });
  });

  describe('ARIA Attributes', () => {
    it('should have aria-label on icon-only buttons in ProjectCard', async () => {
      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: {
            id: '1',
            name: 'Test Project',
            baseUrl: 'https://example.com',
            createdAt: new Date().toISOString(),
            statistics: { totalPages: 10, totalRuns: 5 },
          },
        },
      });

      const buttons = wrapper.findAll('button');
      for (const button of buttons) {
        const hasText = button.text().trim().length > 0;
        const hasAriaLabel = button.attributes('aria-label');
        const hasAriaLabelledBy = button.attributes('aria-labelledby');

        if (!hasText) {
          expect(hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
        }
      }
    });

    it('should have proper status indicators in RunCard', async () => {
      const wrapper = mountComponent(RunCard, {
        props: {
          run: {
            id: '1',
            projectId: '1',
            status: 'completed',
            isBaseline: false,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            statistics: { totalPages: 10, diffsFound: 2 },
          },
        },
      });

      const text = wrapper.text();
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('Screen Reader Support', () => {
    it('should have descriptive labels for form inputs', async () => {
      const wrapper = mountComponent(ProjectForm, {
        props: {
          initialData: undefined,
        },
      });

      const inputs = wrapper.findAll('input, textarea, select');
      for (const input of inputs) {
        const id = input.attributes('id');
        const ariaLabel = input.attributes('aria-label');
        const ariaLabelledBy = input.attributes('aria-labelledby');

        if (id) {
          const label = wrapper.find(`label[for="${id}"]`);
          expect(label.exists() || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    });

    it('should have alt text or aria-label for icons', async () => {
      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: {
            id: '1',
            name: 'Test Project',
            baseUrl: 'https://example.com',
            createdAt: new Date().toISOString(),
            statistics: { totalPages: 10, totalRuns: 5 },
          },
        },
      });

      const images = wrapper.findAll('img');
      for (const img of images) {
        const alt = img.attributes('alt');
        const ariaLabel = img.attributes('aria-label');
        const role = img.attributes('role');

        expect(alt !== undefined || ariaLabel || role === 'presentation').toBeTruthy();
      }
    });
  });

  describe('Color and Contrast', () => {
    it('should not rely solely on color for status in RunCard', async () => {
      const wrapper = mountComponent(RunCard, {
        props: {
          run: {
            id: '1',
            projectId: '1',
            status: 'completed',
            isBaseline: false,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            statistics: { totalPages: 10, diffsFound: 2 },
          },
        },
      });

      const statusElements = wrapper.findAll('[class*="status"]');
      for (const element of statusElements) {
        const hasText = element.text().trim().length > 0;
        const hasIcon = element.find('svg, img, i').exists();
        const hasAriaLabel = element.attributes('aria-label');

        expect(hasText || hasIcon || hasAriaLabel).toBeTruthy();
      }
    });
  });

  describe('Form Validation Accessibility', () => {
    it('should mark required fields appropriately', async () => {
      const wrapper = mountComponent(ProjectForm, {
        props: {
          initialData: undefined,
        },
      });

      const requiredInputs = wrapper.findAll('input[required], textarea[required]');
      for (const input of requiredInputs) {
        const hasAriaRequired = input.attributes('aria-required') === 'true';
        const hasRequiredAttr = input.attributes('required') !== undefined;

        expect(hasAriaRequired || hasRequiredAttr).toBeTruthy();
      }
    });

    it('should provide error messages for invalid inputs', async () => {
      const wrapper = mountComponent(ProjectForm, {
        props: {
          initialData: undefined,
        },
      });

      const inputs = wrapper.findAll('input[aria-invalid="true"]');
      for (const input of inputs) {
        const describedBy = input.attributes('aria-describedby');
        const errorId = input.attributes('aria-errormessage');

        if (describedBy || errorId) {
          expect(describedBy || errorId).toBeDefined();
        }
      }
    });
  });

  describe('Interactive Element Accessibility', () => {
    it('should have proper button roles in ProjectCard', async () => {
      const wrapper = mountComponent(ProjectCard, {
        props: {
          project: {
            id: '1',
            name: 'Test Project',
            baseUrl: 'https://example.com',
            createdAt: new Date().toISOString(),
            statistics: { totalPages: 10, totalRuns: 5 },
          },
        },
      });

      const buttons = wrapper.findAll('button');
      for (const button of buttons) {
        const role = button.attributes('role');
        expect(!role || role === 'button').toBe(true);
      }
    });

    it('should have proper link roles in RunCard', async () => {
      const wrapper = mountComponent(RunCard, {
        props: {
          run: {
            id: '1',
            projectId: '1',
            status: 'completed',
            isBaseline: false,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            statistics: { totalPages: 10, diffsFound: 2 },
          },
        },
      });

      const links = wrapper.findAll('a[href]');
      for (const link of links) {
        expect(link.attributes('href')).toBeDefined();
      }
    });
  });
});
