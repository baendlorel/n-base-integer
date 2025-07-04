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
    expect(NBaseInteger.pow(a, b).toString()).toBe('22'); // 2^3=8, base3: '22'
  });
});
