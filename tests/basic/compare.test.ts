import { describe, expect, test } from '@jest/globals';
import { NBaseInteger } from '../../src/n-base/integer';

describe('NBaseInteger comparison functions', () => {
  const a = NBaseInteger.from(123, 10);
  const b = NBaseInteger.from(456, 10);
  const c = NBaseInteger.from(123, 10);
  const negA = NBaseInteger.from(-123, 10);
  const negB = NBaseInteger.from(-456, 10);

  // eq, ne
  test('eq and ne', () => {
    expect(a.eq(c)).toBe(true);
    expect(a.eq(b)).toBe(false);
    expect(a.ne(b)).toBe(true);
    expect(a.ne(c)).toBe(false);
  });

  // gt, gte, lt, lte
  test('gt, gte, lt, lte', () => {
    expect(b.gt(a)).toBe(true);
    expect(b.gte(a)).toBe(true);
    expect(a.lt(b)).toBe(true);
    expect(a.lte(b)).toBe(true);
    expect(a.gte(c)).toBe(true);
    expect(a.lte(c)).toBe(true);
    expect(a.gt(b)).toBe(false);
    expect(a.gte(b)).toBe(false);
    expect(b.lt(a)).toBe(false);
    expect(b.lte(a)).toBe(false);
  });

  // eqAbs, neAbs
  test('eqAbs and neAbs', () => {
    expect(a.eqAbs(negA)).toBe(true);
    expect(a.neAbs(negB)).toBe(true);
    expect(a.eqAbs(b)).toBe(false);
  });

  // gtAbs, gteAbs, ltAbs, lteAbs
  test('gtAbs, gteAbs, ltAbs, lteAbs', () => {
    expect(b.gtAbs(a)).toBe(true);
    expect(b.gteAbs(a)).toBe(true);
    expect(a.ltAbs(b)).toBe(true);
    expect(a.lteAbs(b)).toBe(true);
    expect(a.gteAbs(negA)).toBe(true);
    expect(a.lteAbs(negA)).toBe(true);
    expect(a.gtAbs(b)).toBe(false);
    expect(a.gteAbs(b)).toBe(false);
    expect(b.ltAbs(a)).toBe(false);
    expect(b.lteAbs(a)).toBe(false);
  });
});
