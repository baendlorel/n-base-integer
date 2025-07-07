/**
 * The name of the N-base integer class.
 */
export const CLASS_NAME = 'NBaseInteger';

export const MAX_BASE = 10000; // Maximum base supported by the default charset

/**
 * Enum representing the result of a comparison operation.
 * - Name and values are the same as it is in **Rust**
 */
export const enum Ordering {
  Greater,
  Less,
  Equal,
}

export const Flag = {
  CLONE: Symbol('clone'),
  PRIVATE: Symbol('private'),
  CREATOR: Symbol('creator'),
};
