import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '../src/n-base-integer';

describe('NBaseInteger.add', () => {
  it('should add two base-10 numbers correctly', () => {
    const a = NBaseInteger.from(123, 10);
    const b = NBaseInteger.from(456, 10);
    const c = a.add(b);
    console.log('a', a.tenBaseDigits, 'b', b.tenBaseDigits);

    expect(c.toString()).toBe('579');
    // Ensure immutability
    expect(a.toString()).toBe('123');
    expect(b.toString()).toBe('456');
  });

  it('should add a number to a NBaseInteger', () => {
    const a = NBaseInteger.from(100, 10);
    const c = a.add(23);
    expect(c.toString()).toBe('123');
    expect(a.toString()).toBe('100');
  });

  it('should add in custom base (base-2)', () => {
    const charset = '01';
    const a = NBaseInteger.from(5, charset); // 101
    const b = NBaseInteger.from(3, charset); // 11
    const c = a.add(b);
    expect(c.toString()).toBe('1000'); // 8 in binary
  });

  it('should throw if bases are different', () => {
    const a = NBaseInteger.from(10, 10);
    const b = NBaseInteger.from(10, 2);
    expect(() => a.add(b)).toThrow();
  });

  it('should throw if argument is not number or NBaseInteger', () => {
    const a = NBaseInteger.from(1, 10);
    // @ts-expect-error
    expect(() => a.add('not a number')).toThrow();
  });
});
