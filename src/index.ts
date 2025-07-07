import { Flag } from './n-base/consts';
import { NBaseInteger as NBI } from './n-base/integer';

export const NBaseInteger = new Proxy(NBI, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target[Flag.CREATOR], thisArg, [Flag.PRIVATE].concat(argArray));
  },
}) as typeof NBI & {
  /**
   * Create an `NBaseInteger` with default charsets
   * - default charsets is '0-9A-Za-z'
   * @param n 10-number
   * @param base Default is 10. `base` must >= 2 and be an integer.
   */
  (n: number, base?: number): NBI;

  /**
   * Create an `NBaseInteger` with default charsets
   * - default charsets is '0-9A-Za-z'
   * @param n 10-number
   * @param base Default is 10. `base` must >= 2 and be an integer.
   * @param charset Custom charset(length >= base), must not contain duplicate chars.
   */
  (n: number, base: number, charset: string): NBI;

  /**
   * Create an `NBaseInteger` with default charsets
   * - default charsets is '0-9A-Za-z'
   * @param n N-number string
   * @param base Default is 10. `base` must >= 2 and be an integer.
   */
  (n: string, base?: number): NBI;

  /**
   * Create an `NBaseInteger` with default charsets
   * - default charsets is '0-9A-Za-z'
   * @param n N-number string
   * @param base Default is 10. `base` must >= 2 and be an integer.
   * @param charset Custom charset(length >= base), must not contain duplicate chars.
   */
  (n: string, base: number, charset: string): NBI;
};
