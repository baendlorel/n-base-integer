import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '../src/n-base/integer';

// Test for NBaseInteger.from and toString

describe('NBaseInteger', () => {
  it('should convert decimal to base62 string and back', () => {
    const n = 123456789;
    const nbi = NBaseInteger.from(n, 62);
    const str = nbi.toString();
    // base62 representation of 123456789
    expect(str).toBe('8M0kX');
  });

  it('should support custom charset', () => {
    const charset = '01'; // binary
    const n = 13;
    const nbi = NBaseInteger.from(n, charset);
    expect(nbi.toString()).toBe('1101');
  });

  it('should throw on duplicate charset characters', () => {
    expect(() => NBaseInteger.from(10, '0012')).toThrow();
  });

  it('should throw on invalid base', () => {
    expect(() => NBaseInteger.from(10, 1)).toThrow();
    expect(() => NBaseInteger.from(10, 0)).toThrow();
    expect(() => NBaseInteger.from(10, -2)).toThrow();
  });
});
