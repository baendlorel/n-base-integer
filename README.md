# n-base-integer

A TypeScript library for creating, converting, and performing arithmetic with integers in arbitrary bases (n-base), supporting custom charsets and large numbers.

For more awesome packages, check out [my homepage💛](https://baendlorel.github.io/?repoType=npm)

## Features

- **Arbitrary base support**: Create integers in any base from 2 to 1,000,000
- **Custom charsets**: Support any character set, including emojis
- **Large number handling**: Beyond JavaScript's native number limits
- **Complete arithmetic operations**: Addition, subtraction, multiplication, division, modulo, and power
- **Immutable and mutable operations**: Choose between creating new instances or modifying in-place
- **Base conversion**: Convert between different bases efficiently
- **Type-safe**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install n-base-integer
```

## Quick Start

```typescript
import { NBaseInteger } from 'n-base-integer';

// Create from string (default base 10)
const a = NBaseInteger('12345');

// Create with specific base
const binary = NBaseInteger('1010', 2); // Binary
const hex = NBaseInteger('1A3F', 16); // Hexadecimal

// Create with custom charset
const custom = NBaseInteger('🔥💧🌍', 3, '🔥💧🌍');
// Since '🔥💧🌍' -> '012'
custom.toString(); // '💧🌍'

// Create from regular number
const fromNum = NBaseInteger.from(255, 16); // 255 in base 16

// Create from digit array [1,2,3] -> 123
const fromDigits = NBaseInteger.fromDigits([1, 2, 3], 10);
```

---

## API Reference

### Factory Methods

- `NBaseInteger(str, base?, charset?)` - Create from string
- `NBaseInteger.from(number, base)` - Create from regular number
- `NBaseInteger.fromDigits(digits[], base, negative?)` - Create from digit array
- `NBaseInteger.defaultCharset` - Get default charset ('0-9A-Za-z')
- `NBaseInteger.setDefaultCharset(charset)` - Set default charset

### Properties

- `.base` - The base of this number (readonly)
- `.isZero` - True if the number is zero
- `.isOdd` / `.isEven` - Check parity
- `.sgn` - Sign of the number (-1, 0, or 1), same as `sgn(x)` in math

### Arithmetic Operations

**Immutable operations** (return new instance):

- `add(n: NBaseInteger | number)` - Addition
- `sub(n: NBaseInteger | number)` - Subtraction
- `mul(n: NBaseInteger | number)` - Multiplication
- `div(n: NBaseInteger | number)` - Division (quotient only)
- `mod(n: NBaseInteger | number)` - Modulo (remainder only)
- `divmod(n: NBaseInteger | number)` - Division with remainder `{ quotient, remainder }`
- `pow(exponent: NBaseInteger | number)` - Exponentiation

**Mutable operations** (modify in place):

- `addAssign(n: NBaseInteger | number)` - Addition
- `subAssign(n: NBaseInteger | number)` - Subtraction
- `mulAssign(n: NBaseInteger | number)` - Multiplication
- `divAssign(n: NBaseInteger | number)` - Division
- `modAssign(n: NBaseInteger | number)` - Modulo
- `inc()` - Increment by 1
- `dec()` - Decrement by 1

```typescript
const a = NBaseInteger('100');
const b = NBaseInteger('7');

// Immutable operations
const sum = a.add(b); // 107
const product = a.mul(3); // 300
const { quotient, remainder } = a.divmod(b); // 14 remainder 2

// Mutable operations
a.addAssign(b); // a becomes 107
a.inc(); // a becomes 108
```

### Comparison Operations

- `cmp(n)` - Compare `this` to `n`, return (-1, 0, 1)
- `eq(n)` / `ne(n)` - Equal / not equal
- `gt(n)` / `gte(n)` - Greater than / greater than or equal
- `lt(n)` / `lte(n)` - Less than / less than or equal
- Absolute comparisons: `cmpAbs(n)`, `eqAbs(n)`, `gtAbs(n)`, etc.

```typescript
if (a.gt(b)) {
  console.log('a is greater than b');
}

console.log(a.cmp(b)); // -1, 0, or 1
```

### Sign Operations

- `negate()` - Get `-this` (immutable)
- `negateAssign()` - Set `this` to `-this`
- `abs()` - Get absolute value (immutable)
- `absAssign()` - Absolute value in place
- `setSign(sgn: -1 | 0 | 1)` - Set sign to -1, 0, or 1
- `zero()` - Set to zero

```typescript
const n = NBaseInteger('-42');
const positive = n.abs(); // 42
n.negateAssign(); // n becomes 42
n.setSign(-1); // n becomes -42
```

### Base Conversion

- `convertTo(base)` - Convert to another base
- `toBinary()` - Convert to binary (base 2)
- `toOctal()` - Convert to octal (base 8)
- `toDecimal()` - Convert to decimal (base 10)
- `toHex()` - Convert to hexadecimal (base 16)

```typescript
const decimal = NBaseInteger('255');
const binary = decimal.toBinary(); // '11111111' in base 2
const hex = decimal.toHex(); // 'FF' in base 16
const base36 = decimal.convertTo(36); // '73' in base 36
```

### Other Methods

- `toString(charset?: string | null)` - Convert to string representation.

  - `charset` default value is '0...9A...Za...z'(can be set via `NBaseInteger.setDefaultCharset()`).
    - note that `charset` can be omitted but **not explicitly be `undefined`**
  - When `charset` is `null`, just return the digits separated with comma.
  - When `charset` is `string`, use it to stringify every digit after check.

- `toNumber()` - Convert to JavaScript number (throws if > `Number.MAX_SAFE_INTEGER`)
- `toBigInt()` - Convert to JavaScript BigInt
- `clone()` - Create a copy

```typescript
const n = NBaseInteger('1010', 2);

console.log(n.toString()); // '1010'
console.log(n.toString(null)); // '0,1,0,1' (digit array)
console.log(n.toNumber()); // 10
console.log(n.toBigInt()); // 10n

// Custom charset for output
const custom = NBaseInteger('255').convertTo(3);
console.log(custom.toString('ABC')); // Uses A=0, B=1, C=2
```

### Advanced Usage

**Custom Character Sets:**

```typescript
// Emoji base-3 number system
const emojiNum = NBaseInteger('🔥💧🌍', 3, '🔥💧🌍');
console.log(emojiNum.toDecimal().toString()); // Converts to decimal

// Base-64 with custom charset
const base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const b64num = NBaseInteger('Hello', 64, base64);
```

**Large Number Support:**

```typescript
// Numbers beyond JavaScript's safe integer limit
const huge = NBaseInteger('999999999999999999999999999999');
const result = huge.mul(huge); // Still works perfectly
console.log(result.toString()); // Exact result, no precision loss
```

**Base Conversion Chain:**

```typescript
const original = NBaseInteger('777', 8); // Octal
const decimal = original.toDecimal(); // Convert to decimal
const binary = decimal.toBinary(); // Then to binary
const hex = binary.toHex(); // Finally to hex
```

## Performance Notes

- Operations are optimized for efficiency with large numbers
- Base conversions use efficient algorithms for arbitrary precision
- In-place operations (`*Assign` methods) create less objects when you don't need immutability
- Caching is used internally for frequently accessed `maxInt` and `charsets`

---

## License

MIT
