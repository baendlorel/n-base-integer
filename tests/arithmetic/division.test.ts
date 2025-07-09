import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';

describe('NBaseInteger.div', () => {
  it('should div 256 by 8 correctly', () => {
    const a = NBaseInteger.from(1537, 10);
    const b = NBaseInteger.from(7, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('219');
    expect(remainder.toString()).toBe('4');
    // Ensure immutability
    expect(a.toString()).toBe('1537');
    expect(b.toString()).toBe('7');
  });

  it('should calculate 257 / 32 correctly', () => {
    const a = NBaseInteger.from(257, 10);
    const b = NBaseInteger.from(32, 10);
    const c = a.divmod(b);

    expect(c.quotient.toString()).toBe('8');
    expect(c.remainder.toString()).toBe('1');
    // Ensure immutability
    expect(a.toString()).toBe('257');
    expect(b.toString()).toBe('32');
  });

  it('should handle division by 1', () => {
    const a = NBaseInteger.from(12345, 10);
    const b = NBaseInteger.from(1, 10);
    const c = a.div(b);

    expect(c.toString()).toBe('12345');
    expect(a.toString()).toBe('12345');
  });

  it('should handle division resulting in 1', () => {
    const a = NBaseInteger.from(987, 10);
    const b = NBaseInteger.from(987, 10);
    const c = a.div(b);

    expect(c.toString()).toBe('1');
  });

  it('should handle division of smaller by larger number', () => {
    const a = NBaseInteger.from(5, 10);
    const b = NBaseInteger.from(10, 10);
    const c = a.div(b);

    expect(c.toString()).toBe('0');
  });

  it('should handle large number division', () => {
    const a = NBaseInteger.from(999999999, 10);
    const b = NBaseInteger.from(333333, 10);
    const c = a.div(b);

    expect(c.toString()).toBe('3000');
  });

  it('should handle large number division2', () => {
    const a = NBaseInteger.from(999_9999, 10);
    const b = NBaseInteger.from(33, 10);
    const c = a.div(b);

    expect(c.toString()).toBe('303030');
  });

  it('should handle divmod with perfect division', () => {
    const a = NBaseInteger.from(144, 10);
    const b = NBaseInteger.from(12, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('12');
    expect(remainder.toString()).toBe('0');
  });

  it('should handle divmod with remainder', () => {
    const a = NBaseInteger.from(100, 10);
    const b = NBaseInteger.from(7, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('14');
    expect(remainder.toString()).toBe('2');
  });

  it('should handle divmod by 1', () => {
    const a = NBaseInteger.from(789, 10);
    const b = NBaseInteger.from(1, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('789');
    expect(remainder.toString()).toBe('0');
  });

  it('should handle divmod of equal numbers', () => {
    const a = NBaseInteger.from(456, 10);
    const b = NBaseInteger.from(456, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('1');
    expect(remainder.toString()).toBe('0');
  });

  it('should handle divmod when dividend is smaller', () => {
    const a = NBaseInteger.from(3, 10);
    const b = NBaseInteger.from(15, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('0');
    expect(remainder.toString()).toBe('3');
  });

  it('should handle large divmod operations', () => {
    const a = NBaseInteger.from(987654321, 10);
    const b = NBaseInteger.from(123456, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('8000');
    expect(remainder.toString()).toBe('6321');
  });

  it('should handle divmod with single digit divisor', () => {
    const a = NBaseInteger.from(12345, 10);
    const b = NBaseInteger.from(9, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('1371');
    expect(remainder.toString()).toBe('6');
  });

  it('should verify divmod consistency with div', () => {
    const a = NBaseInteger.from(54321, 10);
    const b = NBaseInteger.from(123, 10);

    const divResult = a.div(b);
    const { quotient, remainder } = a.divmod(b);

    expect(divResult.toString()).toBe(quotient.toString());

    // Verify: a = b * quotient + remainder
    const verification = b.mul(quotient).add(remainder);
    expect(verification.toString()).toBe(a.toString());
  });

  it('should handle zero division cases', () => {
    const zero = NBaseInteger.from(0, 10);
    const nonZero = NBaseInteger.from(123, 10);

    const divResult = zero.div(nonZero);
    const { quotient, remainder } = zero.divmod(nonZero);

    expect(divResult.toString()).toBe('0');
    expect(quotient.toString()).toBe('0');
    expect(remainder.toString()).toBe('0');
  });
});
