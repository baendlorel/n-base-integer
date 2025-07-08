/**
 * The name of the N-base integer class.
 */
export const CLASS_NAME = 'NBaseInteger';

export const MAX_BASE = 1_000_000; // Maximum base supported by the default charset

/**
 * Enum representing the result of a comparison operation.
 * - Name and values are the same as it is in **Rust**
 */
export const enum Ordering {
  Less = -1,
  Equal,
  Greater,
}

export const Flag = {
  CLONE: Symbol('clone'),
  PRIVATE: Symbol('private'),
  CREATOR: Symbol('creator'),
  NOT_GIVEN: Symbol('not-given'),
};
