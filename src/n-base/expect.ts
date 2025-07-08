import { Flag } from './consts';

/**
 * Throws an error if the provided flag does not match the internal flag.
 * @param privateFlag The flag to check.
 * @param msg The error message to throw if the flag does not match.
 */
export const expectPrivateCalling = (
  privateFlag: symbol,
  msg = `This method is prohibited from calling outside.`
) => {
  if (privateFlag !== Flag.PRIVATE) {
    throw new Error(msg);
  }
};

export const expect: (o: unknown, msg: string) => asserts o = (o: unknown, msg: string) => {
  if (!o) {
    throw new Error(msg);
  }
};
