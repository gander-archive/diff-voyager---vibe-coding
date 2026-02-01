/**
 * RunStatusBadge tests
 * Tests run status badge component for displaying run status
 */

import { RunStatus } from '@gander-tools/diff-voyager-shared';
import RunStatusBadge from '../../../src/components/RunStatusBadge.vue';
import { createBadgeTestSuite } from '../../utils/badge-test-factory.js';

createBadgeTestSuite(RunStatusBadge, {
  propName: 'status',
  statuses: [
    {
      value: RunStatus.NEW,
      expectedText: 'Pending',
      expectedType: 'default',
      shouldAnimate: false,
    },
    {
      value: RunStatus.IN_PROGRESS,
      expectedText: 'Processing',
      expectedType: 'info',
      shouldAnimate: true,
    },
    {
      value: RunStatus.COMPLETED,
      expectedText: 'Completed',
      expectedType: 'success',
      shouldAnimate: false,
    },
    {
      value: RunStatus.INTERRUPTED,
      expectedText: 'Failed',
      expectedType: 'error',
      shouldAnimate: false,
    },
  ],
  defaultSize: 'small',
  defaultDataTestId: 'run-status-badge',
  animationClass: 'badge-animated',
});
