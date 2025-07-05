import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';

describe('NBaseInteger.sub', () => {
  it('should subtract two positive numbers', () => {
    const a = NBaseInteger.from(123, 10);
    const b = NBaseInteger.from(23, 10);
    const c = a.sub(b);
    expect(c.toString()).toBe('100');
    expect(a.toString()).toBe('123');
    expect(b.toString()).toBe('23');
  });

  it('should subtract a negative number from a positive number', () => {
    const a = NBaseInteger.from(50, 10);
    const b = NBaseInteger.from(-20, 10);
    const c = a.sub(b);
    expect(c.toString()).toBe('70');
    expect(a.toString()).toBe('50');
    expect(b.toString()).toBe('-20');
  });

  it('should subtract a positive number from a negative number', () => {
    const a = NBaseInteger.from(-50, 10);
    const b = NBaseInteger.from(20, 10);
    const c = a.sub(b);
    expect(c.toString()).toBe('-70');
    expect(a.toString()).toBe('-50');
    expect(b.toString()).toBe('20');
  });

  it('should subtract two negative numbers', () => {
    const a = NBaseInteger.from(-50, 10);
    const b = NBaseInteger.from(-20, 10);
    const c = a.sub(b);
    expect(c.toString()).toBe('-30');
    expect(a.toString()).toBe('-50');
    expect(b.toString()).toBe('-20');
  });

  it('should subtract zero', () => {
    const a = NBaseInteger.from(42, 10);
    const b = NBaseInteger.from(0, 10);
    const c = a.sub(b);
    expect(c.toString()).toBe('42');
    expect(a.toString()).toBe('42');
    expect(b.toString()).toBe('0');
  });

  it('should subtract from zero', () => {
    const a = NBaseInteger.from(0, 10);
    const b = NBaseInteger.from(42, 10);
    const c = a.sub(b);
    expect(c.toString()).toBe('-42');
    expect(a.toString()).toBe('0');
    expect(b.toString()).toBe('42');
  });

  it('should throw if bases are different', () => {
    const a = NBaseInteger.from(10, 10);
    const b = NBaseInteger.from(10, 2);
    expect(() => a.sub(b)).toThrow();
  });

  it('should throw if argument is not number or NBaseInteger', () => {
    const a = NBaseInteger.from(1, 10);
    // @ts-expect-error
    expect(() => a.sub('not a number')).toThrow();
  });
});
