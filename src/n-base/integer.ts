import { NAME, Ordering, charsets } from './common';
import { flag, protect, safeCharset, safeInt } from './expect';

const MAX_BASE = 1000; // Maximum base supported by the default charset

interface NBaseIntegerDivResult {
  quotient: NBaseInteger;
  remainder: NBaseInteger;
}

// #region primitive functions
const cmp = (a: readonly number[], b: readonly number[]) => {
  if (a === b) {
    return Ordering.Equal;
  }
  if (a.length !== b.length) {
    return a.length > b.length ? Ordering.Greater : Ordering.Less;
  }
  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] !== b[i]) {
      return a[i] > b[i] ? Ordering.Greater : Ordering.Less;
    }
  }
  return Ordering.Equal;
};

const plus = (a: readonly number[], b: readonly number[], base: number) => {
  // assure that a is longer
  if (a.length < b.length) {
    const temp = a;
    a = b;
    b = temp;
  }

  const sum: number[] = [];
  let carry = 0;
  for (let i = 0; i < b.length; i++) {
    const v = a[i] + b[i] + carry;

    /**
     * Through some tests, `v % base` and `v - carry * base` are almost equivalent.
     * However `v - carry * base` always give positive result.
     * So we use `v - carry * base` here
     *
     * @see https://github.com/baendlorel/ts-performance
     * @see src/performance/modulo.ts
     */
    carry = Math.floor(v / base);
    sum[i] = v - carry * base;
  }
  for (let i = b.length; i < a.length; i++) {
    const v = a[i] + carry;
    carry = Math.floor(v / base);
    sum[i] = v - carry * base;
  }
  if (carry > 0) {
    sum.push(carry);
  }
  return sum;
};

/**
 * ! Only use when a > b
 */
const minus = (a: readonly number[], b: readonly number[], base: number) => {
  const diff: number[] = [];
  let carry = 0;
  for (let i = 0; i < b.length; i++) {
    const v = a[i] - b[i] + carry;
    carry = Math.floor(v / base);
    diff[i] = v - carry * base;
  }
  for (let i = b.length; i < a.length; i++) {
    const v = a[i] + carry;
    carry = Math.floor(v / base);
    diff[i] = v - carry * base;
  }
  // greater - less, last carry is definitly 0.
  // carry of minus is impossible to be non-zero

  if (carry > 0) {
    throw new Error(`minus: carry = ${carry}, must be a < b!`);
  }

  return purgeZeros(diff);
};

/**
 * ! Only use when a > b
 *    ___13____
 *  13) 170
 *      13
 *       40
 *       39
 *        1
 * So 170 / 13 = 13 ... 1
 */
const divide = (a: readonly number[], b: readonly number[], base: number) => {
  // move this length to use vertical expression
  const len = b.length;
  const result: number[] = [];

  let aa = a.slice(a.length - len, a.length);
  let carry = 0;
  // start from high rank
  switch (cmp(aa, b)) {
    case Ordering.Equal:
      result.unshift(1);
      break;
    case Ordering.Greater:
      // process div
      for (let i = 2; i < base; i++) {
        // mul
      }
      break;
    case Ordering.Less:
      // chop another digit and try again
      aa.unshift(a.slice(a.length - len - 1, 1)[0]);
      break;
  }
  while (aa.length > 0) {
    const dividend = aa.splice();
  }
};

/**
 * Purge the leading zeros of an array of digits.
 * @param a
 * @returns
 */
const purgeZeros = (a: number[]) => {
  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] !== 0) {
      a.length = i + 1;
      return a;
    }
  }
  // if every digit is zero, return a single zero
  a.length = 1;
  return a;
};
// #endregion

/**
 * NBase is a class for n-base numeral system
 */
export class NBaseInteger {
  // # Creation
  /**
   * Create an NBaseInteger with default charsets
   * - default charsets is '0-9A-Za-z'
   * @param n 10-number
   * @param base
   */
  static from(n: number, base: number): NBaseInteger;
  /**
   * Create an NBaseInteger with custom charsets
   * - `charset.length` will be the `base`
   * @param n 10-number
   * @param charset
   */
  static from(n: number, charset: string): NBaseInteger;
  static from(n: number, arg: number | string): NBaseInteger {
    safeInt(n);

    // create with default charset
    if (typeof arg === 'number') {
      const base = safeInt(arg);
      if (base <= 1) {
        throw new RangeError(`Base must >= 1.`);
      }
      const dc = charsets.default;
      if (base > dc.length) {
        throw new RangeError(
          `Given base > ${dc.length}. Default charset is not enough, either set it or specify another charset.`
        );
      }
      return new NBaseInteger(flag, n, base, dc);
    }

    // create with custom charset
    if (typeof arg === 'string') {
      const charset = safeCharset(arg);
      return new NBaseInteger(flag, n, charset.length, charsets.get(charset));
    }

    throw new TypeError('Expect 2nd parameter to be a base or a charset.');
  }

  /**
   * Get the default charset for NBaseInteger.
   */
  static get charset() {
    return charsets.default.join('');
  }

  /**
   * Set the default charset for NBaseInteger.
   */
  static set charset(charset: string) {
    charset = safeCharset(charset);
    if (charset.length > MAX_BASE) {
      throw new RangeError(`Default charset length should less than ${MAX_BASE}.`);
    }
    charsets.setDefault(charset);
  }

  /**
   * Clone an NBaseInteger instance.
   * @param priv Internal symbol for access control.
   * @param a The instance to clone.
   */
  static #clone(a: NBaseInteger): NBaseInteger {
    const clone = new NBaseInteger(flag, a.sign, a.#base, a.#charset);
    clone.#digits = a.#digits.slice();
    return clone;
  }

  /**
   * Ensure argument is a valid NBaseInteger or number.
   * - will create an NBaseInteger when `arg` is a number.
   * - will return `arg` directly when it is already an NBaseInteger
   * @param priv Internal symbol for access control.
   * @param arg The argument to check.
   * @param clone Whether to clone the instance.
   */
  #safeOther(arg: number | NBaseInteger): NBaseInteger {
    // b is a normal number
    if (typeof arg === 'number') {
      const n = safeInt(arg);
      return new NBaseInteger(flag, n, this.#base, this.#charset);
    }

    // b is also an NBaseInteger
    if (arg instanceof NBaseInteger) {
      const nbi = arg;
      if (nbi.#base !== this.#base) {
        throw new TypeError(`Called with a ${NAME} with different base.`);
      }

      /**
       * & This works because each charset string will map to a charset array.
       * & So if there strings are equal, their arrays would be equal too.
       * @see ./common.ts -- charsetMap
       */
      if (nbi.#charset !== this.#charset) {
        throw new TypeError(`Called with a ${NAME} with different charset.`);
      }
      return nbi;
    }
    throw new TypeError(`Called with an invalid argument. Expected number or ${NAME}.`);
  }

  // #region properties
  readonly #base: number;
  readonly #charset: readonly string[];

  #digits: number[];

  /**
   * Note zero is positive
   */
  #negative = false;

  get base(): number {
    return this.#base;
  }

  get charset(): string {
    return this.#charset.join('');
  }

  get isZero(): boolean {
    return this.#digits.length === 1 && this.#digits[0] === 0;
  }

  get isOdd(): boolean {
    if (this.#base % 2 === 0) {
      return this.#digits[0] % 2 === 1;
    }
    let x = this.#digits[0] % 2;
    for (let i = 0; i < this.#digits.length; i++) {
      x ^= this.#digits[i] % 2;
    }
    return x === 1;
  }

  get isEven(): boolean {
    if (this.#base % 2 === 0) {
      return this.#digits[0] % 2 === 0;
    }
    let x = this.#digits[0] % 2;
    for (let i = 0; i < this.#digits.length; i++) {
      x ^= this.#digits[i] % 2;
    }
    return x === 0;
  }

  get sign(): -1 | 1 {
    return this.#negative ? -1 : 1;
  }
  // #endregion

  // #region constructor
  constructor(priv: symbol, n: number, base: number, charset: readonly string[]) {
    protect(priv, `The constructor of ${NAME} is protected, please use ${NAME}.from instead.`);

    // assign essential properties
    this.#base = base;
    this.#charset = charset;
    if (n < 0) {
      n = -n;
      this.#negative = true;
    }

    if (n < base) {
      this.#digits = [n];
      return;
    }

    // creating
    this.#digits = [];
    do {
      this.#digits.push(n % base);
      n = Math.floor(n / base);
    } while (n > 0);
  }
  // #endregion

  // # Calculations. Ensure bases and charsets are same, then call this
  // #region add/sub
  /**
   * This functions means `b = a + b`
   * - `a.#digits` is copied, so it is safe to call like `a.add(a)`.
   * @param priv Internal symbol for access control.
   * @param a The first operand.
   * @param b The second operand (result stored here).
   */
  static #addAToB(a: NBaseInteger, b: NBaseInteger): NBaseInteger {
    const ad = a.#digits.slice();
    const bd = b.#digits; // because b will change, there is no need to slice.
    const base = a.base;

    // same sign, add them directly
    if (a.#negative === b.#negative) {
      b.#digits = plus(ad, bd, base);
      return b;
    }

    // now a b has different signs, we need to judge the sign first
    // only `greater - less` can be calculated
    switch (cmp(ad, bd)) {
      case Ordering.Equal:
        // & means a = -b, then a + b = 0
        b.#negative = false; // zero is considered positive
        b.#digits.length = 1;
        b.#digits[0] = 0;
        break;
      case Ordering.Greater:
        // & means |a| > |b|, then a + b = sgn(a)(|a| - |b|)
        b.#negative = a.#negative; // |a| is greater, so sign must be same as a
        b.#digits = minus(ad, bd, base);
        break;
      case Ordering.Less:
        // & means |b| > |a|, then a + b = sgn(b)(|b| - |a|)
        b.#digits = minus(bd, ad, base);
        break;
    }
    return b;
  }

  add(nbi: NBaseInteger): NBaseInteger;
  add(n: number): NBaseInteger;
  add(arg: number | NBaseInteger): NBaseInteger {
    const other = NBaseInteger.#clone(this.#safeOther(arg));
    return NBaseInteger.#addAToB(this, other);
  }

  addAssign(nbi: NBaseInteger): NBaseInteger;
  addAssign(n: number): NBaseInteger;
  addAssign(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg);
    return NBaseInteger.#addAToB(other, this);
  }

  sub(nbi: NBaseInteger): NBaseInteger;
  sub(n: number): NBaseInteger;
  sub(arg: number | NBaseInteger): NBaseInteger {
    const other = NBaseInteger.#clone(this.#safeOther(arg));
    other.oppAssign();
    return NBaseInteger.#addAToB(this, other);
  }

  subAssign(nbi: NBaseInteger): NBaseInteger;
  subAssign(n: number): NBaseInteger;
  subAssign(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg);
    other.oppAssign();
    NBaseInteger.#addAToB(other, this);
    other.oppAssign();
    return this;
  }
  // #endregion

  // #region inrecment/decrement
  /**
   * Means `i++`
   * - equal to `i.addAssign(1)`
   */
  inc(): NBaseInteger {
    const d = this.#digits;
    if (d.length === 1 && d[0] === -1) {
      // if the number is -1, then it will become 0
      d[0] = 0;
      this.#negative = false; // set sign to positive
      return this;
    }

    if (this.#negative) {
      // negative numbers++ is like positive--
      this.#digits = minus(d, [1], this.#base);
    } else {
      this.#digits = plus(d, [1], this.#base);
    }
    return this;
  }

  /**
   * Means `i--`
   * - equal to `i.subAssign(1)`
   */
  dec(): NBaseInteger {
    const d = this.#digits;
    if (this.isZero) {
      this.#negative = true;
      d[0] = 1; // set to -1
      return this;
    }

    if (this.#negative) {
      // negative numbers-- is like positive++
      this.#digits = plus(d, [1], this.#base);
    } else {
      this.#digits = minus(d, [1], this.#base);
    }

    return this;
  }
  // #endregion

  // #region multiply
  /**
   * This functions means `b = a * b`
   * - `a.#digits` is copied, so it is safe to call like `a.mul(a)`.
   * @param priv Internal symbol for access control.
   * @param a The first operand.
   * @param b The second operand (result stored here).
   */
  static #mulAToB(a: NBaseInteger, b: NBaseInteger): NBaseInteger {
    const ad = a.#digits.slice();
    const bd = b.#digits; // because b will change, there is no need to slice.
    const base = a.base;

    // same sign -> positive
    b.#negative = a.#negative !== b.#negative;
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
    purgeZeros(bd);
    return b;
  }

  mul(nbi: NBaseInteger): NBaseInteger;
  mul(n: number): NBaseInteger;
  mul(arg: number | NBaseInteger): NBaseInteger {
    const other = NBaseInteger.#clone(this.#safeOther(arg));
    return NBaseInteger.#mulAToB(this, other);
  }

  mulAssgin(nbi: NBaseInteger): NBaseInteger;
  mulAssgin(n: number): NBaseInteger;
  mulAssgin(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg);
    return NBaseInteger.#mulAToB(other, this);
  }
  // #endregion

  // #region division
  divmod2(): NBaseIntegerDivResult {
    const base = this.#base;
    if (this.isZero) {
      return {
        quotient: new NBaseInteger(flag, 0, base, this.#charset),
        remainder: new NBaseInteger(flag, 0, base, this.#charset),
      };
    }

    // create a new NBaseInteger for the result
    const ad = this.#digits as readonly number[];

    // simple situations
    if (ad.length === 1) {
      const v = Math.floor(ad[0] / 2);
      const r = ad[0] - v * 2;
      return {
        quotient: new NBaseInteger(flag, v, base, this.#charset),
        remainder: new NBaseInteger(flag, r, base, this.#charset),
      };
    }

    const quotient = new NBaseInteger(flag, 0, base, this.#charset);
    // divide by 2
    let carry = 0;
    for (let i = ad.length - 1; i >= 0; i--) {
      const dividend = ad[i] + carry * base;
      const q = Math.floor(dividend / 2);
      carry = dividend - q * 2;
      quotient.#digits.unshift(q);
    }
    const remainder = new NBaseInteger(flag, carry, base, this.#charset);

    purgeZeros(quotient.#digits);
    return { quotient, remainder };
  }

  /**
   * a / b = q ... r
   */
  static #divAToB(a: NBaseInteger, b: NBaseInteger): NBaseIntegerDivResult {
    if (b.isZero) {
      throw new RangeError('Division by zero');
    }

    console.log(`${a.toString()} / ${b.toString()}`);

    const result = { quotient: b, remainder: new NBaseInteger(flag, 0, a.#base, a.#charset) };

    // div abs
    const ad = a.#digits.slice();
    const bd = b.#digits;
    const base = a.base;
    const resultNegative = a.#negative !== b.#negative;

    // simple situations
    switch (cmp(ad, bd)) {
      case Ordering.Equal:
        b.#negative = resultNegative;
        bd.length = 1;
        bd[0] = 1;
        return result;
      case Ordering.Less:
        // & |a| < |b|, then a / b = 0, r = a
        b.#negative = resultNegative;
        b.#digits.length = 1;
        bd[0] = 0;
        result.remainder.#digits = a.#digits.slice();
        return result;
      default:
        break;
    }

    // & Deal |a| > |b| here
    // approximate the quotient first
    const bq = bd.length + Math.log(bd[bd.length - 1]) / Math.log(base);

    let aq = 0;
    const logdiv = (arr: number[], base: number) => {
      const x = Math.floor(arr.length + Math.log(ad[arr.length - 1]) / Math.log(base));
      const y = base ** x;
    };

    let x = ad.length;
    for (let i = ad.length - 1; i >= 0; i--) {
      x += Math.log(ad[i]) / Math.log(base);
    }
    const delta = base ** (x - bq);
    console.log('delta', delta, 'approximated quotient', base ** delta);

    purgeZeros(b.#digits);
    return result;
  }

  divmod(nbi: NBaseInteger): NBaseIntegerDivResult;
  divmod(n: number): NBaseIntegerDivResult;
  divmod(arg: number | NBaseInteger): NBaseIntegerDivResult {
    const other = NBaseInteger.#clone(this.#safeOther(arg));
    const result = NBaseInteger.#divAToB(this, other);
    console.log(result);
    return result;
  }

  div(nbi: NBaseInteger): NBaseInteger;
  div(n: number): NBaseInteger;
  div(arg: number | NBaseInteger): NBaseInteger {
    const other = NBaseInteger.#clone(this.#safeOther(arg));
    const result = NBaseInteger.#divAToB(this, other);
    console.log(result);
    return result.quotient;
  }

  mod(nbi: NBaseInteger): NBaseInteger;
  mod(n: number): NBaseInteger;
  mod(arg: number | NBaseInteger): NBaseInteger {
    const other = NBaseInteger.#clone(this.#safeOther(arg));
    const result = NBaseInteger.#divAToB(this, other);
    console.log(result);
    return result.remainder;
  }

  // #endregion

  // #region power
  static #circularPow(a: NBaseInteger, exponent: NBaseInteger): NBaseInteger {
    const res = new NBaseInteger(flag, 1, a.#base, a.#charset);
    // handle some easy cases
    if (exponent.#digits.length === 1) {
      switch (exponent.#digits[0]) {
        case 0:
          return res;
        case 1:
          return res.mulAssgin(a);
        case 2:
          return res.mulAssgin(a).mulAssgin(a);
        case 3:
          return res.mulAssgin(a).mulAssgin(a).mulAssgin(a);
        default:
          break;
      }
    }

    const divResult = exponent.divmod2();
    exponent = divResult.quotient;
    if (!divResult.remainder.isZero) {
      res.mulAssgin(a);
    }

    const v = NBaseInteger.#circularPow(a, exponent);
    return res.mulAssgin(v).mulAssgin(v);
  }

  /**
   * Calculate a^b.
   * - 0^0 is considered as 1. Because in JS, 0**0 = 1
   * @param a The base.
   * @param b The exponent.
   */
  static #pow(a: NBaseInteger, b: NBaseInteger): NBaseInteger {
    if (b.#negative) {
      throw new RangeError('Exponent must be non-negative.');
    }
    if (b.isZero) {
      return new NBaseInteger(flag, 1, a.#base, a.#charset); // a^0 = 1
    }
    if (a.isZero) {
      return new NBaseInteger(flag, 0, a.#base, a.#charset); // a^0 = 1
    }

    // calculate
    const res = NBaseInteger.#circularPow(a, b);
    res.#negative = a.#negative && b.isOdd;
    return res;
  }

  static #circularPowWithNumber(a: NBaseInteger, exponent: number): NBaseInteger {
    const res = new NBaseInteger(flag, 1, a.#base, a.#charset);
    // handle some easy cases
    switch (exponent) {
      case 0:
        return res;
      case 1:
        return res.mulAssgin(a);
      case 2:
        return res.mulAssgin(a).mulAssgin(a);
      case 3:
        return res.mulAssgin(a).mulAssgin(a).mulAssgin(a);
      default:
        break;
    }

    const remainder = exponent % 2;
    exponent = (exponent - remainder) / 2;
    if (remainder === 1) {
      res.mulAssgin(a);
    }

    const v = NBaseInteger.#circularPowWithNumber(a, exponent);
    return res.mulAssgin(v).mulAssgin(v);
  }

  /**
   * Calculate a^b.
   * - 0^0 is considered as 1. Because in JS, 0**0 = 1
   * @param a The base.
   * @param b The exponent.
   */
  static #powWithNumber(a: NBaseInteger, b: number): NBaseInteger {
    if (b < 0) {
      throw new RangeError('Exponent must be non-negative.');
    }
    b = safeInt(b);
    if (b === 0) {
      return new NBaseInteger(flag, 1, a.#base, a.#charset); // a^0 = 1
    }
    if (a.isZero) {
      return new NBaseInteger(flag, 0, a.#base, a.#charset); // a^0 = 1
    }

    // calculate
    const res = NBaseInteger.#circularPowWithNumber(a, b);
    res.#negative = a.#negative && b % 2 === 1;
    return res;
  }

  pow(nbi: NBaseInteger): NBaseInteger;
  pow(n: number): NBaseInteger;
  pow(arg: number | NBaseInteger): NBaseInteger {
    if (typeof arg === 'number') {
      return NBaseInteger.#powWithNumber(this, arg);
    }
    if (arg instanceof NBaseInteger) {
      return NBaseInteger.#pow(this, arg);
    }

    throw new TypeError(`Exponent should be a number or ${NAME}.`);
  }
  // #endregion

  // #region signs
  oppAssign() {
    this.#negative = !this.#negative;
    return this;
  }

  negAssign() {
    this.#negative = true;
    return this;
  }

  posAssign() {
    this.#negative = false;
    return this;
  }

  opp() {
    const b = NBaseInteger.#clone(this);
    b.#negative = !b.#negative;
    return b;
  }

  neg() {
    const b = NBaseInteger.#clone(this);
    b.#negative = true;
    return b;
  }

  pos() {
    const b = NBaseInteger.#clone(this);
    b.#negative = false;
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
  static #compare(a: NBaseInteger, b: NBaseInteger): Ordering {
    if (a === b) {
      return Ordering.Equal;
    }
    if (a.isZero && b.isZero) {
      return Ordering.Equal;
    }
    if (a.#negative !== b.#negative) {
      return a.#negative ? Ordering.Less : Ordering.Greater;
    }

    // know a and b have same sign
    const absCompareResult = cmp(a.#digits, b.#digits);

    // if a is negative, we need to reverse it
    if (a.#negative) {
      switch (absCompareResult) {
        case Ordering.Equal:
          return Ordering.Equal;
        case Ordering.Greater:
          return Ordering.Less;
        case Ordering.Less:
          return Ordering.Greater;
      }
    }

    return absCompareResult;
  }

  /**
   * Compare this instance with another.
   * @param priv Internal symbol for access control.
   * @param arg The value to compare with.
   */
  #cmp(arg: number | NBaseInteger): Ordering {
    const other = this.#safeOther(arg);
    return NBaseInteger.#compare(this, other);
  }

  /**
   * Compare this instance with another ignoring sign.
   * @param priv Internal symbol for access control.
   * @param arg The value to compare with.
   */
  #cmpAbs(arg: number | NBaseInteger): Ordering {
    const other = this.#safeOther(arg);
    return cmp(this.#digits, other.#digits);
  }

  eq(nbi: NBaseInteger): boolean;
  eq(n: number): boolean;
  eq(arg: number | NBaseInteger): boolean {
    return this.#cmp(arg) === Ordering.Equal;
  }

  ne(nbi: NBaseInteger): boolean;
  ne(n: number): boolean;
  ne(arg: number | NBaseInteger): boolean {
    return this.#cmp(arg) !== Ordering.Equal;
  }

  gt(nbi: NBaseInteger): boolean;
  gt(n: number): boolean;
  gt(arg: number | NBaseInteger): boolean {
    return this.#cmp(arg) === Ordering.Greater;
  }

  gte(nbi: NBaseInteger): boolean;
  gte(n: number): boolean;
  gte(arg: number | NBaseInteger): boolean {
    const o = this.#cmp(arg);
    return o === Ordering.Greater || o === Ordering.Equal;
  }

  lt(nbi: NBaseInteger): boolean;
  lt(n: number): boolean;
  lt(arg: number | NBaseInteger): boolean {
    return this.#cmp(arg) === Ordering.Less;
  }

  lte(nbi: NBaseInteger): boolean;
  lte(n: number): boolean;
  lte(arg: number | NBaseInteger): boolean {
    const o = this.#cmp(arg);
    return o === Ordering.Less || o === Ordering.Equal;
  }

  eqAbs(nbi: NBaseInteger): boolean;
  eqAbs(n: number): boolean;
  eqAbs(arg: number | NBaseInteger): boolean {
    return this.#cmpAbs(arg) === Ordering.Equal;
  }

  neAbs(nbi: NBaseInteger): boolean;
  neAbs(n: number): boolean;
  neAbs(arg: number | NBaseInteger): boolean {
    return this.#cmpAbs(arg) !== Ordering.Equal;
  }

  gtAbs(nbi: NBaseInteger): boolean;
  gtAbs(n: number): boolean;
  gtAbs(arg: number | NBaseInteger): boolean {
    return this.#cmpAbs(arg) === Ordering.Greater;
  }

  gteAbs(nbi: NBaseInteger): boolean;
  gteAbs(n: number): boolean;
  gteAbs(arg: number | NBaseInteger): boolean {
    const o = this.#cmpAbs(arg);
    return o === Ordering.Greater || o === Ordering.Equal;
  }

  ltAbs(nbi: NBaseInteger): boolean;
  ltAbs(n: number): boolean;
  ltAbs(arg: number | NBaseInteger): boolean {
    return this.#cmpAbs(arg) === Ordering.Less;
  }

  lteAbs(nbi: NBaseInteger): boolean;
  lteAbs(n: number): boolean;
  lteAbs(arg: number | NBaseInteger): boolean {
    const o = this.#cmpAbs(arg);
    return o === Ordering.Less || o === Ordering.Equal;
  }
  // #endregion

  // #region others
  clone() {
    return NBaseInteger.#clone(this);
  }

  toString(): string {
    const abs = this.#digits
      .map((digit) => this.charset[digit])
      .reverse()
      .join('');
    return `${this.#negative ? '-' : ''}${abs}`;
  }

  // # test
  // todo remove this from production code
  get data() {
    return {
      w: 'test only method',
      base: this.#base,
      digits: this.#digits.slice(),
      negative: this.#negative,
      charsets: this.#charset.slice(),
    };
  }
  // #endregion
}
