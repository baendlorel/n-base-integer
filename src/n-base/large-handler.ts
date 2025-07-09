/**
 * 正确的蒙哥马利梯算法
 * @see https://www.bchrt.com/tools/big-number-calculator/
 */
const powMontgomeryLadder = (a: readonly number[], exponent: readonly number[], base: number) => {
  if (isZero(exponent)) {
    return [1];
  }
  if (isZero(a)) {
    return [0];
  }

  const expBits = toBinaryBits(exponent, base);
  let result = a.slice(); // 初始化为底数，因为最高位肯定是1

  // 从第二位开始处理
  for (let i = 1; i < expBits.length; i++) {
    result = multiply(result, result, base); // result = result²
    if (expBits[i] === 1) {
      result = multiply(result, a, base); // 如果位是1，再乘以底数
    }
  }

  return result;
};

/**
 * 检查数字数组是否为零
 */
const isZero = (digits: readonly number[]): boolean => digits.length === 1 && digits[0] === 0;

/**
 * 简单的除法运算（仅适用于除数为小整数的情况）
 */
const divideBySmallNumber = (
  digits: readonly number[],
  divisor: number,
  base: number
): { quotient: number[]; remainder: number } => {
  let remainder = 0;
  const quotient: number[] = [];

  // 从最高位开始除法
  for (let i = digits.length - 1; i >= 0; i--) {
    const current = remainder * base + digits[i];
    quotient.unshift(Math.floor(current / divisor));
    remainder = current % divisor;
  }

  // 移除前导零
  while (quotient.length > 1 && quotient[quotient.length - 1] === 0) {
    quotient.pop();
  }

  return { quotient, remainder };
};

/**
 * 将N进制数字转换为二进制位数组
 * @param digits N进制数字的位数组
 * @param base 数字的进制
 * @returns 二进制位数组，最高位在前
 */
const toBinaryBits = (digits: readonly number[], base: number): number[] => {
  if (isZero(digits)) {
    return [0];
  }

  const bits: number[] = [];
  let temp = digits.slice(); // 复制一份，避免修改原数组

  // 重复除以2，收集余数
  while (!isZero(temp)) {
    const result = divideBySmallNumber(temp, 2, base);
    bits.unshift(result.remainder); // 最高位在前
    temp = result.quotient;
  }

  return bits;
};

/**
 * 简化的乘法运算
 */
const multiply = (a: readonly number[], b: readonly number[], base: number): number[] => {
  if (isZero(a) || isZero(b)) {
    return [0];
  }

  const result = new Array(a.length + b.length).fill(0);

  // 逐位相乘
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      const product = a[i] * b[j];
      let pos = i + j;

      // 处理进位
      result[pos] += product;
      while (result[pos] >= base) {
        result[pos + 1] += Math.floor(result[pos] / base);
        result[pos] %= base;
        pos++;
      }
    }
  }

  // 移除前导零
  while (result.length > 1 && result[result.length - 1] === 0) {
    result.pop();
  }

  return result;
};
