import { Flag } from './consts';

/**
 * Throws an error if the provided flag does not match the internal flag.
 * @param privateFlag The flag to check.
 * @param msg The error message to throw if the flag does not match.
 */
export const protect = (
  privateFlag: symbol,
  msg = `This method is prohibited from calling outside.`
) => {
  if (privateFlag !== Flag.PRIVATE) {
    throw new Error(msg);
  }
};

export const expect: (o: unknown, msg: string) => asserts o = (o: unknown, msg: string) => {
  if (!o) {
    throw new Error(msg);
  }
};

/**
 * Support emojis
 */
export const safeCharset = (charset: string) => {
  const charsetArr = Array.from(charset);
  const deduped = new Set(charsetArr);
  if (charsetArr.length !== deduped.size) {
    throw new RangeError(`'charset' must not contain duplicate chars.`);
  }
  if (deduped.has('-')) {
    throw new TypeError(
      `'charset' must not contain '-'. If the first digit is '-', we cannot not distinguish it from a negative sign.`
    );
  }
  if (deduped.size < 2) {
    throw new RangeError(`'charset' must contain at least 2 chars.`);
  }
  return charsetArr;
};

export const safeInt = (n: number) => {
  if (!Number.isSafeInteger(n)) {
    throw new TypeError(`The method is not called with a safe integer, got ${n}.`);
  }
  return n;
};
