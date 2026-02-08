import path from 'node:path';
import process from 'node:process';

import { type ParsedLock } from '../src/types';

export async function getTestLockContent(testName: string, filename: string) {
  const lockFile = Bun.file(path.resolve(process.cwd(), './tests/unit/', testName, filename));
  return Bun.JSONC.parse(await lockFile.text()) as ParsedLock;
}
