import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';

describe('NBaseInteger hardcore add/mul', () => {
  const base10 = 10;
  const base2 = 2;
  const base16 = 16;
  const customCharset = 'abc'; // base 3

  it('add: very large numbers', () => {
    const big = Math.floor(Number.MAX_SAFE_INTEGER / 2);
    const a = NBaseInteger(big, base10);
    const b = NBaseInteger(big, base10);
    const sum = a.add(b);
    expect(sum.toString()).toBe((big * 2).toString());
  });

  it('add: different signs, same abs', () => {
    const a = NBaseInteger(123456789, base10);
    const b = NBaseInteger(-123456789, base10);
    expect(a.add(b).toString()).toBe('0');
    expect(b.add(a).toString()).toBe('0');
  });

  it('add: positive + negative, abs(b) > abs(a)', () => {
    const a = NBaseInteger(100, base10);
    const b = NBaseInteger(-200, base10);
    expect(a.add(b).toString()).toBe('-100');
    expect(b.add(a).toString()).toBe('-100');
  });

  it('add: base 2, carry over', () => {
    const a = NBaseInteger(0b1111, base2); // 15
    const b = NBaseInteger(0b1, base2); // 1
    expect(a.add(b).toString()).toBe('10000'); // 16 in binary
  });

  it('add: base 16, with letters', () => {
    const a = NBaseInteger(0xff, base16); // 255
    const b = NBaseInteger(0x1, base16); // 1
    expect(a.add(b).toString().toUpperCase()).toBe('100');
  });

  it('add: custom charset', () => {
    {
      const a = NBaseInteger(5, 3, '012'); // base 3, 5 = '12'
      const b = NBaseInteger(7, 3, '012'); // base 3, 7 = '21'
      expect(a.add(b).toString()).toBe('110'); // 5+7=12, base3: '110'
    }
    {
      const a = NBaseInteger(5, 3, 'abc'); // base 3, 5 = '12'
      const b = NBaseInteger(7, 3, 'abc'); // base 3, 7 = '21'
      expect(a.add(b).toString()).toBe('bba'); // 5+7=12, base3: '110'
    }
  });

  it('mul: very large numbers', () => {
    const a = NBaseInteger(12345678, base10);
    const b = NBaseInteger(87654321, base10);
    const prod = a.mul(b);
    expect(prod.toString()).toBe((12345678 * 87654321).toString());
  });

  it('mul: negative * positive', () => {
    const a = NBaseInteger(678, base10);
    const b = NBaseInteger(-12345, base10);
    expect(a.mul(b).toString()).toBe((-12345 * 678).toString());
  });

  it('mul: negative * negative', () => {
    const a = NBaseInteger(-12, base10);
    const b = NBaseInteger(-34, base10);
    expect(a.mul(b).toString()).toBe((12 * 34).toString());
  });

  it('mul: base 2, overflow', () => {
    const a = NBaseInteger(0b1011, base2); // 11
    const b = NBaseInteger(0b110, base2); // 6
    expect(a.mul(b).toString()).toBe('1000010'); // 66 in binary
  });

  it('mul: base 16, with letters', () => {
    const a = NBaseInteger(0xa, base16); // 10
    const b = NBaseInteger(0xb, base16); // 11
    expect(a.mul(b).toString().toUpperCase()).toBe('6E'); // 110 in hex
  });

  it('mul: custom charset', () => {
    const a = NBaseInteger(2, 3, customCharset); // '2'
    const b = NBaseInteger(2, 3, customCharset); // '2'
    expect(a.mul(b).toString()).toBe('bb'); // 2*2=4, base3: '11'
  });

  it('mul: zero edge', () => {
    const a = NBaseInteger(0, base10);
    const b = NBaseInteger(99999, base10);
    expect(a.mul(b).toString()).toBe('0');
    expect(b.mul(a).toString()).toBe('0');
  });

  it('mul: one edge', () => {
    const a = NBaseInteger(1, base10);
    const b = NBaseInteger(12345, base10);
    expect(a.mul(b).toString()).toBe('12345');
    expect(b.mul(a).toString()).toBe('12345');
  });
});
