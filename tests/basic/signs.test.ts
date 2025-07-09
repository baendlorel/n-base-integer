import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';

describe('NBaseInteger signs', () => {
  const base = 10;
  function n(n: number) {
    return NBaseInteger.from(n, base);
  }

  it('negate/negateAssign', () => {
    const a = n(123);
    const b = a.negate();
    expect(a.toString()).toBe('123');
    expect(b.toString()).toBe('-123');
    expect(b.negate().toString()).toBe('123');
    const c = n(-456);
    expect(c.negate().toString()).toBe('456');
    c.negateAssign();
    expect(c.toString()).toBe('456');
    c.negateAssign();
    expect(c.toString()).toBe('-456');
  });

  it('abs/absAssign', () => {
    const a = n(-789);
    expect(a.abs().toString()).toBe('789');
    expect(a.toString()).toBe('-789');
    a.absAssign();
    expect(a.toString()).toBe('789');

    const b = n(321);
    expect(b.abs().toString()).toBe('321');
    b.absAssign();
    expect(b.toString()).toBe('321');
  });

  it('setSign/setSignAssign', () => {
    const a = n(555);
    expect(a.setSign(-1).toString()).toBe('-555');
    expect(a.toString()).toBe('-555');
  });

  it('sgn getter', () => {
    expect(n(123).sgn).toBe(1);
    expect(n(-123).sgn).toBe(-1);
    const zero = n(0);
    expect(zero.sgn).toBe(0);
  });

  it('isOdd', () => {
    const a = NBaseInteger.from(625, 5);
    expect(a.toString()).toBe('10000');
    expect(a.isOdd).toBe(true);

    const b = NBaseInteger.from(25, 5);
    expect(b.toString()).toBe('100');
    expect(b.isOdd).toBe(true);
  });

  it('isEven', () => {
    const a = NBaseInteger.from(620, 5);
    expect(a.isEven).toBe(true);

    const b = NBaseInteger.from(22, 5);
    expect(b.isEven).toBe(true);
  });
});
