import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';

describe('Base Conversion Tests', () => {
  describe('convertTo() method', () => {
    it('convert from base 10 to base 2', () => {
      const num = NBaseInteger('123', 10);
      const binary = num.convertTo(2);
      expect(binary.base).toBe(2);
      expect(binary.toString()).toBe('1111011');
    });

    it('convert from base 10 to base 16', () => {
      const num = NBaseInteger('255', 10);
      const hex = num.convertTo(16);
      expect(hex.base).toBe(16);
      expect(hex.toString()).toBe('FF');
    });

    it('convert from base 2 to base 10', () => {
      const binary = NBaseInteger('1111011', 2);
      const decimal = binary.convertTo(10);
      expect(decimal.base).toBe(10);
      expect(decimal.toString()).toBe('123');
    });

    it('convert from base 16 to base 10', () => {
      const hex = NBaseInteger('FF', 16);
      const decimal = hex.convertTo(10);
      expect(decimal.base).toBe(10);
      expect(decimal.toString()).toBe('255');
    });

    it('convert from base 8 to base 16', () => {
      const octal = NBaseInteger('377', 8);
      const hex = octal.convertTo(16);
      expect(hex.base).toBe(16);
      expect(hex.toString()).toBe('FF');
    });

    it('convert zero between different bases', () => {
      const zero10 = NBaseInteger('0', 10);
      const zero2 = zero10.convertTo(2);
      const zero16 = zero10.convertTo(16);

      expect(zero2.toString()).toBe('0');
      expect(zero16.toString()).toBe('0');
      expect(zero2.isZero).toBe(true);
      expect(zero16.isZero).toBe(true);
    });

    it('convert negative numbers between bases', () => {
      const negNum = NBaseInteger('-123', 10);
      const negBinary = negNum.convertTo(2);
      const negHex = negNum.convertTo(16);

      expect(negBinary.toString()).toBe('-1111011');
      expect(negHex.toString()).toBe('-7B');
      expect(negBinary.sgn).toBe(-1);
      expect(negHex.sgn).toBe(-1);
    });

    it('convert large numbers between bases', () => {
      const large = NBaseInteger('123456789', 10);
      const largeBinary = large.convertTo(2);
      const largeHex = large.convertTo(16);

      // Convert back to verify
      const backToDecimal1 = largeBinary.convertTo(10);
      const backToDecimal2 = largeHex.convertTo(10);

      expect(backToDecimal1.toString()).toBe('123456789');
      expect(backToDecimal2.toString()).toBe('123456789');
    });

    it('convert to same base should return equivalent number', () => {
      const num = NBaseInteger('123', 10);
      const sameBase = num.convertTo(10);

      expect(sameBase.toString()).toBe('123');
      expect(sameBase.base).toBe(10);
      expect(sameBase.eq(num)).toBe(true);
    });

    it('convert with custom high bases', () => {
      // const c = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
      const num = NBaseInteger('HELLO', 32, c);
      const converted = num.convertTo(10);

      // Convert back to verify
      const backTo32 = converted.convertTo(32);
      expect(backTo32.toString(c)).toBe('HELLO');
    });

    it('convert throws error for invalid base', () => {
      const num = NBaseInteger('123', 10);

      expect(() => num.convertTo(1)).toThrow();
      expect(() => num.convertTo(0)).toThrow();
      expect(() => num.convertTo(-1)).toThrow();
      expect(() => num.convertTo(1.5)).toThrow();
      expect(() => num.convertTo(Number.MAX_SAFE_INTEGER + 1)).toThrow();
    });
  });

  describe('toString() with different charsets', () => {
    it('toString() with default charset', () => {
      const num = NBaseInteger('123', 10);
      expect(num.toString()).toBe('123');

      const hex = NBaseInteger('255', 10);
      const hexConverted = hex.convertTo(16);
      expect(hexConverted.toString()).toBe('FF');
    });

    it('toString() with null returns comma-separated digits', () => {
      const num = NBaseInteger('123', 10);
      expect(num.toString(null)).toBe('1,2,3');

      const binary = NBaseInteger('1111011', 2);
      expect(binary.toString(null)).toBe('1,1,1,1,0,1,1');
    });

    it('toString() with custom charset', () => {
      const num = NBaseInteger('123', 10);
      const customCharset = 'ABCDEFGHIJ';
      expect(num.toString(customCharset)).toBe('BCD');

      // Test with emojis
      const emojiCharset = '😀😃😄😁😆😅😂🤣😊😇';
      expect(num.toString(emojiCharset)).toBe('😃😄😁');
    });

    it('toString() falls back to comma-separated when base > default charset length', () => {
      // Create a number with base higher than default charset
      const num = NBaseInteger.fromDigits([1, 2, 3], 100);
      expect(num.toString()).toBe('1,2,3');
    });

    it('toString() throws error for invalid charset', () => {
      const num = NBaseInteger('123', 10);

      expect(() => num.toString(123 as any)).toThrow();
      expect(() => num.toString([] as any)).toThrow();
      expect(() => num.toString({} as any)).toThrow();
    });

    it('toString() with charset containing invalid characters', () => {
      const num = NBaseInteger('12', 3);

      // Test various invalid characters
      expect(() => num.toString('01-')).toThrow(); // dash
      expect(() => num.toString('01.')).toThrow(); // dot
      expect(() => num.toString('01 ')).toThrow(); // space
      expect(() => num.toString('010')).toThrow(); // duplicate
      expect(() => num.toString('01\n')).toThrow(); // control character
    });

    it('toString() with charset too short for base', () => {
      const num = NBaseInteger('123', 10);

      expect(() => num.toString('0123456')).toThrow(); // only 7 chars for base 10
    });
  });

  describe('Cross-base operations', () => {
    it('numbers with different bases should be equal after conversion', () => {
      const decimal = NBaseInteger('255', 10);
      const hex = NBaseInteger('FF', 16);
      const binary = NBaseInteger('11111111', 2);
      const octal = NBaseInteger('377', 8);

      // Convert all to base 10 for comparison
      const hexTo10 = hex.convertTo(10);
      const binaryTo10 = binary.convertTo(10);
      const octalTo10 = octal.convertTo(10);

      expect(decimal.eq(hexTo10)).toBe(true);
      expect(decimal.eq(binaryTo10)).toBe(true);
      expect(decimal.eq(octalTo10)).toBe(true);
    });

    it('arithmetic operations preserve value across base conversions', () => {
      const a = NBaseInteger('123', 10);
      const b = NBaseInteger('456', 10);
      const sum10 = a.add(b);

      // Convert to different bases and perform same operation
      const a2 = a.convertTo(2);
      const b2 = b.convertTo(2);
      const sum2 = a2.add(b2);

      const a16 = a.convertTo(16);
      const b16 = b.convertTo(16);
      const sum16 = a16.add(b16);

      // Convert results back to base 10
      const sum2To10 = sum2.convertTo(10);
      const sum16To10 = sum16.convertTo(10);

      expect(sum10.eq(sum2To10)).toBe(true);
      expect(sum10.eq(sum16To10)).toBe(true);
    });

    it('chain conversions should preserve value', () => {
      const original = NBaseInteger('123456', 10);

      const result = original.convertTo(2).convertTo(16).convertTo(8).convertTo(32).convertTo(10);

      expect(original.eq(result)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('convert single digit numbers', () => {
      for (let i = 0; i < 10; i++) {
        const num = NBaseInteger(i.toString(), 10);
        const binary = num.convertTo(2);
        const hex = num.convertTo(16);

        // Convert back to verify
        expect(binary.convertTo(10).toString()).toBe(i.toString());
        expect(hex.convertTo(10).toString()).toBe(i.toString());
      }
    });

    it('convert between adjacent bases', () => {
      const num = NBaseInteger('123', 10);
      const base11 = num.convertTo(11);
      const base9 = num.convertTo(9);

      expect(base11.convertTo(10).toString()).toBe('123');
      expect(base9.convertTo(10).toString()).toBe('123');
    });

    it('convert with very high bases', () => {
      const charset = Array.from({ length: 62 }, (_, i) => {
        if (i < 10) return i.toString();
        if (i < 36) return String.fromCharCode(65 + i - 10);
        return String.fromCharCode(97 + i - 36);
      }).join('');

      const num = NBaseInteger('123', 10);
      const base62 = num.convertTo(62);

      expect(base62.convertTo(10).toString()).toBe('123');
    });
  });

  describe('Symbol.toPrimitive', () => {
    it('number hint returns decimal value', () => {
      const binary = NBaseInteger('1111011', 2);
      expect(binary.toNumber()).toBe(123);
      expect(+binary).toBe(123);
    });

    it('string hint returns string representation', () => {
      const num = NBaseInteger('123', 10);
      expect(String(num)).toBe('123');
      expect(`${num}`).toBe('123');
    });

    it('default hint returns string representation', () => {
      const num = NBaseInteger('123', 10);
      expect(num + '').toBe('123');
    });
  });
});
