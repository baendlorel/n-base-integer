# n-base-integer

A TypeScript library for creating, converting, and performing arithmetic with integers in arbitrary bases (n-base), supporting custom charsets and large numbers.

## Features

- Create integers in any base (≥2), with customizable charsets(emojis supported!).
  - Max base is set to `1_000_000` because it is basically the total count of characters in the world.
- Supports large numbers beyond native number limits of JavaScript.
- Full set of arithmetic, comparison, sign, and utility operations.
- Immutable and mutable (in-place) methods.

## Installation

```bash
npm install n-base-integer
```

## Quick Start

```typescript
import { NBaseInteger } from 'n-base-integer';

// Create a base-10 integer
const a = NBaseInteger(12345);

// Create a base-16 integer from string
const b = NBaseInteger('1A3F', 16);

// Create with custom charset (e.g., base-4 with 'abcd')
const c = NBaseInteger('bac', 4, 'abcd');
```

---

## API Reference

### 1. Creation & Conversion

- `NBaseInteger(n, base?, charset?)`: Create an n-base integer.
  - `n`: number or string (the value)
  - `base`: integer ≥2 (default: 10)
  - `charset`: string of unique characters (default: '0-9A-Za-z')
- `.toString()`: Convert to string using `charset` in its base.
- `.clone()`: Deep copy of the instance.
- `.base`: Get the `base`.
- `.charset`: Get the `charset`.

### 2. Arithmetic Operations

All arithmetic methods return a new instance (immutable). For in-place modification, use the `*Assign` variants.

- Addition: `add(n)`, `addAssign(n)`
- Subtraction: `sub(n)`, `subAssign(n)`
- Multiplication: `mul(n)`, `mulAssgin(n)`
- Division (quotient): `div(n)`, `divAssign(n)`
- Modulo (remainder): `mod(n)`, `modAssign(n)`
- Power: `pow(n)`
- Division
  - with remainder: `divmod(n)` returns `{ quotient, remainder }`
  - without remainder: `div(n)` returns quotient only

#### Example

```typescript
const a = NBaseInteger(100);
const b = NBaseInteger(7);
const sum = a.add(b); // 107
const product = a.mul(3); // 300
const { quotient, remainder } = a.divmod(b); // 100 / 7 = 14 ... 2
```

### 3. Comparison Methods

- `cmp(n)`: -1 for less, 0 for equal, 1 for greater
- `eq(n)`, `ne(n)`: Equal, not equal
- `gt(n)`, `gte(n)`: Greater than or equal
- `lt(n)`, `lte(n)`: Less than or equal
- Absolute value comparisons: `eqAbs(n)`, `gtAbs(n)`, etc.

#### Example

```typescript
if (a.gt(b)) {
  // a is greater than b
}
```

### 4. Sign & Utility Methods

- `.negate()`, `.negateAssign()`: Get/set additive inverse
- `.abs()`, `.absAssign()`: Get/set absolute value
- `.setSign(sgn)`: Set sign (-1, 0, 1)
- `.isZero`: Check if zero
- `.isOdd`, `.isEven`: Check parity

#### Example

```typescript
const n = NBaseInteger(-42);
const abs = n.abs(); // 42
n.negateAssign(); // n is now 42
```

### 5. Advanced Usage

- Custom charsets for exotic numeral systems
- Supports very large numbers (arbitrary precision)
- All operations ensure base and charset compatibility

---

## License

MIT
