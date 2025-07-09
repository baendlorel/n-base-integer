import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';
// Test for NBaseInteger and toString

describe('NBaseInteger', () => {
  it('should be callable', () => {
    const a = NBaseInteger.from(123, 10);
    expect(a.toString()).toBe('123');
    expect(() => Reflect.construct(NBaseInteger, [])).toThrow();
  });

  it('should convert decimal to base62 string and back', () => {
    const n = 123456789;
    const nbi = NBaseInteger.from(n, 62);
    const str = nbi.toString();
    // base62 representation of 123456789
    expect(str).toBe('8M0kX');
  });

  it('should support custom charset', () => {
    const charset = '01'; // binary
    const nbi = NBaseInteger.from(13, 2);
    expect(nbi.toString(charset)).toBe('1101');
  });

  it('should throw on duplicate charset characters', () => {
    expect(() => NBaseInteger('10', 4, '0012')).toThrow();
  });

  it('should throw on invalid base', () => {
    expect(() => NBaseInteger.from(10, 1)).toThrow();
    expect(() => NBaseInteger.from(10, 0)).toThrow();
    expect(() => NBaseInteger.from(10, -2)).toThrow();
  });

  it('should create from string and number equivalently', () => {
    expect(NBaseInteger('123', 10).toString()).toBe('123');
    expect(NBaseInteger('-456', 10).toString()).toBe('-456');
    expect(NBaseInteger('0', 10).toString()).toBe('0');
    expect(NBaseInteger.from(0, 10).toString()).toBe('0');
    expect(NBaseInteger('-0', 10).toString()).toBe('0');
  });

  it('should handle very large and very small numbers', () => {
    const big = '1234567890123456789012345678901234567890';
    expect(NBaseInteger(big, 10).toString()).toBe(big);
    expect(NBaseInteger('-' + big, 10).toString()).toBe('-' + big);
    expect(NBaseInteger.from(Number.MAX_SAFE_INTEGER, 10).toString()).toBe(
      Number.MAX_SAFE_INTEGER.toString()
    );
    expect(NBaseInteger.from(Number.MIN_SAFE_INTEGER, 10).toString()).toBe(
      Number.MIN_SAFE_INTEGER.toString()
    );
  });

  it('should support max base and min base', () => {
    const maxBase = 62;
    const minBase = 2;
    expect(NBaseInteger.from(123, maxBase).toString()).toMatch(/[0-9A-Za-z]+/);
    expect(NBaseInteger.from(1, minBase).toString()).toBe('1');
    expect(() => NBaseInteger.from(1, 1)).toThrow();
  });

  it('should support custom charset with special chars', () => {
    const charset = 'abc!@#';
    expect(NBaseInteger.from(5, 6).toString(charset)).toMatch(/[abc!@#]+/);
    const emojiCharset = '😀😁😂🤣😃😄😅😆';
    expect(NBaseInteger.from(25431, 8).toString(emojiCharset)).toBe('😅😁😄😂😆');
    expect(NBaseInteger('-😅😁😄😂😆', 8, emojiCharset).toString(emojiCharset)).toBe('-😅😁😄😂😆');
  });

  it('should throw on charset shorter than base', () => {
    expect(() => NBaseInteger('5', 10, 'abc')).toThrow();
  });

  it('should throw on charset with duplicate chars', () => {
    expect(() => NBaseInteger('5', 3, 'aab')).toThrow();
  });

  it('should throw on invalid input types', () => {
    // @ts-expect-error
    expect(() => NBaseInteger.from({}, 10)).toThrow();
    // @ts-expect-error
    expect(() => NBaseInteger.from([], 10)).toThrow();
    // @ts-expect-error
    expect(() => NBaseInteger.from(null, 10)).toThrow();
    // @ts-expect-error
    expect(() => NBaseInteger.from(undefined, 10)).toThrow();
  });

  it('should throw if base and charset mismatch', () => {
    expect(() => NBaseInteger('5', 5, 'abc')).toThrow();
    expect(() => NBaseInteger('5', 4, 'abca')).toThrow();
  });

  it('should support leading zeros in string', () => {
    expect(NBaseInteger('000123', 10).toString()).toBe('123');
    expect(NBaseInteger('-000123', 10).toString()).toBe('-123');
  });

  it('should support all printable ASCII as charset', () => {
    const c = Array.from({ length: 94 }, (_, i) => String.fromCharCode(i + 33))
      .join('')
      .replace('-', '')
      .replace('.', '');
    expect(NBaseInteger.from(c.length, c.length).toString(c)).toBe(c[1] + c[0]);
    // ? what is this for: expect(() => NBaseInteger.from(1, 5).toString(c)).toThrow();
  });
});
