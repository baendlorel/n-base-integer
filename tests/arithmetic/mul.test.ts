import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';

describe('NBaseInteger multiply', () => {
  const base = 10;
  function n(n: number) {
    return NBaseInteger.from(n, base);
  }

  it('mul positive', () => {
    expect(n(2).mul(3).toString()).toBe('6');
    expect(n(7).mul(8).toString()).toBe('56');
    expect(n(0).mul(123).toString()).toBe('0');
    expect(n(123).mul(0).toString()).toBe('0');
  });

  it('mul negative', () => {
    expect(n(-2).mul(3).toString()).toBe('-6');
    expect(n(2).mul(-3).toString()).toBe('-6');
    expect(n(-2).mul(-3).toString()).toBe('6');
  });

  it('mul slightly bigger numbers', () => {
    const a = n(45);
    a.mulAssgin(11);
    expect(a.toString()).toBe('495');
  });

  it('mulAssign', () => {
    const a = n(5);
    a.mulAssgin(4);
    expect(a.toString()).toBe('20');
    a.mulAssgin(-2);
    expect(a.toString()).toBe('-40');
    a.mulAssgin(-1);
    expect(a.toString()).toBe('40');
    a.mulAssgin(0);
    expect(a.toString()).toBe('0');
  });

  it('mul with NBaseInteger', () => {
    const a = n(12);
    const b = n(-3);
    expect(a.mul(b).toString()).toBe('-36');
    expect(b.mul(a).toString()).toBe('-36');
    expect(b.mul(b).toString()).toBe('9');
  });

  it('mulAssign with NBaseInteger', () => {
    const a = n(7);
    const b = n(-2);
    a.mulAssgin(b);
    expect(a.toString()).toBe('-14');
    b.mulAssgin(a);
    expect(b.toString()).toBe('28');
  });

  it('mul in other bases', () => {
    const n2 = (x: number) => NBaseInteger.from(x, 2);
    expect(n2(3).mul(2).toString()).toBe('110'); // 3*2=6 in binary
    const n16 = (x: number) => NBaseInteger.from(x, 16);
    expect(n16(15).mul(15).toString()).toBe('E1'); // 15*15=225 in hex
  });
});
