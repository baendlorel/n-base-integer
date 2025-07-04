import { NAME, Ordering, flag, protect } from './common';

const MAX_BASE = 1000; // Maximum base supported by the default charset

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

const createNs = (charset: string) =>
  Array.from({ length: charset.length }, (_, i) => ({
    charset: charset.substring(0, i + 1),
    base: i + 1,
  }));

/**
 * Numerical System
 */
const ns = createNs('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');

interface NS {
  charset: string;
  base: number;
}

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
      if (base > ns.length) {
        throw new RangeError(
          `Given base > ${ns.length}. Default charset is not enough, either set it or specify another charset.`
        );
      }
      return new NBaseInteger(n, ns[base - 1], flag);
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
    return ns[ns.length - 1].charset;
  }

  /**
   * Set the default charset for NBaseInteger.
   */
  static set charset(charset: string) {
    charset = safeCharset(charset);
    if (charset.length > MAX_BASE) {
      throw new RangeError(`Default charset length should less than ${MAX_BASE}.`);
    }
    ns.splice(0);
    ns.push(...createNs(charset));
  }

  /**
   * Clone an NBaseInteger instance.
   * @param priv Internal symbol for access control.
   * @param a The instance to clone.
   */
  private static clone(priv: symbol, a: NBaseInteger): NBaseInteger {
    protect(priv);
    const clone = new NBaseInteger(a.sign, a.ns, flag);
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

    // b is a normal number
    if (typeof arg === 'number') {
      const n = safeInt(arg);
      return new NBaseInteger(n, this.ns, flag);
    }

    // b is also an NBaseInteger
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

  private negative = false;

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

  get charset(): string {
    return this.ns.charset;
  }

  get isZero(): boolean {
    return this.digits.length === 1 && this.digits[0] === 0;
  }

  get sign(): -1 | 1 {
    return this.negative ? -1 : 1;
  }

  // # Calculations. Ensure bases and charsets are same, then call this
  // #region add/sub
  /**
   * Add a to b in place.
   * @param priv Internal symbol for access control.
   * @param a The first operand.
   * @param b The second operand (result stored here).
   */
  private static addAToB(priv: symbol, a: NBaseInteger, b: NBaseInteger): void {
    protect(priv);
    const ad = a.digits.slice();
    const bd = b.digits; // because b will change, there is no need to slice.
    const base = a.base;
    let max = ad.length;
    // fill empty parts
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

    // same sign, add them directly
    if (a.negative === b.negative) {
      let carry = 0;
      for (let i = 0; i < max; i++) {
        const v = ad[i] + bd[i] + carry;
        carry = Math.floor(v / base);
        bd[i] = v % base;
      }
      if (carry > 0) {
        bd.push(carry);
      }
      return;
    }

    // now a b has different signs, we need to judge the sign first
    // only `greater - less` can be calculated
    switch (NBaseInteger.compareAbs(priv, a, b)) {
      case Ordering.Equal:
        // & means a = -b, then a + b = 0
        {
          b.digits.length = 1; // clear b
          b.digits[0] = 0;
          b.negative = false; // set sign to positive
        }
        break; // no need to purge zeros
      case Ordering.Greater:
        // & means |a| > |b|, then a + b = sgn(a)(|a| - |b|)
        {
          b.negative = a.negative; // |a| is greater, so sign must be same as a
          let carry = 0;
          for (let i = 0; i < max; i++) {
            const v = ad[i] - bd[i] + carry;
            if (v < 0) {
              carry = -1;
              bd[i] = v + base;
            } else {
              carry = 0;
              bd[i] = v;
            }
          }
          // greater - less, last carry is definitly 0.
        }
        break;
      case Ordering.Less:
        // & means |b| > |a|, then a + b = sgn(b)(|b| - |a|)
        {
          let carry = 0;
          for (let i = 0; i < max; i++) {
            const v = bd[i] - ad[i] + carry;
            if (v < 0) {
              carry = -1;
              bd[i] = v + base;
            } else {
              carry = 0;
              bd[i] = v;
            }
          }
          // greater - less, last carry is definitly 0.
        }
        break;
    }

    // purge the zeros
    for (let i = bd.length - 1; i >= 0; i--) {
      if (bd[i] !== 0) {
        bd.length = i + 1; // truncate the array
        return;
      }
    }
    bd.length = 1; // if all digits are zero, set to 0
  }

  add(nbi: NBaseInteger): NBaseInteger;
  add(n: number): NBaseInteger;
  add(arg: number | NBaseInteger): NBaseInteger {
    const other = NBaseInteger.clone(flag, this.safeOther(flag, arg));
    NBaseInteger.addAToB(flag, this, other);
    return other;
  }

  addAssign(nbi: NBaseInteger): NBaseInteger;
  addAssign(n: number): NBaseInteger;
  addAssign(arg: number | NBaseInteger): NBaseInteger {
    const other = this.safeOther(flag, arg);
    NBaseInteger.addAToB(flag, other, this);
    return this;
  }

  sub(nbi: NBaseInteger): NBaseInteger;
  sub(n: number): NBaseInteger;
  sub(arg: number | NBaseInteger): NBaseInteger {
    const other = NBaseInteger.clone(flag, this.safeOther(flag, arg));
    other.oppAssign();
    NBaseInteger.addAToB(flag, this, other);
    return other;
  }

  subAssign(nbi: NBaseInteger): NBaseInteger;
  subAssign(n: number): NBaseInteger;
  subAssign(arg: number | NBaseInteger): NBaseInteger {
    const other = this.safeOther(flag, arg);
    other.oppAssign();
    NBaseInteger.addAToB(flag, other, this);
    other.oppAssign();
    return this;
  }
  // #endregion

  // #region multiply
  private static mulAToB(priv: symbol, a: NBaseInteger, b: NBaseInteger): void {
    protect(priv);
    const ad = a.digits.slice();
    const bd = b.digits; // because b will change, there is no need to slice.
    const base = a.base;

    // same sign -> positive
    b.negative = a.negative !== b.negative;
    const rows: number[][] = [];
    let maxRowLen = 0;
    for (let i = 0; i < ad.length; i++) {
      const row: number[] = new Array(i); // create a row for the result
      row.fill(0); // fill with zeros
      rows.push(row);
      let carry = 0;
      const ai = ad[i];
      for (let j = 0; j < bd.length; j++) {
        const v = ai * bd[j] + carry;
        row.push(v % base); // store the result in b
        carry = Math.floor(v / base); // calculate the carry
      }
      if (carry > 0) {
        row.push(carry);
      }
      maxRowLen = Math.max(maxRowLen, row.length);
    }

    // add all rows together
    {
      let carry = 0;
      for (let i = 0; i < maxRowLen; i++) {
        let v = carry;
        for (let j = 0; j < rows.length; j++) {
          v += rows[j][i] ?? 0;
        }
        carry = Math.floor(v / base);
        bd[i] = v % base;
      }
      if (carry > 0) {
        bd.push(carry);
      }
    }

    // purge the zeros
    for (let i = bd.length - 1; i >= 0; i--) {
      if (bd[i] !== 0) {
        bd.length = i + 1; // truncate the array
        return;
      }
    }
    bd.length = 1; // if all digits are zero, set to 0
  }

  mul(nbi: NBaseInteger): NBaseInteger;
  mul(n: number): NBaseInteger;
  mul(arg: number | NBaseInteger): NBaseInteger {
    const other = NBaseInteger.clone(flag, this.safeOther(flag, arg));
    NBaseInteger.mulAToB(flag, this, other);
    return other;
  }

  mulAssgin(nbi: NBaseInteger): NBaseInteger;
  mulAssgin(n: number): NBaseInteger;
  mulAssgin(arg: number | NBaseInteger): NBaseInteger {
    const other = this.safeOther(flag, arg);
    NBaseInteger.mulAToB(flag, other, this);
    return other;
  }
  // #endregion

  // #region signs
  oppAssign() {
    this.negative = !this.negative;
    return this;
  }

  negAssign() {
    this.negative = true;
    return this;
  }

  posAssign() {
    this.negative = false;
    return this;
  }

  opp() {
    const b = NBaseInteger.clone(flag, this);
    b.negative = !b.negative;
    return b;
  }

  neg() {
    const b = NBaseInteger.clone(flag, this);
    b.negative = true;
    return b;
  }

  pos() {
    const b = NBaseInteger.clone(flag, this);
    b.negative = false;
    return b;
  }
  // #endregion

  // #region comparisons
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
    if (a.isZero && b.isZero) {
      return Ordering.Equal;
    }
    if (a.negative !== b.negative) {
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

  private static compareAbs(priv: symbol, a: NBaseInteger, b: NBaseInteger): Ordering {
    protect(priv);
    if (a === b) {
      return Ordering.Equal;
    }
    const ad = a.digits;
    const bd = b.digits;
    if (ad.length !== bd.length) {
      return ad.length > bd.length ? Ordering.Greater : Ordering.Less;
    }
    for (let i = ad.length - 1; i >= 0; i--) {
      if (ad[i] !== bd[i]) {
        return ad[i] > bd[i] ? Ordering.Greater : Ordering.Less;
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

  /**
   * Compare this instance with another ignoring sign.
   * @param priv Internal symbol for access control.
   * @param arg The value to compare with.
   */
  private cmpAbs(priv: symbol, arg: number | NBaseInteger): Ordering {
    protect(priv);
    const other = this.safeOther(flag, arg);
    return NBaseInteger.compareAbs(flag, this, other);
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

  eqAbs(nbi: NBaseInteger): boolean;
  eqAbs(n: number): boolean;
  eqAbs(arg: number | NBaseInteger): boolean {
    return this.cmpAbs(flag, arg) === Ordering.Equal;
  }

  neAbs(nbi: NBaseInteger): boolean;
  neAbs(n: number): boolean;
  neAbs(arg: number | NBaseInteger): boolean {
    return this.cmpAbs(flag, arg) !== Ordering.Equal;
  }

  gtAbs(nbi: NBaseInteger): boolean;
  gtAbs(n: number): boolean;
  gtAbs(arg: number | NBaseInteger): boolean {
    return this.cmpAbs(flag, arg) === Ordering.Greater;
  }

  gteAbs(nbi: NBaseInteger): boolean;
  gteAbs(n: number): boolean;
  gteAbs(arg: number | NBaseInteger): boolean {
    const o = this.cmpAbs(flag, arg);
    return o === Ordering.Greater || o === Ordering.Equal;
  }

  ltAbs(nbi: NBaseInteger): boolean;
  ltAbs(n: number): boolean;
  ltAbs(arg: number | NBaseInteger): boolean {
    return this.cmpAbs(flag, arg) === Ordering.Less;
  }

  lteAbs(nbi: NBaseInteger): boolean;
  lteAbs(n: number): boolean;
  lteAbs(arg: number | NBaseInteger): boolean {
    const o = this.cmpAbs(flag, arg);
    return o === Ordering.Less || o === Ordering.Equal;
  }
  // #endregion

  // # others
  clone() {
    return NBaseInteger.clone(flag, this);
  }

  toString(): string {
    const abs = this.digits
      .map((digit) => this.ns.charset[digit])
      .reverse()
      .join('');
    return `${this.negative ? '-' : ''}${abs}`;
  }
}
