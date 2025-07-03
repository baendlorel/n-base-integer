/**
 * The name of the N-base integer class.
 */
export const NAME = 'NBaseInteger';

/**
 * Symbol used as a private flag for internal access control.
 */
export const flag = Symbol();

/**
 * Throws an error if the provided flag does not match the internal flag.
 * @param privateFlag The flag to check.
 * @param msg The error message to throw if the flag does not match.
 */
export const protect = (privateFlag: symbol, msg = `This method is prohibited from calling.`) => {
  if (privateFlag !== flag) {
    throw new Error(msg);
  }
};

/**
 * Enum representing the result of a comparison operation.
 * - Name and values are the same as it is in **Rust**
 */
export const enum Ordering {
  Greater,
  Less,
  Equal,
}
