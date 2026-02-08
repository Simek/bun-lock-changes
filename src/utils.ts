import semverCoerce from 'semver/functions/coerce';
import semverCompare from 'semver/functions/compare';
import semverValid from 'semver/functions/valid';

import { type LockChanges, type ParsedLock, type StausType } from './types';

export const STATUS: Record<StausType, StausType> = {
  ADDED: 'ADDED',
  UPDATED: 'UPDATED',
  DOWNGRADED: 'DOWNGRADED',
  REMOVED: 'REMOVED',
};

export const STATUS_ORDER: StausType[] = [STATUS.ADDED, STATUS.UPDATED, STATUS.DOWNGRADED, STATUS.REMOVED];

export function countStatuses(lockChanges: Record<string, LockChanges>, statusToCount: string) {
  return Object.values(lockChanges).filter(({ status }) => status === statusToCount).length;
}

function formatLockEntry({
  packages,
}: ParsedLock): Record<string, { name: string; version: string; parents: string[] }> {
  return Object.fromEntries(
    Object.keys(packages).map(key => {
      const names = splitNameChain(key);
      const pkg = names.at(-1);
      const data = packages[key];
      const versionDelimiter = data[0].lastIndexOf('@');
      const version = semverValid(semverCoerce(data[0].slice(versionDelimiter + 1))) ?? '0.0.0';
      return [pkg, { name: pkg, version, parents: names.slice(0, -1) }];
    })
  );
}

function splitNameChain(input: string): string[] {
  const parts = input.split('/').filter(Boolean);
  const out = [];

  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];

    if (seg.startsWith('@')) {
      const next = parts[i + 1];
      if (!next || next.startsWith('@')) {
        throw new Error(`Invalid scoped segment at index ${i}: "${seg}"`);
      }
      out.push(`${seg}/${next}`);
      i++;
    } else {
      out.push(seg);
    }
  }

  return out;
}

export function diffLocks(previous: ParsedLock, current: ParsedLock): Record<string, LockChanges> {
  const changes: Record<string, LockChanges> = {};
  const previousPackages = formatLockEntry(previous);
  const currentPackages = formatLockEntry(current);

  Object.keys(previousPackages).forEach(key => {
    changes[key] = {
      parents: previousPackages[key].parents,
      previous: previousPackages[key].version,
      current: '-',
      status: STATUS.REMOVED,
    };
  });

  Object.keys(currentPackages).forEach(key => {
    if (!changes[key]) {
      changes[key] = {
        parents: currentPackages[key].parents,
        previous: '-',
        current: currentPackages[key].version,
        status: STATUS.ADDED,
      };
    } else {
      if (changes[key].previous === currentPackages[key].version) {
        delete changes[key];
      } else {
        changes[key].current = currentPackages[key].version;
        if (semverCompare(changes[key].previous, changes[key].current) === 1) {
          changes[key].status = STATUS.DOWNGRADED;
        } else {
          changes[key].status = STATUS.UPDATED;
        }
      }
    }
  });

  return changes;
}
