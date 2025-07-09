import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';

describe('NBaseInteger increment/decrement', () => {
  const base = 10;

  it('should increment positive numbers', () => {
    const a = NBaseInteger.from(0, base);
    a.addAssign(1);
    expect(a.toString()).toBe('1');
    a.addAssign(1);
    expect(a.toString()).toBe('2');
  });

  it('should decrement positive numbers', () => {
    const a = NBaseInteger.from(2, base);
    a.addAssign(-1);
    expect(a.toString()).toBe('1');
    a.addAssign(-1);
    expect(a.toString()).toBe('0');
  });

  it('should increment negative numbers', () => {
    const a = NBaseInteger.from(-2, base);
    a.addAssign(1);
    expect(a.toString()).toBe('-1');
    a.addAssign(1);
    expect(a.toString()).toBe('0');
  });

  it('should decrement negative numbers', () => {
    const a = NBaseInteger.from(-1, base);
    a.addAssign(-1);
    expect(a.toString()).toBe('-2');
    a.addAssign(-1);
    expect(a.toString()).toBe('-3');
  });

  it('should increment and decrement across zero', () => {
    const a = NBaseInteger.from(0, base);
    a.addAssign(-1);
    expect(a.toString()).toBe('-1');
    a.addAssign(2);
    expect(a.toString()).toBe('1');
    a.addAssign(-2);
    expect(a.toString()).toBe('-1');
  });

  it('should work for other bases', () => {
    const a = NBaseInteger.from(0, 2);
    a.addAssign(1);
    expect(a.toString()).toBe('1');
    a.addAssign(1);
    expect(a.toString()).toBe('10');
    a.addAssign(-2);
    expect(a.toString()).toBe('0');
  });
});
