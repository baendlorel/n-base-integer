import { describe, it, expect, xit } from '@jest/globals';
import { NBaseInteger } from '@/index';
// import { powMontgomeryLadder } from '@/n-base/large-handler';

describe('NBaseInteger hardcore add/mul', () => {
  const customCharset = 'abc'; // base 3

  it('add: very large numbers', () => {
    const big = Math.floor(Number.MAX_SAFE_INTEGER / 2);
    const a = NBaseInteger.from(big, 10);
    const b = NBaseInteger.from(big, 10);
    const sum = a.add(b);
    expect(sum.toString()).toBe((big * 2).toString());
  });

  it('add: different signs, same abs', () => {
    const a = NBaseInteger.from(123456789, 10);
    const b = NBaseInteger.from(-123456789, 10);
    expect(a.add(b).toString()).toBe('0');
    expect(b.add(a).toString()).toBe('0');
  });

  it('add: positive + negative, abs(b) > abs(a)', () => {
    const a = NBaseInteger.from(100, 10);
    const b = NBaseInteger.from(-200, 10);
    expect(a.add(b).toString()).toBe('-100');
    expect(b.add(a).toString()).toBe('-100');
  });

  it('add: base 2, carry over', () => {
    const a = NBaseInteger.from(0b1111, 2); // 15
    const b = NBaseInteger.from(0b1, 2); // 1
    expect(a.add(b).toString()).toBe('10000'); // 16 in binary
  });

  it('add: base 16, with letters', () => {
    const a = NBaseInteger.from(0xff, 16); // 255
    const b = NBaseInteger.from(0x1, 16); // 1
    expect(a.add(b).toString().toUpperCase()).toBe('100');
  });

  it('add: custom charset', () => {
    {
      const a = NBaseInteger.from(5, 3); // base 3, 5 = '12'
      const b = NBaseInteger.from(7, 3); // base 3, 7 = '21'
      expect(a.add(b).toString('012')).toBe('110'); // 5+7=12, base3: '110'
    }
    {
      const a = NBaseInteger.from(5, 3); // base 3, 5 = '12'
      const b = NBaseInteger.from(7, 3); // base 3, 7 = '21'
      expect(a.add(b).toString('abc')).toBe('bba'); // 5+7=12, base3: '110'
    }
  });

  it('mul: very large numbers', () => {
    const a = NBaseInteger.from(12345678, 10);
    const b = NBaseInteger.from(87654321, 10);
    const prod = a.mul(b);
    expect(prod.toString()).toBe((12345678 * 87654321).toString());
  });

  it('mul: negative * positive', () => {
    const a = NBaseInteger.from(678, 10);
    const b = NBaseInteger.from(-12345, 10);
    expect(a.mul(b).toString()).toBe((-12345 * 678).toString());
  });

  it('mul: negative * negative', () => {
    const a = NBaseInteger.from(-12, 10);
    const b = NBaseInteger.from(-34, 10);
    expect(a.mul(b).toString()).toBe((12 * 34).toString());
  });

  it('mul: base 2, overflow', () => {
    const a = NBaseInteger.from(0b1011, 2); // 11
    const b = NBaseInteger.from(0b110, 2); // 6
    expect(a.mul(b).toString()).toBe('1000010'); // 66 in binary
  });

  it('mul: base 16, with letters', () => {
    const a = NBaseInteger.from(0xa, 16); // 10
    const b = NBaseInteger.from(0xb, 16); // 11
    expect(a.mul(b).toString().toUpperCase()).toBe('6E'); // 110 in hex
  });

  it('mul: custom charset', () => {
    const a = NBaseInteger('c', 3, customCharset); // '2'
    const b = NBaseInteger('c', 3, customCharset); // '2'
    expect(a.mul(b).toString(customCharset)).toBe('bb'); // 2*2=4, base3: '11'
  });

  it('mul: zero edge', () => {
    const a = NBaseInteger.from(0, 10);
    const b = NBaseInteger.from(99999, 10);
    expect(a.mul(b).toString()).toBe('0');
    expect(b.mul(a).toString()).toBe('0');
  });

  it('mul: one edge', () => {
    const a = NBaseInteger.from(1, 10);
    const b = NBaseInteger.from(12345, 10);
    expect(a.mul(b).toString()).toBe('12345');
    expect(b.mul(a).toString()).toBe('12345');
  });

  it('mul: large number', () => {
    const n = '999999999999999999999999999999';
    const huge = NBaseInteger(n);
    const result = huge.mul(huge); // Still works perfectly
    expect(result.toString()).toMatch(new RegExp(`^[9]{${n.length - 1}}8[0]{${n.length - 1}}1$`));
  });

  it('mul: large number power', () => {
    const n = '900';
    const huge = NBaseInteger(n);
    const result = huge.pow(huge);
  });
});
