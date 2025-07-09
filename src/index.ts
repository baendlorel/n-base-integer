import { CLASS_NAME, Flag } from './n-base/consts';
import { chs } from './n-base/common';
import { safeBase, safeCharset } from './n-base/safe';
import { NBaseInteger as NBI } from './n-base/integer';

// 现在 TypeScript 可以正确推断 nsbc 的类型
const create = NBI[Flag.FACTORY](Flag.PRIVATE);

const DEF = `${CLASS_NAME}(n: string, base?: number, charset?: string)`;

const safeN = (n: string) => {
  if (typeof n !== 'string') {
    throw new TypeError(`${DEF} requires 'n' to be a non-empty string excludes '-'.`);
  }
  n = n.trim();
  if (n.length === 0 || n === '-') {
    throw new TypeError(`${DEF} requires 'n' to be non-empty and not '-'.`);
  }

  return n;
};

/**
 * Factory for NBaseInteger. Allows function-style creation of NBaseInteger instances.
 */
export const NBaseInteger = new Proxy(NBI, {
  apply(_target, _thisArg, args) {
    switch (args.length) {
      case 0:
        throw new TypeError(`${DEF} requires at least one argument.`);
      case 1:
        return create(safeN(args[0]), 10, chs.safe(10));
      case 2:
        return create(safeN(args[0]), safeBase(args[1]), chs.safe(args[1]));
      case 3:
        return create(safeN(args[0]), safeBase(args[1]), safeCharset(args[2], args[1]));
      default:
        throw new TypeError(`Too many arguments for ${DEF}. Expect 1~3, got ${args.length} `);
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
   * @param charset Custom charset(length >= `base`), must exclude dash, space, duplicate characters and control characters.
   */
  (n: string, base: number, charset: string): NBI;
};
