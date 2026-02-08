import { expect, test } from 'bun:test';

import { countStatuses, diffLocks, STATUS } from '../../src/utils';
import { getTestLockContent } from '../testUtils';

test('Bun - detect changes', () => {
  const contentA = getTestLockContent('detect-changes', 'a.lock');
  const contentB = getTestLockContent('detect-changes', 'b.lock');

  const result = diffLocks(contentA, contentB);

  expect(Object.keys(result).length).toBe(560);

  expect(countStatuses(result, STATUS.ADDED)).toBe(130);
  expect(countStatuses(result, STATUS.UPDATED)).toBe(98);
  expect(countStatuses(result, STATUS.DOWNGRADED)).toBe(10);
  expect(countStatuses(result, STATUS.REMOVED)).toBe(322);
});

test('Bun - detect updates with parents', () => {
  const contentA = getTestLockContent('with-parents-change', 'a.lock');
  const contentB = getTestLockContent('with-parents-change', 'b.lock');

  const result = diffLocks(contentA, contentB);

  expect(Object.keys(result).length).toBe(3);

  expect(countStatuses(result, STATUS.ADDED)).toBe(1);
  expect(countStatuses(result, STATUS.UPDATED)).toBe(2);
  expect(countStatuses(result, STATUS.DOWNGRADED)).toBe(0);
  expect(countStatuses(result, STATUS.REMOVED)).toBe(0);
});
