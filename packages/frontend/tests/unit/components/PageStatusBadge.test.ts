/**
 * PageStatusBadge tests
 * Tests page status badge component for displaying page status
 */

import { PageStatus } from '@gander-tools/diff-voyager-shared';
import PageStatusBadge from '../../../src/components/PageStatusBadge.vue';
import { createBadgeTestSuite } from '../../utils/badge-test-factory.js';

createBadgeTestSuite(PageStatusBadge, {
  propName: 'status',
  statuses: [
    {
      value: PageStatus.PENDING,
      expectedText: 'Pending',
      expectedType: 'default',
      shouldAnimate: false,
    },
    {
      value: PageStatus.IN_PROGRESS,
      expectedText: 'Processing',
      expectedType: 'info',
      shouldAnimate: true,
    },
    {
      value: PageStatus.COMPLETED,
      expectedText: 'Completed',
      expectedType: 'success',
      shouldAnimate: false,
    },
    {
      value: PageStatus.PARTIAL,
      expectedText: 'Partial',
      expectedType: 'warning',
      shouldAnimate: false,
    },
    {
      value: PageStatus.ERROR,
      expectedText: 'Error',
      expectedType: 'error',
      shouldAnimate: false,
    },
  ],
  defaultSize: 'small',
  defaultDataTestId: 'page-status-badge',
  animationClass: 'badge-animated',
});
