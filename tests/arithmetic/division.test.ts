import { describe, it, expect } from '@jest/globals';
import { NBaseInteger } from '@/index';

describe('NBaseInteger.div', () => {
  it('should divide 2', () => {
    const a = NBaseInteger(115, 10);
    const b = a.divmod2();
    expect(b.quotient.toString()).toBe('57');
    expect(b.remainder.toString()).toBe('1');

    const c = NBaseInteger(24, 10);
    const d = c.divmod2();
    expect(d.quotient.toString()).toBe('12');
    expect(d.remainder.toString()).toBe('0');
  });
  it('should div 256 by 8 correctly', () => {
    const a = NBaseInteger(1537, 10);
    const b = NBaseInteger(7, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('219');
    expect(remainder.toString()).toBe('4');
    // Ensure immutability
    expect(a.toString()).toBe('1537');
    expect(b.toString()).toBe('7');
  });

  it('should calculate 257 / 32 correctly', () => {
    const a = NBaseInteger(257, 10);
    const b = NBaseInteger(32, 10);
    const c = a.divmod(b);

    expect(c.quotient.toString()).toBe('8');
    expect(c.remainder.toString()).toBe('1');
    // Ensure immutability
    expect(a.toString()).toBe('257');
    expect(b.toString()).toBe('32');
  });

  it('should handle division by 1', () => {
    const a = NBaseInteger(12345, 10);
    const b = NBaseInteger(1, 10);
    const c = a.div(b);

    expect(c.toString()).toBe('12345');
    expect(a.toString()).toBe('12345');
  });

  it('should handle division resulting in 1', () => {
    const a = NBaseInteger(987, 10);
    const b = NBaseInteger(987, 10);
    const c = a.div(b);

    expect(c.toString()).toBe('1');
  });

  it('should handle division of smaller by larger number', () => {
    const a = NBaseInteger(5, 10);
    const b = NBaseInteger(10, 10);
    const c = a.div(b);

    expect(c.toString()).toBe('0');
  });

  it('should handle large number division', () => {
    const a = NBaseInteger(999999999, 10);
    const b = NBaseInteger(333333, 10);
    const c = a.div(b);

    expect(c.toString()).toBe('3000');
  });

  it('should handle large number division2', () => {
    const a = NBaseInteger(999_9999, 10);
    const b = NBaseInteger(33, 10);
    const c = a.div(b);

    expect(c.toString()).toBe('303030');
  });

  it('should handle divmod with perfect division', () => {
    const a = NBaseInteger(144, 10);
    const b = NBaseInteger(12, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('12');
    expect(remainder.toString()).toBe('0');
  });

  it('should handle divmod with remainder', () => {
    const a = NBaseInteger(100, 10);
    const b = NBaseInteger(7, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('14');
    expect(remainder.toString()).toBe('2');
  });

  it('should handle divmod by 1', () => {
    const a = NBaseInteger(789, 10);
    const b = NBaseInteger(1, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('789');
    expect(remainder.toString()).toBe('0');
  });

  it('should handle divmod of equal numbers', () => {
    const a = NBaseInteger(456, 10);
    const b = NBaseInteger(456, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('1');
    expect(remainder.toString()).toBe('0');
  });

  it('should handle divmod when dividend is smaller', () => {
    const a = NBaseInteger(3, 10);
    const b = NBaseInteger(15, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('0');
    expect(remainder.toString()).toBe('3');
  });

  it('should handle large divmod operations', () => {
    const a = NBaseInteger(987654321, 10);
    const b = NBaseInteger(123456, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('8000');
    expect(remainder.toString()).toBe('6321');
  });

  it('should handle divmod2 with odd numbers', () => {
    const a = NBaseInteger(999, 10);
    const { quotient, remainder } = a.divmod2();

    expect(quotient.toString()).toBe('499');
    expect(remainder.toString()).toBe('1');
  });

  it('should handle divmod2 with even numbers', () => {
    const a = NBaseInteger(1000, 10);
    const { quotient, remainder } = a.divmod2();

    expect(quotient.toString()).toBe('500');
    expect(remainder.toString()).toBe('0');
  });

  it('should handle divmod2 with single digit', () => {
    const a = NBaseInteger(7, 10);
    const { quotient, remainder } = a.divmod2();

    expect(quotient.toString()).toBe('3');
    expect(remainder.toString()).toBe('1');
  });

  it('should handle divmod with single digit divisor', () => {
    const a = NBaseInteger(12345, 10);
    const b = NBaseInteger(9, 10);
    const { quotient, remainder } = a.divmod(b);

    expect(quotient.toString()).toBe('1371');
    expect(remainder.toString()).toBe('6');
  });

  it('should verify divmod consistency with div', () => {
    const a = NBaseInteger(54321, 10);
    const b = NBaseInteger(123, 10);

    const divResult = a.div(b);
    const { quotient, remainder } = a.divmod(b);

    expect(divResult.toString()).toBe(quotient.toString());

    // Verify: a = b * quotient + remainder
    const verification = b.mul(quotient).add(remainder);
    expect(verification.toString()).toBe(a.toString());
  });

  it('should handle zero division cases', () => {
    const zero = NBaseInteger(0, 10);
    const nonZero = NBaseInteger(123, 10);

    const divResult = zero.div(nonZero);
    const { quotient, remainder } = zero.divmod(nonZero);

    expect(divResult.toString()).toBe('0');
    expect(quotient.toString()).toBe('0');
    expect(remainder.toString()).toBe('0');
  });
});
