import { NBaseInteger as NBI } from './n-base/integer';

export const NBaseInteger = new Proxy(NBI, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target.from, thisArg, argArray);
  },
});
