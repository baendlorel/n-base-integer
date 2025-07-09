import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';

describe('NBaseInteger Creation Tests', () => {
  describe('Factory function (index.ts)', () => {
    describe('Valid cases', () => {
      it('should create with single argument (default base 10)', () => {
        const num = NBaseInteger('123');
        expect(num.base).toBe(10);
        expect(num.toString()).toBe('123');
      });

      it('should create with two arguments (custom base)', () => {
        const num = NBaseInteger('1010', 2);
        expect(num.base).toBe(2);
        expect(num.toString()).toBe('1010');
      });

      it('should create with three arguments (custom base and charset)', () => {
        const num = NBaseInteger('AB', 16, '0123456789ABCDEF');
        expect(num.base).toBe(16);
        expect(num.toString()).toBe('AB');
      });

      it('should handle negative numbers', () => {
        const num = NBaseInteger('-123');
        expect(num.toString()).toBe('-123');
        expect(num.sgn).toBe(-1);
      });

      it('should trim whitespace from input', () => {
        const num = NBaseInteger('  123  ');
        expect(num.toString()).toBe('123');
      });

      it('should handle zero', () => {
        const num = NBaseInteger('0');
        expect(num.isZero).toBe(true);
        expect(num.sgn).toBe(0);
      });
    });

    describe('Error cases - Invalid arguments count', () => {
      it('should throw error with no arguments', () => {
        expect(() => (NBaseInteger as any)()).toThrow(
          'NBaseInteger(n: string, base?: number, charset?: string) requires at least one argument.'
        );
      });

      it('should throw error with too many arguments', () => {
        expect(() => (NBaseInteger as any)('123', 10, '0123456789', 'extra')).toThrow(
          'Too many arguments for NBaseInteger(n: string, base?: number, charset?: string). Expect 1~3, got 4'
        );
      });
    });

    describe('Error cases - Invalid string (n)', () => {
      it('should throw error when n is not a string', () => {
        expect(() => (NBaseInteger as any)(123)).toThrow(
          "NBaseInteger(n: string, base?: number, charset?: string) requires 'n' to be a non-empty string excludes '-'."
        );
      });

      it('should throw error when n is empty string', () => {
        expect(() => NBaseInteger('')).toThrow(
          "NBaseInteger(n: string, base?: number, charset?: string) requires 'n' to be non-empty and not '-'."
        );
      });

      it('should throw error when n is only whitespace', () => {
        expect(() => NBaseInteger('   ')).toThrow(
          "NBaseInteger(n: string, base?: number, charset?: string) requires 'n' to be non-empty and not '-'."
        );
      });

      it('should throw error when n is only minus sign', () => {
        expect(() => NBaseInteger('-')).toThrow(
          "NBaseInteger(n: string, base?: number, charset?: string) requires 'n' to be non-empty and not '-'."
        );
      });
    });

    describe('Error cases - Invalid base', () => {
      it('should throw error when base is not an integer', () => {
        expect(() => NBaseInteger('123', 2.5)).toThrow("'base' must be a 2 ~ 1000000 integer.");
      });

      it('should throw error when base is less than 2', () => {
        expect(() => NBaseInteger('123', 1)).toThrow("'base' must be a 2 ~ 1000000 integer.");
      });

      it('should throw error when base is too large', () => {
        expect(() => NBaseInteger('123', 1000001)).toThrow("'base' must be a 2 ~ 1000000 integer.");
      });

      it('should throw error when base is not a safe integer', () => {
        expect(() => NBaseInteger('123', Number.MAX_SAFE_INTEGER + 1)).toThrow(
          "'base' must be a 2 ~ 1000000 integer."
        );
      });
    });

    describe('Error cases - Base exceeds default charset', () => {
      it('should throw error when base exceeds default charset length', () => {
        // Default charset has 62 characters (0-9A-Za-z)
        expect(() => NBaseInteger('123', 63)).toThrow(
          'Base 63 exceeds the length of the default charset (62).'
        );
      });
    });

    describe('Error cases - Invalid charset', () => {
      it('should throw error when charset is not a string', () => {
        expect(() => (NBaseInteger as any)('123', 10, 123)).toThrow("'charset' must be a string.");
      });

      it('should throw error when charset has duplicate characters', () => {
        expect(() => NBaseInteger('123', 4, '0123')).not.toThrow(); // valid
        expect(() => NBaseInteger('123', 4, '0112')).toThrow(
          "'charset' must exclude duplicate chars."
        );
      });

      it('should throw error when charset contains control characters', () => {
        expect(() => NBaseInteger('123', 4, '01\x002')).toThrow(
          "'charset' must exclude control characters."
        );
      });

      it('should throw error when charset contains dot', () => {
        expect(() => NBaseInteger('123', 4, '01.2')).toThrow(
          "'charset' must exclude '.'. Might be confused with demical point."
        );
      });

      it('should throw error when charset contains dash', () => {
        expect(() => NBaseInteger('123', 4, '01-2')).toThrow(
          "'charset' must exclude '-'. Might be confused with negative sign."
        );
      });

      it('should throw error when charset contains space', () => {
        expect(() => NBaseInteger('123', 4, '01 2')).toThrow("'charset' must exclude ' '.");
      });

      // ? 为什么单独运行没有问题，一起运行通不过？
      // * 原来是因为缓存charset中的length<base判定，不等号方向写反了
      it('should throw error when charset is shorter than base', () => {
        expect(() => NBaseInteger('123', 5, '0123')).toThrow(
          'charset.length must >= base, but 4 < 5.'
        );
      });
    });
  });

  describe('Static method: from', () => {
    describe('Valid cases', () => {
      it('should create from positive number', () => {
        const num = NBaseInteger.from(123, 10);
        expect(num.toString()).toBe('123');
        expect(num.base).toBe(10);
      });

      it('should create from negative number', () => {
        const num = NBaseInteger.from(-123, 10);
        expect(num.toString()).toBe('-123');
        expect(num.sgn).toBe(-1);
      });

      it('should create from zero', () => {
        const num = NBaseInteger.from(0, 10);
        expect(num.isZero).toBe(true);
      });

      it('should create with different bases', () => {
        const num2 = NBaseInteger.from(10, 2);
        const num16 = NBaseInteger.from(255, 16);
        expect(num2.base).toBe(2);
        expect(num16.base).toBe(16);
      });
    });

    describe('Error cases', () => {
      it('should throw error when n is not a safe integer', () => {
        expect(() => NBaseInteger.from(Number.MAX_SAFE_INTEGER + 1, 10)).toThrow(
          'The method is not called with a safe integer, got 9007199254740992.'
        );
      });

      it('should throw error when n is NaN', () => {
        expect(() => NBaseInteger.from(NaN, 10)).toThrow(
          'The method is not called with a safe integer, got NaN.'
        );
      });

      it('should throw error when n is Infinity', () => {
        expect(() => NBaseInteger.from(Infinity, 10)).toThrow(
          'The method is not called with a safe integer, got Infinity.'
        );
      });

      it('should throw error when n is a float', () => {
        expect(() => NBaseInteger.from(12.5, 10)).toThrow(
          'The method is not called with a safe integer, got 12.5.'
        );
      });

      it('should throw error when base is invalid', () => {
        expect(() => NBaseInteger.from(123, 1)).toThrow("'base' must be a 2 ~ 1000000 integer.");
      });
    });
  });

  describe('Static method: fromDigits', () => {
    describe('Valid cases', () => {
      it('should create from digit array', () => {
        const num = NBaseInteger.fromDigits([1, 2, 3], 10);
        expect(num.toString()).toBe('123');
      });

      it('should create negative number', () => {
        const num = NBaseInteger.fromDigits([1, 2, 3], 10, true);
        expect(num.toString()).toBe('-123');
        expect(num.sgn).toBe(-1);
      });

      it('should create positive number explicitly', () => {
        const num = NBaseInteger.fromDigits([1, 2, 3], 10, false);
        expect(num.toString()).toBe('123');
        expect(num.sgn).toBe(1);
      });

      it('should handle different bases', () => {
        const num2 = NBaseInteger.fromDigits([1, 0, 1, 0], 2);
        const num16 = NBaseInteger.fromDigits([15, 15], 16);
        expect(num2.base).toBe(2);
        expect(num16.base).toBe(16);
      });

      it('should handle single digit', () => {
        const num = NBaseInteger.fromDigits([5], 10);
        expect(num.toString()).toBe('5');
      });

      it('should handle zero', () => {
        const num = NBaseInteger.fromDigits([0], 10);
        expect(num.isZero).toBe(true);
      });
    });

    describe('Error cases', () => {
      it('should throw error when n is not an array', () => {
        expect(() => (NBaseInteger.fromDigits as any)('123', 10)).toThrow(
          "'n' must be an array of digits."
        );
      });

      it('should throw error when negative is not a boolean', () => {
        expect(() => (NBaseInteger.fromDigits as any)([1, 2, 3], 10, 'true')).toThrow(
          "'negative' must be a bool or omitted."
        );
      });

      it('should throw error when base is invalid', () => {
        expect(() => NBaseInteger.fromDigits([1, 2, 3], 1)).toThrow(
          "'base' must be a 2 ~ 1000000 integer."
        );
      });

      it('should throw error when digit is not a safe integer', () => {
        expect(() => NBaseInteger.fromDigits([1, 2.5, 3], 10)).toThrow(
          'The method is not called with a safe integer, got 2.5.'
        );
      });

      it('should throw error when digit is NaN', () => {
        expect(() => NBaseInteger.fromDigits([1, NaN, 3], 10)).toThrow(
          'The method is not called with a safe integer, got NaN.'
        );
      });

      it('should throw error when digit is out of range (negative)', () => {
        expect(() => NBaseInteger.fromDigits([1, -1, 3], 10)).toThrow('Digit -1 should be 1 ~ 9.');
      });

      it('should throw error when digit is out of range (too large)', () => {
        expect(() => NBaseInteger.fromDigits([1, 10, 3], 10)).toThrow('Digit 10 should be 1 ~ 9.');
      });

      it('should throw error when digit equals base', () => {
        expect(() => NBaseInteger.fromDigits([1, 2, 2], 2)).toThrow('Digit 2 should be 1 ~ 1.');
      });
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle emoji charset', () => {
      const emojiCharset = '😀😁😂🤣😃😄😅😆😉😊';
      const num = NBaseInteger('😀😁😀', 10, emojiCharset);
      expect(num.toString(emojiCharset)).toBe('😁😀');
    });

    it('should handle unicode characters, α is 0 and αβα -> βα', () => {
      const unicodeCharset = 'αβγδεζηθικ';
      const num = NBaseInteger('αβα', 10, unicodeCharset);
      expect(num.toString(unicodeCharset)).toBe('βα');
    });

    it('should create large numbers', () => {
      const largeNum = '9'.repeat(100);
      const num = NBaseInteger(largeNum);
      expect(num.toString()).toBe(largeNum);
    });
  });
});
