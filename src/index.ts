import { CLASS_NAME, Flag, Factory } from './n-base/consts';
import { charsets } from './n-base/common';
import { expect } from './n-base/expect';
import { NBaseInteger as NBI } from './n-base/integer';
import { isSafeInt, safeCharset } from './n-base/safe';

const nb = NBI[Factory.N_BASE] as (priv: symbol, n: number, base: number) => NBI;
const nsbc = NBI[Factory.NSTR_BASE_CHRS] as (
  priv: symbol,
  n: string,
  base: number,
  charset: readonly string[]
) => NBI;

const DEF0 = `${CLASS_NAME}(...args)`;
const DEF1 = `${CLASS_NAME}(n: number)`;
const DEF2 = `${CLASS_NAME}(n: number | string, base: number)`;
const DEF3 = `${CLASS_NAME}(nstr: string, base: number, charset: string)`;

/**
 * Factory for NBaseInteger. Allows function-style creation of NBaseInteger instances.
 */
export const NBaseInteger = new Proxy(NBI, {
  apply(_target, _thisArg, args) {
    switch (args.length) {
      case 0:
        throw new TypeError(`${DEF0} requires at least one argument.`);
      case 1:
        expect(isSafeInt(args[0]), `${DEF1} requires 'n' to be an integer.`);
        return nb(Flag.PRIVATE, args[0], 10);
      case 2:
        expect(isSafeInt(args[1]) && args[1] > 1, `${DEF2} requires base to be an integer.`);
        if (isSafeInt(args[0])) {
          return nb(Flag.PRIVATE, args[0], args[1]);
        }
        if (typeof args[0] === 'string' && args[0].length > 0) {
          return nsbc(Flag.PRIVATE, args[0], args[1], charsets.default);
        }
        throw new TypeError(`${DEF2} requires 'n' to be an integer or string.`);
      case 3:
        expect(typeof args[0] === 'string', `${DEF3} requires 'nstr' to be a string.`);
        expect(isSafeInt(args[1]), `${DEF3} requires 'base' to be an integer.`);
        return nsbc(Flag.PRIVATE, args[0], args[1], safeCharset(args[2], args[1]));
      default:
        throw new TypeError(`Too many arguments for ${DEF0}. Expect 1~3, got ${args.length} `);
    }
  },
}) as typeof NBI & {
  /**
   * ! **BEWARE: NBaseInteger(10,2) is 10 but NBaseInteger('10',2) is 2**
   *
   * Create an `NBaseInteger` with default charsets
   * - default charsets is '0-9A-Za-z'
   * @param n 10-number
   * @param base Default is 10. `base` must be an integer that >= 2
   */
  (n: number, base?: number): NBI;

  /**
   * ! **BEWARE: NBaseInteger(10,2) is 10 but NBaseInteger('10',2) is 2**
   *
   * Create an `NBaseInteger` with default charsets
   * - default charsets is '0-9A-Za-z'
   * @param n N-number string
   * @param base `base` must be an integer that >= 2
   */
  (nstr: string, base: number): NBI;

  /**
   * ! **BEWARE: NBaseInteger(10,2,...) is 10 but NBaseInteger('10',2,...) is 2**
   *
   * Create an `NBaseInteger` with default charsets
   * - default charsets is '0-9A-Za-z'
   * @param n N-number string
   * @param base Must be an integer that >= 2
   * @param charset Custom charset(length >= base), must not contain duplicate chars.
   */
  (nstr: string, base: number, charset: string): NBI;
};
