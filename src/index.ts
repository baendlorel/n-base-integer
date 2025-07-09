import { CLASS_NAME, Flag } from './n-base/consts';
import { charsets } from './n-base/common';
import { expect } from './n-base/expect';
import { NBaseInteger as NBI } from './n-base/integer';
import { isSafeInt, safeCharset } from './n-base/safe';

// 现在 TypeScript 可以正确推断 nsbc 的类型
const nsbc = NBI[Flag.FACTORY](Flag.PRIVATE);

const DEF0 = `${CLASS_NAME}(...args)`;
const DEF1 = `${CLASS_NAME}(n: string)`;
const DEF2 = `${CLASS_NAME}(n: string, base: number)`;
const DEF3 = `${CLASS_NAME}(n: string, base: number, charset: string)`;

/**
 * Factory for NBaseInteger. Allows function-style creation of NBaseInteger instances.
 */
export const NBaseInteger = new Proxy(NBI, {
  apply(_target, _thisArg, args) {
    const [n, base, charset] = args;
    switch (args.length) {
      case 0:
        throw new TypeError(`${DEF0} requires at least one argument.`);
      case 1:
        expect(typeof n === 'string', `${DEF1} requires 'n' to be a string.`);
        return nsbc(n.trim(), 10, charsets.default);
      case 2:
        expect(isSafeInt(base) && base > 1, `${DEF2} requires 'base' to be an integer.`);
        if (typeof n === 'string' && n.length > 0) {
          return nsbc(n.trim(), base, charsets.default);
        }
        throw new TypeError(`${DEF2} requires 'n' to be a string.`);
      case 3:
        expect(typeof n === 'string', `${DEF3} requires 'n' to be a string.`);
        expect(isSafeInt(base), `${DEF3} requires 'base' to be an integer.`);
        return nsbc(n.trim(), base, safeCharset(charset, base));
      default:
        throw new TypeError(`Too many arguments for ${DEF0}. Expect 1~3, got ${args.length} `);
    }
  },
}) as typeof NBI & {
  /**
   * Create an `NBaseInteger` with default charsets
   * - default charsets is '0-9A-Za-z'
   * @param n N-number string
   * @param base Default is 10. Must be an integer that >= 2
   */
  (n: string, base?: number): NBI;

  /**
   * Create an `NBaseInteger` with default charsets
   * - default charsets is '0-9A-Za-z'
   * @param n N-number string
   * @param base Must be an integer that >= 2
   * @param charset Custom charset(length >= `base`), must exclude comma, dash, space, duplicate characters and control characters.
   */
  (n: string, base: number, charset: string): NBI;
};
