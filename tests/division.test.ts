import { describe, it, expect, fit, fdescribe } from '@jest/globals';
import { NBaseInteger } from '../src/n-base/integer';

describe('NBaseInteger.div', () => {
  it('should divide 2', () => {
    const a = NBaseInteger.from(115, 10);
    const b = NBaseInteger.div2(a);
    expect(b.quotient.toString()).toBe('57');
    expect(b.remainder.toString()).toBe('1');

    const c = NBaseInteger.from(24, 10);
    const d = NBaseInteger.div2(c);
    expect(d.quotient.toString()).toBe('12');
    expect(d.remainder.toString()).toBe('0');
  });

  it('should div two base-10 numbers correctly', () => {
    const a = NBaseInteger.from(256, 10);
    const b = NBaseInteger.from(32, 10);
    const c = a.div(b);

    expect(c.toString()).toBe('8');
    // Ensure immutability
    expect(a.toString()).toBe('256');
    expect(b.toString()).toBe('32');
  });
});
