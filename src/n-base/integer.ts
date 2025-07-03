const NAME = 'NBaseInteger';
const flag = Symbol();
const protect = (privateFlag: symbol, msg = `This method is prohibited from calling.`) => {
  if (privateFlag !== flag) {
    throw new Error(msg);
  }
};
const safeInt = (n: number) => {
  if (!Number.isSafeInteger(n)) {
    throw new TypeError(`The method is not called with a safe integer, got ${n}.`);
  }
  return n;
};

/**
 * It is told that uppercase letters comes first
 */
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * NBase is a class for n-base numeral system
 */
export class NBaseInteger {
  // # Creation
  static from(n: number, base: number): NBaseInteger;
  static from(n: number, charset: string): NBaseInteger;
  static from(n: number, arg: number | string): NBaseInteger {
    safeInt(n);
    if (typeof arg === 'number') {
      const base = safeInt(arg);

      if (base <= 1) {
        throw new RangeError(`Base must >= 1.`);
      }
      if (base > 62) {
        throw new RangeError(
          `You should specify the 'charset' to create a ${NAME} when 'base' > 62. For we ran out 0-9A-Za-z.`
        );
      }
      return new NBaseInteger(n, BASE62.slice(0, base), flag);
    }

    if (typeof arg === 'string') {
      const charset = arg;
      const deduped = new Set(charset.split(''));
      if (charset.length !== deduped.size) {
        throw new RangeError(
          `${NAME}.from called with a charset that contains duplicate characters.`
        );
      }

      return new NBaseInteger(n, charset, flag);
    }

    throw new TypeError(
      'NBase.from called with an invalid 2nd argument. Expected base or charset.'
    );
  }

  private static clone(a: NBaseInteger, priv: symbol): NBaseInteger {
    protect(priv);
    const clone = new NBaseInteger(0, a.charset, flag);
    for (let i = 0; i < a.digits.length; i++) {
      clone.digits[i] = a.digits[i];
    }
    return clone;
  }

  // # Calculation, Ensure a.base === b.base and then call this

  private expectAnother(arg: number | NBaseInteger, clone: boolean, priv: symbol): NBaseInteger {
    protect(priv);
    if (typeof arg === 'number') {
      const n = safeInt(arg);
      return new NBaseInteger(n, this.charset, flag);
    }

    if (arg instanceof NBaseInteger) {
      const nbi = arg;
      if (nbi.base !== this.base) {
        throw new TypeError(`Called with a ${NAME} with different base.`);
      }
      if (nbi.charset !== this.charset) {
        throw new TypeError(`Called with a ${NAME} with different charset.`);
      }

      return clone ? NBaseInteger.clone(nbi, flag) : nbi;
    }

    throw new TypeError(`Called with an invalid argument. Expected number or ${NAME}.`);
  }

  private static addAToB(a: NBaseInteger, b: NBaseInteger, priv: symbol): void {
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
  }

  // # private vars
  private readonly charset: string;

  /**
   * digits[0] is the least significant digit (ones place),
   * digits[1] is the next higher place, and so on.
   * The array extends from the ones place upwards.
   */
  private readonly digits: number[];

  private negative: boolean = false;

  constructor(n: number, charset: string, priv: symbol) {
    protect(priv, `The constructor of ${NAME} is protected, please use ${NAME}.from instead.`);
    this.charset = charset;

    if (n < 0) {
      n = -n;
      this.negative = true;
    }

    // creating
    const base = charset.length;
    this.digits = [];
    do {
      this.digits.push(n % base);
      n = Math.floor(n / base);
    } while (n > 0);
  }

  get base(): number {
    return this.charset.length;
  }

  get tenBaseDigits(): number[] {
    return this.digits.toReversed();
  }

  add(nbi: NBaseInteger): NBaseInteger;
  add(n: number): NBaseInteger;
  add(arg: number | NBaseInteger): NBaseInteger {
    const other = this.expectAnother(arg, true, flag);
    NBaseInteger.addAToB(this, other, flag);
    return other;
  }

  addAssign(nbi: NBaseInteger): NBaseInteger;
  addAssign(n: number): NBaseInteger;
  addAssign(arg: number | NBaseInteger): NBaseInteger {
    const other = this.expectAnother(arg, false, flag);
    NBaseInteger.addAToB(other, this, flag);
    return this;
  }

  toString(): string {
    return this.digits
      .map((digit) => this.charset[digit])
      .reverse()
      .join('');
  }
}
