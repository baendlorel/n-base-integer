import { NBaseInteger as NBI } from './n-base/integer';

export const NBaseInteger = new Proxy(NBI, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target.from, thisArg, argArray);
  },
}) as typeof NBI & {
  /**
   * Create an `NBaseInteger` with default charsets
   * - default charsets is '0-9A-Za-z'
   * @param n 10-number
   * @param base Default is 10. `base` must >= 2 and be an integer.
   */
  (n: number, base?: number): NBI;
};
