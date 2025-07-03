import { NAME, Ordering, flag, protect } from './common';

const safeInt = (n: number) => {
  if (!Number.isSafeInteger(n)) {
    throw new TypeError(`The method is not called with a safe integer, got ${n}.`);
  }
  return n;
};

const safeCharset = (charset: string) => {
  if (charset.length < 2) {
    throw new RangeError(`Charset must contain at least 2 characters.`);
  }
  const deduped = new Set(charset.split(''));
  if (charset.length !== deduped.size) {
    throw new RangeError(`Given charset contains duplicate characters.`);
  }
  return charset;
};

/**
 * Numerical System
 */
const ns = {
  charset: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  base: 62,
};

type NS = typeof ns;

/**
 * NBase is a class for n-base numeral system
 */
export class NBaseInteger {
  // # Creation
  static from(n: number, base: number): NBaseInteger;
  static from(n: number, charset: string): NBaseInteger;
  static from(n: number, arg: number | string): NBaseInteger {
    safeInt(n);

    // create with default charset
    if (typeof arg === 'number') {
      const base = safeInt(arg);
      if (base <= 1) {
        throw new RangeError(`Base must >= 1.`);
      }
      if (base > ns.base) {
        throw new RangeError(
          `Given base > ${ns.base}. Default charset is not enough, either set it or specify another charset.`
        );
      }
      return new NBaseInteger(n, ns, flag);
    }

    // create with custom charset
    if (typeof arg === 'string') {
      const charset = safeCharset(arg);
      return new NBaseInteger(n, { charset, base: charset.length }, flag);
    }

    throw new TypeError('Expect 2nd parameter to be a base or a charset.');
  }

  /**
   * Get the default charset for NBaseInteger.
   */
  static get charset() {
    return ns.charset;
  }

  /**
   * Set the default charset for NBaseInteger.
   */
  static set charset(charset: string) {
    ns.charset = safeCharset(charset);
    ns.base = ns.charset.length;
  }

  /**
   * Clone an NBaseInteger instance.
   * @param priv Internal symbol for access control.
   * @param a The instance to clone.
   */
  private static clone(priv: symbol, a: NBaseInteger): NBaseInteger {
    protect(priv);
    const clone = new NBaseInteger(0, a.ns, flag);
    for (let i = 0; i < a.digits.length; i++) {
      clone.digits[i] = a.digits[i];
    }
    return clone;
  }

  /**
   * Ensure argument is a valid NBaseInteger or number, optionally clone.
   * @param priv Internal symbol for access control.
   * @param arg The argument to check.
   * @param clone Whether to clone the instance.
   */
  private safeOther(priv: symbol, arg: number | NBaseInteger): NBaseInteger {
    protect(priv);
    if (typeof arg === 'number') {
      const n = safeInt(arg);
      return new NBaseInteger(n, this.ns, flag);
    }
    if (arg instanceof NBaseInteger) {
      const nbi = arg;
      if (nbi.base !== this.base) {
        throw new TypeError(`Called with a ${NAME} with different base.`);
      }
      if (nbi.ns.charset !== this.ns.charset) {
        throw new TypeError(`Called with a ${NAME} with different charset.`);
      }
      return nbi;
    }
    throw new TypeError(`Called with an invalid argument. Expected number or ${NAME}.`);
  }

  // # private vars
  private readonly ns: NS;

  /**
   * digits[0] is the least significant digit (ones place),
   * digits[1] is the next higher place, and so on.
   * The array extends from the ones place upwards.
   */
  private readonly digits: number[];
  private negative: boolean = false;

  constructor(n: number, ns: NS, priv: symbol) {
    protect(priv, `The constructor of ${NAME} is protected, please use ${NAME}.from instead.`);
    this.ns = ns;
    if (n < 0) {
      n = -n;
      this.negative = true;
    }
    // creating
    const base = this.ns.charset.length;
    this.digits = [];
    do {
      this.digits.push(n % base);
      n = Math.floor(n / base);
    } while (n > 0);
  }

  get base(): number {
    return this.ns.base;
  }

  // # Calculation, Ensure bases and charsets are same, then call this
  /**
   * Add a to b in place.
   * @param priv Internal symbol for access control.
   * @param a The first operand.
   * @param b The second operand (result stored here).
   */
  private static addAToB(priv: symbol, a: NBaseInteger, b: NBaseInteger): void {
    protect(priv);
    const ad = a.digits;
    const bd = b.digits;
    const base = a.base;
    let max = ad.length;
    if (ad.length > bd.length) {
      bd.fill(0, bd.length, max);
      while (bd.length < max) {
        bd.push(0);
      }
    } else {
      max = bd.length;
      while (ad.length < max) {
        ad.push(0);
      }
    }
    if (a.negative === b.negative) {
      let carry = 0;
      for (let i = 0; i < max; i++) {
        const v = ad[i] + bd[i] + carry;
        if (v >= base) {
          carry = 1;
          bd[i] = v - base;
        } else {
          carry = 0;
          bd[i] = v;
        }
      }
      if (carry > 0) {
        bd.push(carry);
      }
      return;
    }
    // if a>0 b<0 or a<0 b>0, we need to judge the sign first
  }

  add(nbi: NBaseInteger): NBaseInteger;
  add(n: number): NBaseInteger;
  add(arg: number | NBaseInteger): NBaseInteger {
    const other = this.safeOther(flag, arg);
    NBaseInteger.addAToB(flag, this, NBaseInteger.clone(flag, other));
    return other;
  }

  addAssign(nbi: NBaseInteger): NBaseInteger;
  addAssign(n: number): NBaseInteger;
  addAssign(arg: number | NBaseInteger): NBaseInteger {
    const other = this.safeOther(flag, arg);
    NBaseInteger.addAToB(flag, other, this);
    return this;
  }

  // # comparisons
  /**
   * Compare two NBaseInteger instances.
   * @param priv Internal symbol for access control.
   * @param a The first operand.
   * @param b The second operand.
   */
  private static compare(priv: symbol, a: NBaseInteger, b: NBaseInteger): Ordering {
    protect(priv);
    if (a === b) {
      return Ordering.Equal;
    }
    if (a.negative !== b.negative) {
      if (
        a.digits.length === 1 &&
        b.digits.length === 1 &&
        a.digits[0] === 0 &&
        b.digits[0] === 0
      ) {
        return Ordering.Equal;
      }
      return a.negative ? Ordering.Less : Ordering.Greater;
    }
    const ad = a.digits;
    const bd = b.digits;
    if (ad.length !== bd.length) {
      if (a.negative) {
        return ad.length < bd.length ? Ordering.Greater : Ordering.Less;
      } else {
        return ad.length > bd.length ? Ordering.Greater : Ordering.Less;
      }
    }
    if (a.negative) {
      for (let i = ad.length - 1; i >= 0; i--) {
        if (ad[i] !== bd[i]) {
          return ad[i] < bd[i] ? Ordering.Greater : Ordering.Less;
        }
      }
    } else {
      for (let i = ad.length - 1; i >= 0; i--) {
        if (ad[i] !== bd[i]) {
          return ad[i] > bd[i] ? Ordering.Greater : Ordering.Less;
        }
      }
    }
    return Ordering.Equal;
  }

  /**
   * Compare this instance with another.
   * @param priv Internal symbol for access control.
   * @param arg The value to compare with.
   */
  private cmp(priv: symbol, arg: number | NBaseInteger): Ordering {
    protect(priv);
    const other = this.safeOther(flag, arg);
    return NBaseInteger.compare(flag, this, other);
  }

  eq(nbi: NBaseInteger): boolean;
  eq(n: number): boolean;
  eq(arg: number | NBaseInteger): boolean {
    return this.cmp(flag, arg) === Ordering.Equal;
  }

  ne(nbi: NBaseInteger): boolean;
  ne(n: number): boolean;
  ne(arg: number | NBaseInteger): boolean {
    return this.cmp(flag, arg) !== Ordering.Equal;
  }

  gt(nbi: NBaseInteger): boolean;
  gt(n: number): boolean;
  gt(arg: number | NBaseInteger): boolean {
    return this.cmp(flag, arg) === Ordering.Greater;
  }

  gte(nbi: NBaseInteger): boolean;
  gte(n: number): boolean;
  gte(arg: number | NBaseInteger): boolean {
    const o = this.cmp(flag, arg);
    return o === Ordering.Greater || o === Ordering.Equal;
  }

  lt(nbi: NBaseInteger): boolean;
  lt(n: number): boolean;
  lt(arg: number | NBaseInteger): boolean {
    return this.cmp(flag, arg) === Ordering.Less;
  }

  lte(nbi: NBaseInteger): boolean;
  lte(n: number): boolean;
  lte(arg: number | NBaseInteger): boolean {
    const o = this.cmp(flag, arg);
    return o === Ordering.Less || o === Ordering.Equal;
  }

  // # others
  toString(): string {
    return this.digits
      .map((digit) => this.ns.charset[digit])
      .reverse()
      .join('');
  }
}
