import { Ordering, MAX_BASE, CLASS_NAME, Flag } from './consts';
import { charsets, unshift0 } from './common';
import { expect, protect, safeCharset, safeInt } from './expect';

interface NBaseIntegerDivResult {
  quotient: NBaseInteger;
  remainder: NBaseInteger;
}

interface PrimitiveDivResult {
  quotient: number[];
  remainder: number[];
}

// #region primitive functions
/**
 * Checking if `n` only have chars in `charset`
 *
 * ! ONLY use when `base` and `charset` is valid
 * - `base` <= `charset.length`
 * - `charset` has no duplicate chars
 * - Numbers like '00124' will be purged to '124'
 */
const parse = (n: string, base: number, charset: readonly string[]): number[] => {
  const map: Record<string, number> = {};
  for (let i = 0; i < base; i++) {
    map[charset[i]] = i;
  }

  const digits: number[] = [];
  const narr = Array.from(n); // use Array.from to support emoji chars
  for (let i = narr.length - 1; i >= 0; i--) {
    const digit = map[narr[i]];
    // Cannot use `!digit` for it might be `!0`
    if (digit === undefined) {
      throw new Error(
        `Parsing failed, unknown char '${narr[i]}' in '${n}' with charset = ${charset.join()}.`
      );
    }
    digits.push(digit);
  }

  return purgeZeros(digits);
};

const isZero = (a: readonly number[]): boolean => a.length === 1 && a[0] === 0;

const cmp = (a: readonly number[], b: readonly number[]): Ordering => {
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

// #region arithmetic functions
const plus = (a: readonly number[], b: readonly number[], base: number): number[] => {
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
 * ! ONLY use when a > b
 */
const minus = (a: readonly number[], b: readonly number[], base: number): number[] => {
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

const multiply = (a: readonly number[], b: readonly number[], base: number): number[] => {
  const rows: number[][] = [];
  let maxRowLen = 0;
  for (let i = 0; i < a.length; i++) {
    const row: number[] = new Array(i); // create a row for the result
    row.fill(0); // fill with zeros
    rows.push(row);
    let carry = 0;
    const ai = a[i];
    for (let j = 0; j < b.length; j++) {
      const v = ai * b[j] + carry;
      row.push(v % base); // store the result in b
      carry = Math.floor(v / base); // calculate the carry
    }
    if (carry > 0) {
      row.push(carry);
    }
    maxRowLen = Math.max(maxRowLen, row.length);
  }

  // add all rows together
  const result: number[] = [];
  {
    let carry = 0;
    for (let i = 0; i < maxRowLen; i++) {
      let v = carry;
      for (let j = 0; j < rows.length; j++) {
        v += rows[j][i] ?? 0;
      }
      carry = Math.floor(v / base);
      result[i] = v % base;
    }
    if (carry > 0) {
      result.push(carry);
    }
  }
  purgeZeros(result);
  return result;
};

/**
 * Calculate a / b
 *
 * * Can be used without considering a >，= or < b
 *
 *    ___13____
 *  13) 170
 *      13
 *       40
 *       39
 *        1
 * So 170 / 13 = 13 ... 1
 */
const divide = (a: readonly number[], b: readonly number[], base: number): PrimitiveDivResult => {
  // Since a > b, ensuring base > b(b has only 1 digit) would enables us to use `divideSmall`
  if (b.length === 1) {
    if (b[0] === 1) {
      return {
        quotient: a.slice(),
        remainder: [0],
      };
    }
    return divideSmall(a, b[0], base);
  }

  // move this length to use vertical expression

  const aa = a.slice();
  const quo: number[] = [];
  let carry = [0];
  do {
    // one digit at a time
    const dividend = isZero(carry)
      ? aa.splice(aa.length - 1, 1)
      : aa.splice(aa.length - 1, 1).concat(carry);

    // start from high rank
    switch (cmp(dividend, b)) {
      case Ordering.Equal:
        // set carry to zero
        carry.length = 1;
        carry[0] = 0;
        quo.unshift(1);
        break;
      case Ordering.Greater:
        // calculate [...]/[...] or [...,1]/[...]
        {
          const qr = binarySearchQuotient(dividend, b, base);
          quo.unshift(qr.quotient);
          carry = qr.remainder;
        }
        break;
      case Ordering.Less:
        unshift0(quo, 1);
        // & already nothing left but still need to chop
        if (aa.length === 0) {
          // if we have no more digits to chop, we are done
          return {
            quotient: quo.length === 0 ? [0] : quo,
            remainder: dividend,
          };
        }
        // chop another digit and try again
        carry = dividend;
        break;
    }
  } while (aa.length > 0);

  // purgeZeros(quo);
  // purgeZeros(carry);
  return { quotient: quo, remainder: carry };
};

/**
 * Calculate a / b
 *
 * ! ONLY use when a > b and base > b(b has only 1 digit).
 */
const divideSmall = (a: readonly number[], b: number, base: number): PrimitiveDivResult => {
  let carry = 0;
  const result: number[] = [];
  for (let i = a.length - 1; i >= 0; i--) {
    const v = a[i] + carry * base;
    result.unshift(Math.floor(v / b));
    carry = v % b;
  }
  purgeZeros(result);
  return { quotient: result, remainder: [carry] };
};

/**
 * Use binary search to get the quotient of a / b
 *
 * ! ONLY use when a / b is between 1 to base - 1.
 *
 * This causes quotient is a one digit number under base `base`.
 * So it returns quotient as a `number`, not `number[]`
 */
const binarySearchQuotient = (
  a: readonly number[],
  b: readonly number[],
  base: number
): { quotient: number; remainder: number[] } => {
  // & we should always have prev >= cur
  let lower = 1;
  let upper = base - 1;
  while (true) {
    // if lower and upper is close to each other
    // iterate them
    if (upper - lower <= 3) {
      for (let i = lower; i <= upper; i++) {
        const dividend = multiply(b, [i], base);
        const r = minus(a, dividend, base);
        if (cmp(r, b) === Ordering.Less) {
          return { quotient: i, remainder: r };
        }
      }
      throw new Error(`Cannot find a quotient for a / b, b: ${b.join('')}, a: ${a.join('')}.`);
    }

    const quo = Math.floor((lower + upper) / 2);
    const dividend = multiply(b, [quo], base);
    // & must have a >= q and a - q < b
    switch (cmp(a, dividend)) {
      case Ordering.Equal:
        return { quotient: quo, remainder: [0] };
      case Ordering.Less:
        upper = quo - 1;
        break;
      case Ordering.Greater:
        {
          const r = minus(a, dividend, base);
          if (cmp(r, b) === Ordering.Less) {
            return { quotient: quo, remainder: r };
          }
          lower = quo + 1;
        }
        break;
    }
  }
};

// #endregion

const pow = (a: readonly number[], exponent: number[], base: number): number[] => {
  const product: number[] = [];
  // handle some easy cases
  if (exponent.length === 1) {
    switch (exponent[0]) {
      case 0:
        return product;
      case 1:
        return a.slice();
      case 2:
        return multiply(a, a, base);
      case 3:
        return multiply(a, multiply(a, a, base), base);
      default:
        break;
    }
  }

  const qr = base === 2 ? divide(exponent, [0, 1], 2) : divideSmall(exponent, 2, base);
  const v = pow(a, qr.quotient, base);
  if (isZero(qr.remainder)) {
    return multiply(v, v, base);
  } else {
    return multiply(v, multiply(v, a, base), base);
  }
};

const powWith10Base = (a: readonly number[], exponent: number, base: number): number[] => {
  // handle some easy cases
  switch (exponent) {
    case 0:
      return [1];
    case 1:
      return a.slice();
    case 2:
      return multiply(a, a, base);
    case 3:
      return multiply(a, multiply(a, a, base), base);
    default:
      break;
  }

  const remainder = exponent % 2;
  exponent = (exponent - remainder) / 2;
  const v = powWith10Base(a, exponent, base);
  if (remainder === 0) {
    return multiply(v, v, base);
  } else {
    return multiply(v, multiply(v, a, base), base);
  }
};

/**
 * Purge the leading zeros of an array of digits.
 * @param a
 * @returns
 */
const purgeZeros = (a: number[]): number[] => {
  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] !== 0) {
      a.length = i + 1;
      return a;
    }
  }
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
   * Factory method for creating NBaseInteger instances via Proxy.
   */
  static [Flag.CREATOR](priv: symbol, ...args: (string | number)[]): NBaseInteger {
    protect(priv);
    expect(args.length <= 3, `To many arguments for ${CLASS_NAME}(...args).`);
    const [n, base, charset] = args;
    // basic asserts
    switch (args.length) {
      case 0:
        throw new Error(`${CLASS_NAME}(...args) does not have enough arguments.`);
      case 3:
        expect(typeof charset === 'string', `'charset' must be a string with length >= 2.`);
      // eslint-disable-next-line no-fallthrough
      case 2:
        expect(
          Number.isSafeInteger(base) && 2 <= (base as number) && (base as number) <= MAX_BASE,
          `'base' must be an integer from 2 to ${MAX_BASE}.`
        );
      // eslint-disable-next-line no-fallthrough
      case 1:
        expect(
          Number.isSafeInteger(n) || (typeof n === 'string' && /^[-]{0,1}[^-]+$/.test(n)),
          `'n' must be an integer or a string.`
        );
        break;
      default:
        throw new Error(`To many arguments for ${CLASS_NAME}(...args).`);
    }

    /**
     * After assertion, now we have
     * - arg0  is an integer or a string with length > 0
     * - arg1? is an integer from 2 to MAX_BASE
     * - arg2? is a string with length >= 2
     */

    // & Now we need to do further checks
    let _charset = charsets.default;
    let _base = 10;

    switch (args.length) {
      case 3: {
        const charsetArr = safeCharset(charset as string);
        expect(
          charsetArr.length >= (base as number),
          `Charset length(${charsetArr.length}) must > base(${base}).`
        );
        _charset = charsets.get(charset as string, charsetArr);
        _base = base as number;
      }
      // eslint-disable-next-line no-fallthrough
      case 2:
        _base = base as number;
      // eslint-disable-next-line no-fallthrough
      case 1:
        if (typeof n === 'number') {
          return new NBaseInteger(Flag.PRIVATE, n, _base, _charset);
        } else {
          const a = new NBaseInteger(Flag.PRIVATE, 0, _base, _charset);
          // & About `n` whether contains unknown chars will be checked in `parse`
          a.#digits = parse(n.replace('-', ''), _base, _charset);
          if (!a.isZero && n[0] === '-') {
            a.#negative = true;
          }
          return a;
        }
    }
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
    const charsetArr = safeCharset(charset);
    if (charsetArr.length > MAX_BASE) {
      throw new RangeError(`Default charset length should less than ${MAX_BASE}.`);
    }
    charsets.setDefault(charset, charsetArr);
  }

  /**
   * Ensure argument is a valid NBaseInteger or number. Optionally clone.
   * @param arg The argument to check.
   * @param clone Whether to clone the instance.
   */
  #safeOther(arg: number | NBaseInteger, clone?: symbol): NBaseInteger {
    // b is a normal number
    if (typeof arg === 'number') {
      const n = safeInt(arg);
      return new NBaseInteger(Flag.PRIVATE, n, this.#base, this.#charset);
    }

    // b is also an NBaseInteger
    if (arg instanceof NBaseInteger) {
      const n = arg;
      if (n.#base !== this.#base) {
        throw new TypeError(`Called with a ${CLASS_NAME} with different base.`);
      }

      /**
       * & This works because each charset string will map to a charset array.
       * & So if there strings are equal, their arrays would be equal too.
       * @see ./common.ts -- charsetMap
       */
      if (n.#charset !== this.#charset) {
        throw new TypeError(`Called with a ${CLASS_NAME} with different charset.`);
      }
      return clone === Flag.CLONE ? n.clone() : n;
    }
    throw new TypeError(`Called with an invalid argument. Expected number or ${CLASS_NAME}.`);
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

  /**
   * `true` if the number is zero.
   */
  get isZero(): boolean {
    return isZero(this.#digits);
  }

  /**
   * `true` if the number is odd.
   */
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

  /**
   * `true` if the number is even.
   */
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

  /**
   * Returns the sign of the number: `-1`, `0`, or `1`.
   * - Same as `sgn(x)` in math.
   */
  get sgn(): -1 | 0 | 1 {
    if (this.#negative) {
      return -1;
    }
    if (this.isZero) {
      return 0; // zero is considered positive
    }
    return 1;
  }
  // #endregion

  // #region constructor
  /**
   * Protected constructor. Use factory methods to create instances.
   */
  constructor(priv: symbol, n: number, base: number, charset: readonly string[]) {
    protect(
      priv,
      `The constructor of ${CLASS_NAME} is protected, please use ${CLASS_NAME}(...args) instead.`
    );

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
   * Adds a to b and stores the result in b.
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
        b.zero();
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

  /**
   * Returns the sum of `this` and the argument.
   * @param n The number to add.
   */
  add(n: NBaseInteger): NBaseInteger;
  /**
   * Returns the sum of `this` and the argument.
   * @param n The number to add.
   */
  add(n: number): NBaseInteger;
  /**
   * Returns the sum of `this` and the argument.
   * @param arg The number or NBaseInteger to add.
   */
  add(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg, Flag.CLONE);
    return NBaseInteger.#addAToB(this, other);
  }

  /**
   * Adds the argument to `this` in place.
   * @param n The number to add.
   */
  addAssign(n: NBaseInteger): NBaseInteger;
  /**
   * Adds the argument to `this` in place.
   * @param n The number to add.
   */
  addAssign(n: number): NBaseInteger;
  /**
   * Adds the argument to `this` in place.
   * @param arg The number or NBaseInteger to add.
   */
  addAssign(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg);
    return NBaseInteger.#addAToB(other, this);
  }

  /**
   * Returns the result of `this` minus the argument.
   * @param n The number to subtract.
   */
  sub(n: NBaseInteger): NBaseInteger;
  /**
   * Returns the result of `this` minus the argument.
   * @param n The number to subtract.
   */
  sub(n: number): NBaseInteger;
  /**
   * Returns the result of `this` minus the argument.
   * @param arg The number or NBaseInteger to subtract.
   */
  sub(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg, Flag.CLONE);
    other.negateAssign();
    return NBaseInteger.#addAToB(this, other);
  }

  /**
   * Subtracts the argument from `this` in place.
   * @param n The number to subtract.
   */
  subAssign(n: NBaseInteger): NBaseInteger;
  /**
   * Subtracts the argument from `this` in place.
   * @param n The number to subtract.
   */
  subAssign(n: number): NBaseInteger;
  /**
   * Subtracts the argument from `this` in place.
   * @param arg The number or NBaseInteger to subtract.
   */
  subAssign(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg);
    other.negateAssign();
    NBaseInteger.#addAToB(other, this);
    other.negateAssign();
    return this;
  }
  // #endregion

  // #region inrecment/decrement
  /**
   * Increments `this` by 1 in place.
   */
  inc(): NBaseInteger {
    const d = this.#digits;
    if (d.length === 1 && d[0] === -1) {
      // if the number is -1, then it will become 0
      return this.zero();
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
   * Decrements `this` by 1 in place.
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
   * Multiplies a and b and stores the result in b.
   * @param a The first operand.
   * @param b The second operand (result stored here).
   */
  static #mulAToB(a: NBaseInteger, b: NBaseInteger): NBaseInteger {
    b.#negative = a.#negative !== b.#negative;
    b.#digits = multiply(a.#digits, b.#digits, a.#base);
    return b;
  }

  /**
   * Returns the product of `this` and the argument.
   * @param n The number to multiply.
   */
  mul(n: NBaseInteger): NBaseInteger;
  /**
   * Returns the product of `this` and the argument.
   * @param n The number to multiply.
   */
  mul(n: number): NBaseInteger;
  /**
   * Returns the product of `this` and the argument.
   */
  mul(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg, Flag.CLONE);
    return NBaseInteger.#mulAToB(this, other);
  }

  /**
   * Multiplies `this` by the argument in place.
   * @param n The number to multiply.
   */
  mulAssgin(n: NBaseInteger): NBaseInteger;
  /**
   * Multiplies `this` by the argument in place.
   * @param n The number to multiply.
   */
  mulAssgin(n: number): NBaseInteger;
  /**
   * Multiplies `this` by the argument in place.
   */
  mulAssgin(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg);
    return NBaseInteger.#mulAToB(other, this);
  }
  // #endregion

  // #region division
  /**
   * Divides `this` by 2 and returns quotient and remainder.
   */
  divmod2(): NBaseIntegerDivResult {
    const base = this.#base;
    if (this.isZero) {
      return {
        quotient: new NBaseInteger(Flag.PRIVATE, 0, base, this.#charset),
        remainder: new NBaseInteger(Flag.PRIVATE, 0, base, this.#charset),
      };
    }

    // create a new NBaseInteger for the result
    const ad = this.#digits as readonly number[];

    // simple situations
    if (ad.length === 1) {
      const v = Math.floor(ad[0] / 2);
      const r = ad[0] - v * 2;
      return {
        quotient: new NBaseInteger(Flag.PRIVATE, v, base, this.#charset),
        remainder: new NBaseInteger(Flag.PRIVATE, r, base, this.#charset),
      };
    }

    const quotient = new NBaseInteger(Flag.PRIVATE, 0, base, this.#charset);
    // divide by 2
    let carry = 0;
    for (let i = ad.length - 1; i >= 0; i--) {
      const dividend = ad[i] + carry * base;
      const q = Math.floor(dividend / 2);
      carry = dividend - q * 2;
      quotient.#digits.unshift(q);
    }
    const remainder = new NBaseInteger(Flag.PRIVATE, carry, base, this.#charset);

    purgeZeros(quotient.#digits);
    return { quotient, remainder };
  }

  /**
   * Divides a by b and returns quotient and remainder.
   * @param a The dividend.
   * @param b The divisor.
   */
  static #divAToB(a: NBaseInteger, b: NBaseInteger): NBaseIntegerDivResult {
    if (b.isZero) {
      throw new RangeError('Division by zero');
    }
    if (a.isZero) {
      b.zero();
      return { quotient: b, remainder: new NBaseInteger(Flag.PRIVATE, 0, a.#base, a.#charset) };
    }

    const result = {
      quotient: b,
      remainder: new NBaseInteger(Flag.PRIVATE, 0, a.#base, a.#charset),
    };
    const qr = divide(a.#digits, b.#digits, a.#base);
    b.#digits = qr.quotient;
    b.#negative = a.#negative !== b.#negative;
    result.remainder.#digits = qr.remainder;
    return result;
  }

  /**
   * Returns the quotient and remainder of this divided by the argument.
   * @param n The divisor.
   */
  divmod(n: NBaseInteger): NBaseIntegerDivResult;
  /**
   * Returns the quotient and remainder of this divided by the argument.
   * @param n The divisor.
   */
  divmod(n: number): NBaseIntegerDivResult;
  /**
   * Returns the quotient and remainder of this divided by the argument.
   */
  divmod(arg: number | NBaseInteger): NBaseIntegerDivResult {
    const other = this.#safeOther(arg, Flag.CLONE);
    const result = NBaseInteger.#divAToB(this, other);
    return result;
  }

  /**
   * Returns the quotient of this divided by the argument.
   * - the quotient is `Math.floor(this / n)`.
   * - the remainder is `this - n * quotient`.
   * @param n The divisor.
   */
  div(n: NBaseInteger): NBaseInteger;
  /**
   * Returns the quotient of this divided by the argument.
   * - the quotient is Math.floor(this / n).
   * - the remainder is `this - n * quotient`.
   * @param n The divisor.
   */
  div(n: number): NBaseInteger;
  /**
   * Returns the quotient of this divided by the argument.
   */
  div(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg, Flag.CLONE);
    const result = NBaseInteger.#divAToB(this, other);
    return result.quotient;
  }

  /**
   * Divides `this` by the argument in place.
   * - the quotient is Math.floor(this / n).
   * - ignores the remainder.
   * @param n The divisor.
   */
  divAssign(n: NBaseInteger): NBaseInteger;
  /**
   * Divides `this` by the argument in place.
   * - the quotient is Math.floor(this / n).
   * - ignores the remainder.
   * @param n The divisor.
   */
  divAssign(n: number): NBaseInteger;
  /**
   * Divides `this` by the argument in place.
   */
  divAssign(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg, Flag.CLONE);
    const result = NBaseInteger.#divAToB(this, other);
    this.#digits = result.quotient.#digits;
    this.#negative = result.quotient.#negative;
    return this;
  }

  /**
   * Returns the remainder of this divided by the argument.
   * - the quotient is Math.floor(this / n).
   * - the remainder is `this - n * quotient`.
   * @param n The divisor.
   */
  mod(n: NBaseInteger): NBaseInteger;
  /**
   * Returns the remainder of this divided by the argument.
   * - the quotient is Math.floor(this / n).
   * - the remainder is `this - n * quotient`.
   * @param n The divisor.
   */
  mod(n: number): NBaseInteger;
  mod(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg, Flag.CLONE);
    const result = NBaseInteger.#divAToB(this, other);
    return result.remainder;
  }

  /**
   * Sets `this` to the remainder of division by the argument.
   * - the quotient is Math.floor(this / n).
   * - the remainder is `this - n * quotient`.
   * @param n The divisor.
   */
  modAssign(n: NBaseInteger): NBaseInteger;
  /**
   * Sets `this` to the remainder of division by the argument.
   * - the quotient is Math.floor(this / n).
   * - the remainder is `this - n * quotient`.
   * @param n The divisor.
   */
  modAssign(n: number): NBaseInteger;
  modAssign(arg: number | NBaseInteger): NBaseInteger {
    const other = this.#safeOther(arg, Flag.CLONE);
    const result = NBaseInteger.#divAToB(this, other);
    this.#digits = result.remainder.#digits;
    this.#negative = result.remainder.#negative;
    return this;
  }
  // #endregion

  // #region power
  /**
   * Calculates a^b for two NBaseInteger instances.
   * @param a The base.
   * @param b The exponent.
   */
  static #pow(a: NBaseInteger, b: NBaseInteger): NBaseInteger {
    const result = new NBaseInteger(Flag.PRIVATE, 0, a.#base, a.#charset);
    result.#digits = pow(a.#digits, b.#digits, a.#base);
    result.#negative = a.#negative && b.isOdd;
    return result;
  }

  /**
   * Calculates a^b for NBaseInteger and number exponent.
   * @param a The base.
   * @param b The exponent in 10-base.
   */
  static #powWith10Base(a: NBaseInteger, b: number): NBaseInteger {
    const result = new NBaseInteger(Flag.PRIVATE, 0, a.#base, a.#charset);
    result.#digits = powWith10Base(a.#digits, b, a.#base);
    result.#negative = a.#negative && b % 2 === 1;
    return result;
  }

  /**
   * Calculates `this` raised to the power of `n`.
   */
  pow(exponent: NBaseInteger): NBaseInteger;
  /**
   * Calculates `this` raised to the power of `n`.
   */
  pow(exponent: number): NBaseInteger;
  pow(arg: number | NBaseInteger): NBaseInteger {
    if (typeof arg === 'number') {
      const b = safeInt(arg);
      if (b < 0) {
        throw new RangeError('Exponent must be non-negative.');
      }
      if (b === 0) {
        return new NBaseInteger(Flag.PRIVATE, 1, this.#base, this.#charset); // a^0 = 1
      }
      if (this.isZero) {
        return new NBaseInteger(Flag.PRIVATE, 0, this.#base, this.#charset); // a^0 = 1
      }
      return NBaseInteger.#powWith10Base(this, arg);
    }

    if (arg instanceof NBaseInteger) {
      const b = this.#safeOther(arg);
      if (b.#negative) {
        throw new RangeError('Exponent must be non-negative.');
      }
      if (b.isZero) {
        return new NBaseInteger(Flag.PRIVATE, 1, this.#base, this.#charset); // a^0 = 1
      }
      if (this.isZero) {
        return new NBaseInteger(Flag.PRIVATE, 0, this.#base, this.#charset); // a^0 = 1
      }
      return NBaseInteger.#pow(this, arg);
    }

    throw new TypeError(`Exponent should be a number or ${CLASS_NAME}.`);
  }

  // #endregion

  // #region signs
  /**
   * Sets the sign of `this`.
   * @param sgn The sign to set (-1, 0, or 1).
   */
  setSign(sgn: -1 | 0 | 1): NBaseInteger {
    switch (sgn) {
      case -1:
        if (this.isZero) {
          throw new RangeError('Cannot set sign of zero to negative.');
        }
        this.#negative = true;
        break;
      case 1:
        this.#negative = false;
        break;
      case 0:
        this.zero();
        break;
      default:
        throw new TypeError(`Invalid sign: ${sgn}. Expected -1, 0 or 1.`);
        break;
    }
    return this;
  }

  /**
   * Returns the additive inverse of this number.
   */
  negate(): NBaseInteger {
    const other = this.clone();
    if (!other.isZero) {
      other.#negative = !other.#negative;
    }
    return other;
  }

  /**
   * Negates `this` in place.
   */
  negateAssign(): NBaseInteger {
    if (!this.isZero) {
      this.#negative = !this.#negative;
    }
    return this;
  }

  /**
   * Returns the absolute value of this number.
   */
  abs(): NBaseInteger {
    const other = this.clone();
    other.#negative = false;
    return other;
  }

  /**
   * Sets `this` to its absolute value in place.
   */
  absAssign(): NBaseInteger {
    this.#negative = false;
    return this;
  }
  // #endregion

  // #region comparisons
  /**
   * Compares two NBaseInteger instances.
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
   * Compares `this` with another.
   * @param arg The value to compare with.
   */
  #cmp(arg: number | NBaseInteger): Ordering {
    const other = this.#safeOther(arg);
    return NBaseInteger.#compare(this, other);
  }

  /**
   * Compares `this` with another, ignoring sign.
   * @param arg The value to compare with.
   */
  #cmpAbs(arg: number | NBaseInteger): Ordering {
    const other = this.#safeOther(arg);
    return cmp(this.#digits, other.#digits);
  }

  cmp(n: NBaseInteger): -1 | 0 | 1;
  cmp(n: number): -1 | 0 | 1;
  cmp(arg: number | NBaseInteger): -1 | 0 | 1 {
    return this.#cmp(arg);
  }

  cmpAbs(n: NBaseInteger): -1 | 0 | 1;
  cmpAbs(n: number): -1 | 0 | 1;
  cmpAbs(arg: number | NBaseInteger): -1 | 0 | 1 {
    return this.#cmpAbs(arg);
  }

  eq(n: NBaseInteger): boolean;
  eq(n: number): boolean;
  eq(arg: number | NBaseInteger): boolean {
    return this.#cmp(arg) === Ordering.Equal;
  }

  ne(n: NBaseInteger): boolean;
  ne(n: number): boolean;
  ne(arg: number | NBaseInteger): boolean {
    return this.#cmp(arg) !== Ordering.Equal;
  }

  gt(n: NBaseInteger): boolean;
  gt(n: number): boolean;
  gt(arg: number | NBaseInteger): boolean {
    return this.#cmp(arg) === Ordering.Greater;
  }

  gte(n: NBaseInteger): boolean;
  gte(n: number): boolean;
  gte(arg: number | NBaseInteger): boolean {
    const o = this.#cmp(arg);
    return o === Ordering.Greater || o === Ordering.Equal;
  }

  lt(n: NBaseInteger): boolean;
  lt(n: number): boolean;
  lt(arg: number | NBaseInteger): boolean {
    return this.#cmp(arg) === Ordering.Less;
  }

  lte(n: NBaseInteger): boolean;
  lte(n: number): boolean;
  lte(arg: number | NBaseInteger): boolean {
    const o = this.#cmp(arg);
    return o === Ordering.Less || o === Ordering.Equal;
  }

  eqAbs(n: NBaseInteger): boolean;
  eqAbs(n: number): boolean;
  eqAbs(arg: number | NBaseInteger): boolean {
    return this.#cmpAbs(arg) === Ordering.Equal;
  }

  neAbs(n: NBaseInteger): boolean;
  neAbs(n: number): boolean;
  neAbs(arg: number | NBaseInteger): boolean {
    return this.#cmpAbs(arg) !== Ordering.Equal;
  }

  gtAbs(n: NBaseInteger): boolean;
  gtAbs(n: number): boolean;
  gtAbs(arg: number | NBaseInteger): boolean {
    return this.#cmpAbs(arg) === Ordering.Greater;
  }

  gteAbs(n: NBaseInteger): boolean;
  gteAbs(n: number): boolean;
  gteAbs(arg: number | NBaseInteger): boolean {
    const o = this.#cmpAbs(arg);
    return o === Ordering.Greater || o === Ordering.Equal;
  }

  ltAbs(n: NBaseInteger): boolean;
  ltAbs(n: number): boolean;
  ltAbs(arg: number | NBaseInteger): boolean {
    return this.#cmpAbs(arg) === Ordering.Less;
  }

  lteAbs(n: NBaseInteger): boolean;
  lteAbs(n: number): boolean;
  lteAbs(arg: number | NBaseInteger): boolean {
    const o = this.#cmpAbs(arg);
    return o === Ordering.Less || o === Ordering.Equal;
  }
  // #endregion

  // #region others
  /**
   * Set this n-base number to 0
   * @returns this
   */
  zero() {
    this.#negative = false;
    this.#digits.length = 1;
    this.#digits[0] = 0;
    return this;
  }

  clone() {
    // Here, this.sgn gives the value of #negative
    const clone = new NBaseInteger(Flag.PRIVATE, this.sgn, this.#base, this.#charset);
    clone.#digits = this.#digits.slice();
    return clone;
  }

  toString(): string {
    const abs: string[] = [];
    const d = this.#digits;
    for (let i = d.length - 1; i >= 0; i--) {
      abs.push(this.#charset[d[i]]);
    }
    return `${this.#negative ? '-' : ''}${abs.join('')}`;
  }
  // #endregion
}
