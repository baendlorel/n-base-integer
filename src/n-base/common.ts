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

/**
 * Default charset manager
 */
export const chs = {
  get default() {
    return defaultCharset;
  },

  /**
   * ! ONLY use when charset is checked
   */
  setDefault(charsetArr: string[]) {
    defaultCharset = Object.freeze(charsetArr.slice());
  },

  /**
   * Chop the default charset, make its length === `base`.
   * @throws When `base` > default length
   */
  safe(base: number) {
    if (base > defaultCharset.length) {
      throw new RangeError(
        `Base ${base} exceeds the length of the default charset (${defaultCharset.length}).`
      );
    }
    return defaultCharset.slice(0, base);
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
