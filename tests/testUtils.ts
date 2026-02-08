import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import JSONC from 'tiny-jsonc';

import { type ParsedLock } from '../src/types';

export function getTestLockContent(testName: string, filename: string): ParsedLock {
  return JSONC.parse(
    fs.readFileSync(path.resolve(process.cwd(), './tests/unit/', testName, filename), {
      encoding: 'utf8',
    })
  );
}
