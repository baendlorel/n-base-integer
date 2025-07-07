import { Flag } from './consts';

/**
 * Throws an error if the provided flag does not match the internal flag.
 * @param privateFlag The flag to check.
 * @param msg The error message to throw if the flag does not match.
 */
export const protect = (privateFlag: symbol, msg = `This method is prohibited from calling.`) => {
  if (privateFlag !== Flag.PRIVATE) {
    throw new Error(msg);
  }
};

export const safeCharset = (charset: string) => {
  if (charset.length < 2) {
    throw new RangeError(`Charset must contain at least 2 characters.`);
  }
  const deduped = new Set(charset.split(''));
  if (charset.length !== deduped.size) {
    throw new RangeError(`Given charset contains duplicate characters.`);
  }
  return charset;
};

export const safeInt = (n: number) => {
  if (!Number.isSafeInteger(n)) {
    throw new TypeError(`The method is not called with a safe integer, got ${n}.`);
  }
  return n;
};
