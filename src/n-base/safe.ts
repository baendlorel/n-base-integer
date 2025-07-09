import { MAX_BASE } from './consts';

const charsetCache = new Map<string, string[]>();

const hasControlCharacters = (charset: string): boolean => /\p{C}/u.test(charset);

/**
 * Assert `charset` is a valid.
 * - **`base` must be valid first.**
 * - Support emojis
 */
export const safeCharset = (charset: string, base: number) => {
  if (typeof charset !== 'string') {
    throw new TypeError(`'charset' must be a string.`);
  }

  const cache = charsetCache.get(charset);
  if (cache) {
    if (cache.length < base) {
      throw new RangeError(`charset.length must >= base, but ${cache.length} < ${base}.`);
    }
    return cache.slice(0, base);
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

  // & Commas now only appear when calling `toString(null)`.
  // & Since we already have charsets here, it shall not be confusing.
  // if (deduped.has(',')) {
  //   throw new TypeError(`'charset' must exclude ','. It is reserved to be the seperator.`);
  // }
  if (deduped.has(' ')) {
    throw new TypeError(`'charset' must exclude ' '.`);
  }
  if (arr.length < base) {
    throw new RangeError(`charset.length(${arr.length}) must >= base(${base}).`);
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
  if (!Number.isSafeInteger(base) || base < 2 || base > MAX_BASE) {
    throw new TypeError(`'base' must be a 2 ~ ${MAX_BASE} integer.`);
  }
  return base;
};
