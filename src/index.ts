const orderedVarNames = (n: number): string => {
  if (n <= 0 || !Number.isSafeInteger(n)) {
    throw new RangeError(`n should be a positive integer. Got ${n}`);
  }
  const c2n = new Map<Char, number>(chars.map((c, i) => [c, i]));

  const result: Char[] = ['a'];

  for (let i = 1; i < n; i++) {
    const prev = result[i - 1];
  }

  return '';
};
