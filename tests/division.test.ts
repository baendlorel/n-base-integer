import { describe, it, expect, fit, fdescribe } from '@jest/globals';
import { NBaseInteger } from '../src/n-base/integer';

describe('NBaseInteger.div', () => {
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
