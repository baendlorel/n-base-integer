import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';

describe('NBaseInteger.add', () => {
  it('should add two base-10 numbers correctly', () => {
    const a = NBaseInteger.from(123, 10);
    const b = NBaseInteger.from(456, 10);
    const c = a.add(b);
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
    const a = NBaseInteger.from(5, 2); // 101
    const b = NBaseInteger.from(3, 2); // 11
    const c = a.add(b);
    expect(c.toString(charset)).toBe('1000'); // 8 in binary
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

  it('should add positive and negative numbers correctly', () => {
    const a = NBaseInteger.from(100, 10);
    const b = NBaseInteger.from(-23, 10);
    const c = a.add(b);
    expect(c.toString()).toBe('77');
    expect(a.toString()).toBe('100');
    expect(b.toString()).toBe('-23');
  });

  it('should add negative and positive numbers correctly', () => {
    const a = NBaseInteger.from(-100, 10);
    const b = NBaseInteger.from(44, 10);
    const c = a.add(b);
    expect(c.toString()).toBe('-56');
    expect(a.toString()).toBe('-100');
    expect(b.toString()).toBe('44');
  });

  it('should add two negative numbers correctly', () => {
    const a = NBaseInteger.from(-50, 10);
    const b = NBaseInteger.from(-25, 10);
    const c = a.add(b);
    expect(c.toString()).toBe('-75');
    expect(a.toString()).toBe('-50');
    expect(b.toString()).toBe('-25');
  });

  it('should add zero to a positive number', () => {
    const a = NBaseInteger.from(42, 10);
    const b = NBaseInteger.from(0, 10);
    const c = a.add(b);
    expect(c.toString()).toBe('42');
    expect(a.toString()).toBe('42');
    expect(b.toString()).toBe('0');
  });

  it('should add zero to a negative number', () => {
    const a = NBaseInteger.from(-42, 10);
    const b = NBaseInteger.from(0, 10);
    const c = a.add(b);
    expect(c.toString()).toBe('-42');
    expect(a.toString()).toBe('-42');
    expect(b.toString()).toBe('0');
  });
});
