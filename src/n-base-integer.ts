const NAME = 'NBaseInteger';
const flag = Symbol();
const protect = (privateFlag: symbol, msg = `This method is prohibited from calling.`) => {
  if (privateFlag !== flag) {
    throw new Error(msg);
  }
};

/**
 * It is told that uppercase letters comes first
 */
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const reverseRecordMap = new Map<string, Record<string, number>>();

/**
 * NBase is a class for n-base numeral system
 */
export class NBaseInteger {
  // # Creation
  static from(n: number, base: number): NBaseInteger;
  static from(n: number, charset: string): NBaseInteger;
  static from(n: number, arg: number | string): NBaseInteger {
    console.log('calling by', { n, arg }, 'Number.isSafeInteger(n)', Number.isSafeInteger(n));
    if (!Number.isSafeInteger(n)) {
      throw new TypeError(`${NAME}.from called with a non-number value.`);
    }

    if (typeof arg === 'number') {
      const base = arg;
      if (base <= 1 || !Number.isSafeInteger(base)) {
        throw new RangeError(`${NAME}.from called with a invalid base. Got '${base}'`);
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
    clone.digits.push(...a.digits);
    return clone;
  }

  // # Calculation, Ensure a.base === b.base and then call this
  private static addAToB(a: NBaseInteger, b: NBaseInteger, priv: symbol): void {
    protect(priv);
    const ad = a.digits;
    const bd = b.digits;
    const base = a.base;
    let max = bd.length;
    let min = ad.length;
    if (ad.length > bd.length) {
      max = ad.length;
      min = bd.length;
      bd.fill(0, bd.length, max);
    } else {
      ad.fill(0, ad.length, max);
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

  private readonly charset: string;

  /**
   * digits[0] is the least significant digit (ones place),
   * digits[1] is the next higher place, and so on.
   * The array extends from the ones place upwards.
   */
  private readonly digits: number[];

  private readonly c2n: Record<string, number> = {};

  constructor(n: number, charset: string, priv: symbol) {
    protect(priv, `The constructor of ${NAME} is protected, please use ${NAME}.from instead.`);
    this.charset = charset;

    if (reverseRecordMap.has(charset)) {
      this.c2n = reverseRecordMap.get(charset) as Record<string, number>;
    } else {
      // creating reverse map
      for (let i = 0; i < charset.length; i++) {
        this.c2n[charset[i]] = i;
      }
      reverseRecordMap.set(charset, this.c2n);
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

  add(nbi: NBaseInteger): NBaseInteger;
  add(n: number): NBaseInteger;
  add(arg: number | NBaseInteger): NBaseInteger {
    if (typeof arg === 'number') {
      const n = arg;
      if (!Number.isSafeInteger(n)) {
        throw new TypeError(`${NAME}.add called with an unsafe integer.`);
      }

      const b = new NBaseInteger(n, this.charset, flag);
      NBaseInteger.addAToB(this, b, flag);
      return b;
    }

    if (arg instanceof NBaseInteger) {
      const nbi = arg;
      if (nbi.base !== this.base) {
        throw new RangeError(`${NAME}.add called with a ${NAME} with different base.`);
      }

      const b = NBaseInteger.clone(this, flag);
      NBaseInteger.addAToB(nbi, b, flag);
      return b;
    }

    throw new TypeError(`${NAME}.add called with an invalid argument. Expected number or ${NAME}.`);
  }

  toString(): string {
    return this.digits
      .map((digit) => this.charset[digit])
      .reverse()
      .join('');
  }
}
