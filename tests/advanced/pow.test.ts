import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';

describe('NBaseInteger.pow', () => {
  const base = 10;

  it('should return 1 for any number to the power of 0', () => {
    const a = NBaseInteger.from(12345, base);
    const b = NBaseInteger.from(0, base);
    expect(a.pow(b).toString()).toBe('1');
  });

  it('should return the number itself for power 1', () => {
    const a = NBaseInteger.from(678, base);
    const b = NBaseInteger.from(1, base);
    expect(a.pow(b).toString()).toBe('678');
  });

  it('should compute small integer powers', () => {
    const a = NBaseInteger.from(2, base);
    const b = NBaseInteger.from(10, base);
    expect(a.pow(b).toString()).toBe('1024');
  });

  it('should compute negative base with even/odd exponent', () => {
    const a = NBaseInteger.from(-2, base);
    const b = NBaseInteger.from(3, base);
    expect(a.pow(b).toString()).toBe('-8');
    const c = NBaseInteger.from(4, base);
    expect(a.pow(c).toString()).toBe('16');
  });

  it('should throw for negative exponent', () => {
    const a = NBaseInteger.from(2, base);
    const b = NBaseInteger.from(-3, base);
    expect(() => a.pow(b)).toThrow();
  });

  it('should work for base 16', () => {
    const a = NBaseInteger.from(0xf, 16); // 15
    const b = NBaseInteger.from(2, 16);
    expect(a.pow(b).toString().toUpperCase()).toBe('E1'); // 15^2=225
  });

  it('should work for custom charset', () => {
    const a = NBaseInteger.from(2, 3); // base 3, '2'
    const b = NBaseInteger.from(3, 3); // base 3, '10'
    expect(a.pow(b).toString('abc')).toBe('cc'); // 2^3=8, base3: '22'
  });

  it('should handle 0^0 as 1 (convention)', () => {
    const a = NBaseInteger.from(0, base);
    const b = NBaseInteger.from(0, base);
    expect(a.pow(b).toString()).toBe('1');
  });

  it('should handle 0^n as 0 for n>0', () => {
    const a = NBaseInteger.from(0, base);
    const b = NBaseInteger.from(5, base);
    expect(a.pow(b).toString()).toBe('0');
  });

  it('should handle n^0 as 1 for negative n', () => {
    const a = NBaseInteger.from(-123, base);
    const b = NBaseInteger.from(0, base);
    expect(a.pow(b).toString()).toBe('1');
  });

  it('should handle large exponents (small base)', () => {
    const a = NBaseInteger.from(2, base);
    const b = NBaseInteger.from(20, base);
    expect(a.pow(b).toString()).toBe('1048576');
  });

  it('should handle large base and exponent', () => {
    const a = NBaseInteger.from(99, base);
    const b = NBaseInteger.from(5, base);
    expect(a.pow(b).toString()).toBe((99 ** 5).toString());
  });

  it('should handle negative base and large odd exponent', () => {
    const a = NBaseInteger.from(-3, base);
    const b = NBaseInteger.from(7, base);
    expect(a.pow(b).toString()).toBe((-(3 ** 7)).toString());
  });

  it('should handle negative base and large even exponent', () => {
    const a = NBaseInteger.from(-3, base);
    const b = NBaseInteger.from(8, base);
    expect(a.pow(b).toString()).toBe((3 ** 8).toString());
  });

  it('should work for base 2 (binary)', () => {
    const a = NBaseInteger.from(2, 2);
    const b = NBaseInteger.from(8, 2);
    expect(a.pow(b).toString()).toBe('100000000'); // 2^8 = 256
  });

  it('should work for base 36 (alphanumeric)', () => {
    const a = NBaseInteger.from(35, 36);
    const b = NBaseInteger.from(2, 36);
    expect(a.pow(b).toString().toUpperCase()).toBe('Y1'); // 35^2 = 1225
  });

  it('should work for custom charset (base 5)', () => {
    const charset = '01234';
    const a = NBaseInteger.from(4, 5); // '4'
    const b = NBaseInteger.from(6, 5); // '6'
    expect(a.pow(b).toString(charset)).toBe('112341'); //
  });

  it('should throw for negative exponent (again)', () => {
    const a = NBaseInteger.from(5, base);
    const b = NBaseInteger.from(-1, base);
    expect(() => a.pow(b)).toThrow();
  });

  it('should support pow(number) and pow(NBaseInteger) equivalence', () => {
    const a = NBaseInteger.from(7, 10);
    expect(a.pow(3).toString()).toBe(a.pow(NBaseInteger.from(3, 10)).toString());
    expect(a.pow(0).toString()).toBe('1');
    expect(a.pow(1).toString()).toBe('7');
    expect(a.pow(2).toString()).toBe('49');
  });

  it('should support pow(number) for negative base', () => {
    const a = NBaseInteger.from(-2, 10);
    expect(a.pow(3).toString()).toBe('-8');
    expect(a.pow(4).toString()).toBe('16');
  });

  it('should support pow(number) for zero and one', () => {
    const a = NBaseInteger.from(0, 10);
    expect(a.pow(0).toString()).toBe('1');
    expect(a.pow(5).toString()).toBe('0');
    const b = NBaseInteger.from(1, 10);
    expect(b.pow(100).toString()).toBe('1');
  });

  it('should support pow(number) for custom charset', () => {
    const a = NBaseInteger.from(2, 3);
    expect(a.pow(3).toString('abc')).toBe('cc');
    expect(a.pow(0).toString('abc')).toBe('b');
  });

  it('should throw for negative number exponent', () => {
    const a = NBaseInteger.from(2, 10);
    expect(() => a.pow(-1)).toThrow();
  });

  it('should support pow(NBaseInteger) for large exponents', () => {
    const a = NBaseInteger.from(2, 10);
    const b = NBaseInteger.from(16, 10);
    expect(a.pow(b).toString()).toBe('65536');
  });

  it('should support pow(NBaseInteger) for base 2', () => {
    const a = NBaseInteger.from(2, 2);
    const b = NBaseInteger.from(5, 2);
    expect(a.pow(b).toString()).toBe('100000'); // 2^5=32
  });

  it('should throw for pow(number) with negative exponent', () => {
    const a = NBaseInteger.from(3, 10);
    expect(() => a.pow(-5)).toThrow();
  });
});
