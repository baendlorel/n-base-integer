import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '../src/n-base/integer';

describe('NBaseInteger.pow', () => {
  const base = 10;

  it('should return 1 for any number to the power of 0', () => {
    const a = NBaseInteger.from(12345, base);
    const b = NBaseInteger.from(0, base);
    expect(NBaseInteger.pow(a, b).toString()).toBe('1');
  });

  it('should return the number itself for power 1', () => {
    const a = NBaseInteger.from(678, base);
    const b = NBaseInteger.from(1, base);
    expect(NBaseInteger.pow(a, b).toString()).toBe('678');
  });

  it('should compute small integer powers', () => {
    const a = NBaseInteger.from(2, base);
    const b = NBaseInteger.from(10, base);
    expect(NBaseInteger.pow(a, b).toString()).toBe('1024');
  });

  it('should compute negative base with even/odd exponent', () => {
    const a = NBaseInteger.from(-2, base);
    const b = NBaseInteger.from(3, base);
    expect(NBaseInteger.pow(a, b).toString()).toBe('-8');
    const c = NBaseInteger.from(4, base);
    expect(NBaseInteger.pow(a, c).toString()).toBe('16');
  });

  it('should throw for negative exponent', () => {
    const a = NBaseInteger.from(2, base);
    const b = NBaseInteger.from(-3, base);
    expect(() => NBaseInteger.pow(a, b)).toThrow();
  });

  it('should work for base 16', () => {
    const a = NBaseInteger.from(0xf, 16); // 15
    const b = NBaseInteger.from(2, 16);
    expect(NBaseInteger.pow(a, b).toString().toUpperCase()).toBe('E1'); // 15^2=225
  });

  it('should work for custom charset', () => {
    const a = NBaseInteger.from(2, 'abc'); // base 3, '2'
    const b = NBaseInteger.from(3, 'abc'); // base 3, '10'
    expect(NBaseInteger.pow(a, b).toString()).toBe('bb'); // 2^3=8, base3: '22'
  });

  it('should handle 0^0 as 1 (convention)', () => {
    const a = NBaseInteger.from(0, base);
    const b = NBaseInteger.from(0, base);
    expect(NBaseInteger.pow(a, b).toString()).toBe('1');
  });

  it('should handle 0^n as 0 for n>0', () => {
    const a = NBaseInteger.from(0, base);
    const b = NBaseInteger.from(5, base);
    expect(NBaseInteger.pow(a, b).toString()).toBe('0');
  });

  it('should handle n^0 as 1 for negative n', () => {
    const a = NBaseInteger.from(-123, base);
    const b = NBaseInteger.from(0, base);
    expect(NBaseInteger.pow(a, b).toString()).toBe('1');
  });

  it('should handle large exponents (small base)', () => {
    const a = NBaseInteger.from(2, base);
    const b = NBaseInteger.from(20, base);
    expect(NBaseInteger.pow(a, b).toString()).toBe('1048576');
  });

  it('should handle large base and exponent', () => {
    const a = NBaseInteger.from(99, base);
    const b = NBaseInteger.from(5, base);
    expect(NBaseInteger.pow(a, b).toString()).toBe((99 ** 5).toString());
  });

  it('should handle negative base and large odd exponent', () => {
    const a = NBaseInteger.from(-3, base);
    const b = NBaseInteger.from(7, base);
    expect(NBaseInteger.pow(a, b).toString()).toBe((-(3 ** 7)).toString());
  });

  it('should handle negative base and large even exponent', () => {
    const a = NBaseInteger.from(-3, base);
    const b = NBaseInteger.from(8, base);
    expect(NBaseInteger.pow(a, b).toString()).toBe((3 ** 8).toString());
  });

  it('should work for base 2 (binary)', () => {
    const a = NBaseInteger.from(2, 2);
    const b = NBaseInteger.from(8, 2);
    expect(NBaseInteger.pow(a, b).toString()).toBe('100000000'); // 2^8 = 256
  });

  it('should work for base 36 (alphanumeric)', () => {
    const a = NBaseInteger.from(35, 36);
    const b = NBaseInteger.from(2, 36);
    expect(NBaseInteger.pow(a, b).toString().toUpperCase()).toBe('Y1'); // 35^2 = 1225
  });

  it('should work for custom charset (base 5)', () => {
    const charset = 'abcde';
    const a = NBaseInteger.from(4, charset); // '4'
    const b = NBaseInteger.from(3, charset); // '3'
    expect(NBaseInteger.pow(a, b).toString()).toBe('31'); // 4^3=64, base5: '31'
  });

  it('should throw for negative exponent (again)', () => {
    const a = NBaseInteger.from(5, base);
    const b = NBaseInteger.from(-1, base);
    expect(() => NBaseInteger.pow(a, b)).toThrow();
  });
});
