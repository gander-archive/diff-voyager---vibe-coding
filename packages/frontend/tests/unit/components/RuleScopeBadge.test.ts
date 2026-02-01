/**
 * RuleScopeBadge tests
 * Tests rule scope badge component for displaying rule scope
 */

import { RuleScope } from '@gander-tools/diff-voyager-shared';
import RuleScopeBadge from '../../../src/components/RuleScopeBadge.vue';
import { createBadgeTestSuite } from '../../utils/badge-test-factory.js';

createBadgeTestSuite(RuleScopeBadge, {
  propName: 'scope',
  statuses: [
    {
      value: RuleScope.GLOBAL,
      expectedText: 'Global',
      expectedType: 'info',
    },
    {
      value: RuleScope.PROJECT,
      expectedText: 'Project',
      expectedType: 'default',
    },
  ],
  defaultSize: 'medium',
  defaultDataTestId: 'rule-scope-badge',
});
