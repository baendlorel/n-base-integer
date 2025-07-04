/**
 * The name of the N-base integer class.
 */
export const NAME = 'NBaseInteger';

/**
 * Enum representing the result of a comparison operation.
 * - Name and values are the same as it is in **Rust**
 */
export const enum Ordering {
  Greater,
  Less,
  Equal,
}

let defaultCharset = Object.freeze([
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
]);
const charsetMap = new Map<string, readonly string[]>();
charsetMap.set('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', defaultCharset);

export const charsets = {
  get default() {
    return defaultCharset;
  },

  setDefault(charset: string) {
    defaultCharset = Object.freeze(charset.split('').slice());
    charsetMap.set(charset, defaultCharset);
  },

  /**
   * Get the reference of a charset array.
   * - If the target does not exist, it will create a new one.
   * @param charset
   * @returns
   */
  get(charset: string) {
    if (charsetMap.has(charset)) {
      return charsetMap.get(charset) as readonly string[];
    }
    const newCharset = Object.freeze(charset.split(''));
    charsetMap.set(charset, newCharset);
    return newCharset;
  },
};
