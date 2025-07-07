import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';
describe('NBaseInteger 链式四则混合运算', () => {
  it('加减乘除链式调用', () => {
    const a = NBaseInteger.from(100, 10);
    const b = NBaseInteger.from(25, 10);
    const c = NBaseInteger.from(3, 10);

    // ((100 + 25) * 3 - 50) / 5 = ((125) * 3 - 50) / 5 = (375 - 50) / 5 = 325 / 5 = 65
    const result = a.add(b).mul(c).sub(50).div(5);

    expect(result.toString()).toBe('65');
  });

  it('链式混合正负数', () => {
    const a = NBaseInteger.from(20, 10);
    const b = NBaseInteger.from(-5, 10);

    // ((20 - 5) * 2 + 10) / 5 = (15 * 2 + 10) / 5 = (30 + 10) / 5 = 40 / 5 = 8
    const result = a.add(b).mul(2).add(10).div(5);

    expect(result.toString()).toBe('8');
  });

  it('链式除法和取余', () => {
    const a = NBaseInteger.from(1234, 10);
    const b = NBaseInteger.from(100, 10);

    // (1234 / 100) * 3 + (1234 % 100) = 12 * 3 + 34 = 36 + 34 = 70
    const result = a.div(b).mul(3).add(a.mod(b));

    expect(result.toString()).toBe('70');
  });
});

describe('NBaseInteger 幂运算链式', () => {
  it('幂运算与加减混合', () => {
    const a = NBaseInteger.from(2, 10);
    const b = NBaseInteger.from(3, 10);

    // 2^3 + 5 = 8 + 5 = 13
    const result = a.pow(b).add(5);

    expect(result.toString()).toBe('13');
  });

  it('幂运算链式与乘除', () => {
    const a = NBaseInteger.from(5, 10);

    // ((5^3) - 100) / 5 = (125 - 100) / 5 = 25 / 5 = 5
    const result = a.pow(3).sub(100).div(5);

    expect(result.toString()).toBe('5');
  });

  it('复杂链式：((2^5) * 3 + 10) / 2', () => {
    const a = NBaseInteger.from(2, 10);

    // ((2^5) * 3 + 10) / 2 = (32 * 3 + 10) / 2 = (96 + 10) / 2 = 106 / 2 = 53
    const result = a.pow(5).mul(3).add(10).div(2);

    expect(result.toString()).toBe('53');
  });
});
