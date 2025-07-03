export const NAME = 'NBaseInteger';

export const flag = Symbol();

export const protect = (privateFlag: symbol, msg = `This method is prohibited from calling.`) => {
  if (privateFlag !== flag) {
    throw new Error(msg);
  }
};

export const enum Ordering {
  Greater,
  Less,
  Equal,
}
