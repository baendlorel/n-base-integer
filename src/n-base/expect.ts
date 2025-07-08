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

const charsetCache = new Map<string, string[]>();

/**
 * Support emojis
 */
export const safeCharset = (charset: string, base: number) => {
  const cache = charsetCache.get(charset);
  if (cache) {
    if (cache.length > base) {
      throw new RangeError(`charset.length(${cache.length}) must <= base(${base}).`);
    }
    return cache;
  }
  const arr = Array.from(charset);
  const deduped = new Set(arr);
  if (arr.length !== deduped.size) {
    throw new RangeError(`'charset' must not contain duplicate chars.`);
  }
  if (deduped.has('-')) {
    throw new TypeError(`'charset' must not contain '-'. It is reserved to be the negative sign.`);
  }
  if (deduped.has(',')) {
    throw new TypeError(`'charset' must not contain ','. It is reserved to be the seperator.`);
  }
  if (arr.length < 2) {
    throw new RangeError(`'charset' must contain at least 2 chars.`);
  }
  if (arr.length > base) {
    throw new RangeError(`charset.length(${arr.length}) must <= base(${base}).`);
  }
  charsetCache.set(charset, arr);
  return arr;
};

export const clearCharsetCache = () => charsetCache.clear();

export const safeInt = (n: number) => {
  if (!Number.isSafeInteger(n)) {
    throw new TypeError(`The method is not called with a safe integer, got ${n}.`);
  }
  return n;
};
