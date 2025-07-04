import { describe, test, expect, it } from '@jest/globals';
import { NBaseInteger } from '../src/n-base/integer';

describe('NBaseInteger signs', () => {
  const base = 10;
  function n(n: number) {
    return NBaseInteger.from(n, base);
  }

  it('opp/oppAssign', () => {
    const a = n(123);
    const b = a.opp();
    expect(a.toString()).toBe('123');
    expect(b.toString()).toBe('-123');
    expect(b.opp().toString()).toBe('123');
    const c = n(-456);
    expect(c.opp().toString()).toBe('456');
    c.oppAssign();
    expect(c.toString()).toBe('456');
    c.oppAssign();
    expect(c.toString()).toBe('-456');
  });

  it('neg/negAssign', () => {
    const a = n(789);
    expect(a.neg().toString()).toBe('-789');
    expect(a.toString()).toBe('789');
    const b = n(-321);
    expect(b.neg().toString()).toBe('-321');
    b.negAssign();
    expect(b.toString()).toBe('-321');
    a.negAssign();
    expect(a.toString()).toBe('-789');
  });

  it('pos/posAssign', () => {
    const a = n(-555);
    expect(a.pos().toString()).toBe('555');
    expect(a.toString()).toBe('-555');
    a.posAssign();
    expect(a.toString()).toBe('555');
    const b = n(0);
    expect(b.pos().toString()).toBe('0');
    b.negAssign();
    expect(b.toString()).toBe('-0');
    b.posAssign();
    expect(b.toString()).toBe('0');
  });

  it('sign getter', () => {
    expect(n(123).sign).toBe(1);
    expect(n(-123).sign).toBe(-1);
    const a = n(0);
    expect(a.sign).toBe(1);
    a.negAssign();
    expect(a.sign).toBe(-1);
    a.posAssign();
    expect(a.sign).toBe(1);
  });

  it('isOdd', () => {
    const a = NBaseInteger.from(6, 5);
    expect(a.toString()).toBe('11');
    expect(a.isOdd).toBe(false);
  });
});
