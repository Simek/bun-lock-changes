import { expect, test } from 'bun:test';

import { type ParsedLock } from '../../src/types';
import { countStatuses, diffLocks, STATUS } from '../../src/utils';
import { getTestLockContent } from '../testUtils';

function createLock(version: string): ParsedLock {
  return {
    lockfileVersion: 1,
    configVersion: 1,
    workspaces: {},
    overrides: {},
    packages: {
      react: [`react@${version}`, '', {}, ''],
    },
  };
}

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

test('Bun - detect prerelease updates', () => {
  const result = diffLocks(createLock('10.0.0-beta.22'), createLock('10.0.0-beta.23'));

  expect(Object.keys(result).length).toBe(1);
  expect(result.react.status).toBe(STATUS.UPDATED);
  expect(result.react.previous).toBe('10.0.0-beta.22');
  expect(result.react.current).toBe('10.0.0-beta.23');
});

test('Bun - detect prerelease downgrades', () => {
  const result = diffLocks(createLock('10.0.0-rc.2'), createLock('10.0.0-rc.1'));

  expect(Object.keys(result).length).toBe(1);
  expect(result.react.status).toBe(STATUS.DOWNGRADED);
  expect(result.react.previous).toBe('10.0.0-rc.2');
  expect(result.react.current).toBe('10.0.0-rc.1');
});
