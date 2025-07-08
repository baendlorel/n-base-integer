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

  /**
   * ! ONLY use when charset is checked
   */
  setDefault(charset: string, charsetArr: string[]) {
    defaultCharset = Object.freeze(charsetArr.slice());
    charsetMap.set(charset, defaultCharset);
    return defaultCharset;
  },

  /**
   * ! ONLY use when charset is checked
   * Get the reference of a charset array.
   * - If the target does not exist, it will create a new one.
   * @param charset
   */
  get(charset: string, charsetArr: string[]) {
    if (charsetMap.has(charset)) {
      return charsetMap.get(charset) as readonly string[];
    }
    const newCharsetArr = Object.freeze(charsetArr.slice());
    charsetMap.set(charset, newCharsetArr);
    return newCharsetArr;
  },
};

/**
 * ! If a is [] or a is [0], return [0].
 */
export const unshift0 = (a: number[], count: number) => {
  if (a.length === 0) {
    return [0];
  }
  for (let i = 0; i < count; i++) {
    a.unshift(0);
  }
  return a;
};
