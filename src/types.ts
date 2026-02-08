export type StausType = 'ADDED' | 'DOWNGRADED' | 'REMOVED' | 'UPDATED';

export type ParsedLock = {
  lockfileVersion: number;
  configVersion: number;
  workspaces: Record<string, Record<string, LockEntry>>;
  overrides: Record<string, string>;
  packages: Record<string, [string, string, Record<string, LockEntry>, string]>;
};

export type LockChanges = {
  previous: string;
  current: string;
  status: StausType;
  parents: string[];
};

export type LockEntry = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
