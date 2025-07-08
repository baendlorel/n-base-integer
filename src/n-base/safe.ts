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
  if (charsetCache.size > 100) {
    charsetCache.clear();
  }
  charsetCache.set(charset, arr);
  return arr;
};

export const isSafeInt = Number.isSafeInteger;

export const safeInt = (n: number) => {
  if (!isSafeInt(n)) {
    throw new TypeError(`The method is not called with a safe integer, got ${n}.`);
  }
  return n;
};
