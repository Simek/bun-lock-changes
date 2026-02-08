import { expect, test } from 'bun:test';

import { countStatuses, diffLocks, STATUS } from '../../src/utils';
import { getTestLockContent } from '../testUtils';

void test('Bun - detect changes', async () => {
  const contentA = await getTestLockContent('detect-changes', 'a.lock');
  const contentB = await getTestLockContent('detect-changes', 'b.lock');

  const result = diffLocks(contentA, contentB);

  expect(Object.keys(result).length).toBe(452);

  expect(countStatuses(result, STATUS.ADDED)).toBe(100);
  expect(countStatuses(result, STATUS.UPDATED)).toBe(97);
  expect(countStatuses(result, STATUS.DOWNGRADED)).toBe(3);
  expect(countStatuses(result, STATUS.REMOVED)).toBe(252);
});
