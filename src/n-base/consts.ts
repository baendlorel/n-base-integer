/**
 * The name of the N-base integer class.
 */
export const CLASS_NAME = 'NBaseInteger';

export const MAX_BASE = 1_000_000; // Maximum base supported by the default charset

export const Flag = {
  CLONE: Symbol('clone'),

  PRIVATE: Symbol('private'),

  OMITTED: Symbol('omitted'),

  // TS can still tell the type of `NBaseInteger[FACTORY]`
  FACTORY: Symbol('factory'),
} as const;
