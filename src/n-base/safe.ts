import { MAX_BASE } from './consts';

const charsetCache = new Map<string, string[]>();

const hasControlCharacters = (charset: string): boolean => /\p{C}/u.test(charset);

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
    throw new TypeError(`'charset' must exclude duplicate chars.`);
  }
  if (hasControlCharacters(charset)) {
    throw new TypeError(`'charset' must exclude control characters.`);
  }
  if (deduped.has('.')) {
    throw new TypeError(`'charset' must exclude '.'. Might be confused with demical point.`);
  }
  if (deduped.has('-')) {
    throw new TypeError(`'charset' must exclude '-'. Might be confused with negative sign.`);
  }
  if (deduped.has(',')) {
    throw new TypeError(`'charset' must exclude ','. It is reserved to be the seperator.`);
  }
  if (deduped.has(' ')) {
    throw new TypeError(`'charset' must exclude ' '.`);
  }
  if (arr.length < 2) {
    throw new RangeError(`'charset' must contain at least 2 chars.`);
  }
  if (arr.length > base) {
    throw new RangeError(`charset.length(${arr.length}) must <= base(${base}).`);
  }
  if (charsetCache.size > 100) {
    charsetCache.clear();
  }
  charsetCache.set(charset, arr);
  return arr;
};

export const safeInt = (n: number) => {
  if (!Number.isSafeInteger(n)) {
    throw new TypeError(`The method is not called with a safe integer, got ${n}.`);
  }
  return n;
};

/**
 * Ensure `base` >= 2 and is a safe integer.
 * @throws When `base` is not a safe integer or is less than 2.
 */
export const safeBase = (base: number) => {
  if (Number.isSafeInteger(base) && base > 1) {
    throw new TypeError(`'base' must be an integer from 2 to ${MAX_BASE}.`);
  }
  return base;
};
