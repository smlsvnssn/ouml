###### toc

# ö.js

ö.js - a small collection of useful stuff.

Usage:

```
(p)npm install ouml
```

```js
import { random } from 'ouml'
let oneOrZero = random()
```

or, with treeshaking:

```js
import * as ö from 'ouml'
let oneOrZero = ö.random()
```

Most methods are runnable within node/deno. Some methods require browser API:s, those are marked with [browser].

## Modules

Includes modules [chain](#chain), a method for chaining calls on any type, [öbservable](#%C3%B6bservable), a basic implementation of reactive values, [övents](#%C3%B6vents), a collection of useful custom browser events, [colour](#colour), a simple way to work with oklch colours, [bits](#bits), an easy way to flip bits, and [spring](#spring), a spring animation utility.

Import them from

```js
import chain, { chainAsync } from 'ouml/chain'
import { observable, isObservable, observe } from 'ouml/öbservable'
import {
    resize,
    enterview,
    exitview,
    sticktotop,
    sticktobottom,
    swipe,
    clickoutside,
} from 'ouml/övents'
import colour, { isColour } from 'ouml/colour'
import bits, { isBits } from 'ouml/bits'
import spring from 'ouml/spring'
```

## Methods

### Generators / Iterators

Helper methods for iterations, less verbose than regular loops.

#### ö.range( start, end?, step? = 1 ) yields Number

Yields `Number`s within specified range. Parameters `end` and `step` are optional. If `end` is not provided, range starts with `0`, and ends with `start`. Handles negative values. Useful in `for of` loops, for example:

```js
for (let i of ö.range(100)) doStuff(i)
```

#### ö.grid( width, height? ) yields { x, y }

Yields `Object` with `x, y` coordinates. If `height` is omitted, `width` is assumed. Use like so:

```js
for (let i of ö.grid(8)) drawChessboard(i.x, i.y)
```

#### ö.times( times, f? = i => i, ...rest ) → Array

Calls a function `times` times, with `index` as argument. Additional arguments are passed on to `f` like so:

```js
ö.times(100, (i, a, b) => i + a + b, 'a', 'b')
```

Returns an array containing the return values of `f`, or an array containing index values if `f` is `undefined`.

### Array / Iterable

Methods for manipulating arrays or array-like objects. Inputs are coerced to `Array`, so `String`, `Set` and the like works as input as well. All methods are non-mutating.

#### ö.rangeArray( start, end?, step? = 1 ) → Array

Returns an `Array` populated with given range.

#### ö.map( iterable | obj, f | str ) → Iterable | obj.key

Same as a normal map, except it accepts a `string` as a shorthand for retrieving values from an object property, if given an iterable that contains objects. Oh, and it accepts all iterables, and returns `String`, `Map`, `Set` and `TypedArray` as appropriate. It's a `map` for `Map`! Edge case iterables such as `NodeList` get converted to an array.

Oh, and it's a `map` for `Object`s! In the rare case that you would mant to map over the own properties of an object, that also works.

```js
ö.map({ a: 1, b: 2 }, ([k, v]) => [k, v + 1]) // returns { a: 2, b: 3 }
```

Mapping functions for `Map`s and `Object`s receive an array in the form of `[key, val]` as a value argument, and must return an array in the same format.

#### ö.unique( iterable ) → Array

Returns an `Array` with unique entries.

#### ö.shuffle( iterable ) → Array

Returns a new shuffled `Array`.

#### ö.sample( iterable, samples? = 1 ) → Array item | Array

Returns random sample from `iterable`, or an array of samples if `samples` is larger than one.

#### ö.rotate( iterable, steps? = 1 ) → Array

Rotates an iterable to the left if `steps` is positive, and to the right if `steps` is negative.

```js
ö.rotate([1, 2, 3, 4], 1) // returns[ 2, 3, 4, 1 ]
ö.rotate([1, 2, 3, 4], -1) // returns[ 4, 1, 2, 3 ]
```

#### ö.chunk( iterable, chunkSize? = 1 ) → [ Arrays ]

Returns an array of arrays with `chunkSize` length.

```js
ö.chunk([1, 2, 3, 4, 5, 6, 7], 3) // returns [ [1, 2, 3], [4, 5, 6], [7] ]
```

#### ö.split( iterable, index ) → [ Array, Array ]

Splits `iterable` into one part before `index` (excluding `index`), and one part after.

Alternatively: Takes a function returning a boolean. The function receives `value, index, array` as arguments, and should return `false` on the array item where the split should be made.

```js
ö.split([1, 2, 3, 4], v => v <= 2) // returns [ [1, 2], [3, 4] ]
```

#### ö.take( iterable, index ) → Array

Same as `ö.split()`, but returns first part.

```js
ö.take([1, 2, 3, 4], v => v <= 2) // returns [1, 2]
```

#### ö.drop( iterable, index ) → Array

Same as `ö.split()`, but returns last part.

```js
ö.drop([1, 2, 3, 4], v => v <= 2) // returns [3, 4]
```

#### ö.partition( iterable, f ) → [ Array, Array ]

Returns an array partitioned into two arrays, the first where `f` returns `true`, the second where `f` returns `false`.
The function receives `value, index, array` as arguments.

```js
ö.partition([1, 2, 3, 4], v => v % 2 == 0) // returns [ [2, 4], [1, 3] ]
```

#### ö.zip( ...iterables ) → [ Arrays ]

Returns an array of tuples with elements grouped by index, up to the length of the shortest iterable.

```js
ö.zip([1, 2, 3], 'abc') // returns [ [1, 'a'], [2, 'b'], [3, 'c'] ]
ö.zip([1, 2, 3], 'ab') // returns [ [1, 'a'], [2, 'b'] ]
```

#### ö.transpose/ö.unzip( arr ) → [ Arrays ]

Returns a transposed array of arrays. If the arrays are of uneven length, longer arrays are cropped to match the shortest. Where `zip` takes multiple iterables, `transpose/unzip` takes an array of iterables. `transpose` is its own inverse.

```js
ö.unzip([
    [1, 'a'],
    [2, 'b', 2],
]) // returns [ [1, 2], ['a', 'b'] ]
```

#### ö.combinations( iterable, k ) → [ Arrays ]

Returns all combinations of length `k` in iterable. If `k` is omitted, returns all possible combinations.

```js
ö.combinations('abc', 2)
// returns [['a', 'b'], ['a', 'c'], ['b', 'c']]
```

Members in iterable are allowed to be duplicates:

```js
ö.combinations([1, 1]) // returns [[1], [1], [1, 1]]
```

#### ö.permutations( iterable ) → [ Arrays ]

Returns all permutations of iterable. Beware of out-of-memory issues for values above a length of 10. Uses [Heap's algorithm](https://en.wikipedia.org/wiki/Heap's_algorithm).

```js
ö.permutations('abc')
// returns [['a', 'b', 'c'], ['b', 'a', 'c'], ['c', 'a', 'b'], ['a', 'c', 'b'], ['b', 'c', 'a'], ['c', 'b', 'a']]
```

Members in iterable are allowed to be duplicates:

```js
ö.permutations([1, 1]) // returns [[1, 1], [1, 1]]
```

#### ö.sum( iterable ) → Number

Sums `iterable`, with `Number` coercion.

#### ö.mean( iterable ) → Number

Calculates mean value of `iterable`, with `Number` coercion.

#### ö.product( iterable ) → Number

Returns product of `iterable`, with `Number` coercion. Reaches `Number.MAX_VALUE` rather quickly for large arrays, so use with some caution.

#### ö.geometricMean( iterable ) → Number

Calculates the geometric mean of `iterable`, with `Number` coercion. May return `Infinity` for large arrays or large numbers, since it uses `ö.product`.

#### ö.median( iterable ) → Number

Calculates median value of `iterable`, with `Number` coercion.

#### ö.max( iterable ) → Number

Returns largest value in `iterable`.

#### ö.min( iterable ) → Number

Returns smallest value in `iterable`.

#### ö.covariance( a, b ) → Number

Returns (population) [covariance](https://en.wikipedia.org/wiki/Covariance) of `a` and `b`, with `Number` coercion. `a` and `b` should have the same length.

#### ö.variance( iterable ) → Number

Returns (population) [variance](https://en.wikipedia.org/wiki/Variance) of `iterable`.

#### ö.standardDeviation( iterable ) → Number

Returns (population) [standard deviation](https://en.wikipedia.org/wiki/Standard_deviation) of `iterable`.

#### ö.correlation( a, b ) → Number

Returns the (population) [Pearson correlation coefficient](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient) between `a` and `b`. `a` and `b` should have the same length.

#### ö.groupBy( iterable, prop | f, asObject? = false ) → Map | Object

Returns a `Map` with keys corresponding to `prop` values, holding grouped values as arrays. Optionally returns an `object` if `asObject` is set to true.

If `prop` is a string, takes an iterable of `object`s with a common property. If `prop` is a function, takes a function returning keys for grouping based on `iterable` contents. The function receives `value, index, array` as arguments.

### Tree structures

#### ö.mapToTree( arr, idProp | f, parentProp?) → Nested array

Maps a flat array of objects to a tree structure. Objects with children get a new `children` property, unsurprisingly containing an array of children 🙄. Leaf nodes have no `children` property. Works in one of two ways:

Either you provide an `idProp` and a `parentProp`, where the `ìdProp` holds a value unique to every item in the array, and `parentProp` holds a reference to the parent's `idProp` value (useful for example if you get a flattened hierarchic list from an api).

Or, you provide a mapping function responsible for providing a unique key for the item, and a unique key for the parent. The function receives `value, index, array` as arguments, and should produce an array with `[ ownKey, parentKey ]`. If the item has no parent, set `parentKey` to `null`. Useful for example for mapping urls to a hierarchy.

Parentless children (orphans) will be discarded.

Example:

```js
let flat = [
    { id: '1' },
    { id: '1.1', parent: '1' },
    { id: '1.1.1', parent: '1.1' },
    { id: '2' },
    { id: '2.2', parent: '2' },
]

let tree = ö.mapToTree(flat, 'id', 'parent')
// or
let sameTree = ö.mapToTree(flat, item => [
    item.id,
    item.id.split('.').slice(0, -1).join('.') || null,
])
```

#### ö.reduceDeep( arr, f, childrenProp? = 'children', initial?, flatten? = false ) → value

Reduces arrays of nested objects to a single value. `childrenProp` is a `string` matching the property containing nested arrays (defaults to `'children'`).

The reducer function `f` receives `accumulator, value, index, array` as arguments. `initial` can be omitted, just like the native `reduce`, in that case the first item of `arr` is used as the initial value.

If `flatten` is `false`, the accumulator is an array, and the reducer returns an object, the structure of the original `arr` is preserved, and a property matching `childrenProp` is added to the object, containing its children.

Deepclones `arr` to avoid mutation.

Example:

```js
let arr = [
    {
        value: 1,
        children: [
            { value: 1 },
            { value: 1 },
            { value: 1, children: [{ value: -4 }] },
        ],
    },
]

ö.reduceDeep(arr, (acc, v) => acc + v.value, 'children', 0) // returns 0
```

#### ö.mapDeep( arr, f | prop, childrenProp? = 'children', flatten? = false ) → Array

Maps over arrays of nested objects. `childrenProp` is a `string` matching the property containing nested arrays.

If `f` is a function, its return value is mapped to a new array. The function receives `value, index, array` as arguments. If `flatten` is `false`, and `f` returns an `object`, the structure of the original `arr` is preserved, and a property matching `childrenProp` is added to the object, containing its children.

If `f` is a `string`, the value of the property matching `f` is returned, in a flattened array.

Deepclones `arr` to avoid mutation.

#### ö.filterDeep( arr, f | value, childrenProp? = 'children', prop?, flatten? = true ) → Array

Finds items that match `f` in arrays of nested objects. `childrenProp` is a `string` matching the property containing nested arrays.

If `f` is a function, returns items where `f` returns `true`. The function receives `value, index, array` as arguments. If `f` is a function, `prop` can be omitted.

If `f` is not a function, the value of `f` is compared to the value of property `prop`.

If `flatten` is `false`, and `f` returns an `object`, the parents of matches are kept, persisting the path to matching leaf nodes. If `flatten` is `true`, returns a flat array with matching items, regardless of depth.

Deepclones `arr` to avoid mutation.

#### ö.findDeep( arr, f | value, childrenProp? = 'children', prop? ) → Array item

Same as `ö.filterDeep`, except it returns first match, and doesn't deepclone the incoming `arr`.

### Set operations

Methods for comparing arrays or array-like objects. Inputs are coerced to `Set`. All methods return a new `Array`, or `Boolean`.
The outputs adhere to strict set logic. If the inputs are `Array`s, duplicate items are removed. All these methods are wrappers around internal `Set` methods, but return arrays. (Available in evergreens and in node 22+)

#### ö.intersect( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="0.5" y="0.5" width="9" height="9" stroke="white"/><rect x="5.5" y="5.5" width="9" height="9" stroke="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 5V10H5V5H10Z" fill="black"/></svg> Intersection, returns elements that are members of both `a` and `b`.
Example:

```js
ö.intersect([0, 1], [1, 2]) // returns [1]
```

#### ö.subtract( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="0.5" y="0.5" width="9" height="9" stroke="white"/><rect x="5.5" y="5.5" width="9" height="9" stroke="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H0V10H5V5H10V0Z" fill="black"/></svg> Difference, returns members of `a` but not members of `b`, i.e. subtracts `b` from `a`.
Example:

```js
ö.subtract([0, 1], [1, 2]) // returns [0]
```

#### ö.exclude( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H0V10H5V15H15V5H10V0ZM10 5H5V10H10V5Z" fill="black"/></svg> Symmetric difference, returns elements that are members of `a` or `b`, but not both.
Example:

```js
ö.exclude([0, 1], [1, 2]) // returns [0, 2]
```

#### ö.union( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="0.5" y="0.5" width="9" height="9" stroke="white"/><rect x="5.5" y="5.5" width="9" height="9" stroke="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H0V10H5V15H15V5H10V0Z" fill="black"/></svg> Returns (unique) members of both `a` and `b`.
Example:

```js
ö.union([0, 1], [1, 2]) // returns [0, 1, 2]
```

#### ö.isSubset( a, b ) → Boolean

Returns `true` if `a` is a subset of `b`.

#### ö.isSuperset( a, b ) → Boolean

Returns `true` if `a` is a superset of `b`.

#### ö.isDisjoint( a, b ) → Boolean

Returns `true` if `a` and `b` share no members.

### Logical / generic / functional

#### ö.isEqual/ö.equals( a, b, deep? = true ) → Boolean

Checks equality by value rather than reference. Compares prototypes, and uses `Reflect.ownKeys` to compare all own keys, including symbols. Works for all basic types and most built in classes, but may produce unexpected results in edge cases. Equality is tricky, and depends on what you personally believe to be equal 😇. Does deep comparison by default, and may be slow for large data structures. If `deep == false`, does flat comparison instead.

#### ö.clone( v, deep? = true, immutable? = false ) → cloned value

Performs cloning of most common types, including `Array` and typed arrays, `Map`, `Set`, `Date`, `Node` and objects. Defaults to deep cloning, set `deep` to `false` for shallow cloning. Tries to preserve `prototype` when cloning objects, but may fail in untested edge cases. Handles circular references. Does not clone functions. Use with some caution 🤫.

The native `structuredClone` is slower for small stuctures, faster for big, but it errors on functions, and doesn't preserve prototype. Choose wisely!

#### ö.immutable( v, deep? = true ) → immutable value

Returns a freezed clone of `v`. Set `deep` to `false` to make only top level immutable.

#### ö.id( v ) → v

Identity, takes and returns `v`.

#### ö.pipe( v, ...funcs ) → value

Pipes function calls for a value. For multiple arguments, use closures. Usage:

```js
ö.pipe(
    1,
    x => x * 6,
    x => x ** 2,
    x => x + 6,
    ö.log,
) // logs 42
```

#### ö.toPiped( ...funcs ) → function( v ) → value

Pipes function calls, and returns a function that takes the value to pipe. The data last save for later version of pipe.
Usage:

```js
const myPipe = ö.toPiped(
    x => x * 6,
    x => x ** 2,
    x => x + 6,
    ö.log,
)
myPipe(1) // logs 42
```

#### ö.pipeAsync( v, ...funcs ) → Promise

Same as `ö.pipe`, but awaits functions and returns a `Promise`.

#### ö.toPipedAsync( ...funcs ) → function( v ) → Promise

Pipes function calls, and returns a function that takes the value to pipe. That function returns a `Promise`.

#### ö.curry( f ) → function

Returns a [curried](https://en.wikipedia.org/wiki/Currying) version of `f`, allowing partial application of arguments. If `f` takes three arguments, it can be called like so:

```js
const f = (a, b, c) => a + b + c
const curried = ö.curry(f)

curried(1)(2)(3) // returns 6
// or
const partial = curried(1, 2)
partial(3) // also 6
```

#### ö.memoise/ö.memoize( f, keymaker? ) → f

Creates and returns memoised functions. By default, the arguments to the memoised function are used as key for storing the result (If only one argument, the raw input is used as key, if more than one, the arguments are joined to a string). If the arguments are objects instead of primitive values, you should provide a `keymaker`. `keymaker` receives all inputs from the memoised function, and should return something unique to use as a `Map` key for a given set of inputs. Use for example `JSON.stringify` when you expect objects as input.

#### ö.Enum/createEnum( object ) → Object

Creates and returns an enumerable, i.e. a frozen object where the keys have unique values. Lets you create kinda sorta vanilla typechecking light, but at runtime 🤪. Takes an object, or strings, or an array of strings, as input. In order for codehinting to work, you need to provide an explicit object.
Example:

```js
const SIZES = ö.Enum('small', 'medium', 'large')
// or:
const SIZES = ö.Enum(['small', 'medium', 'large'])
// or:
const SIZES = ö.Enum({
    small: Symbol('small'),
    medium: Symbol('medium'),
    large: Symbol('large'),
})
giveMeIcecream(SIZES.large)
```

#### ö.data( obj, key?, value? ) → data | data.key

Associates `obj` (Can be an `Object` or a `Symbol`) with data via a `WeakMap`. With only `key` set, acts as a getter for `key`. With `key` and `value` set, acts as a setter. Useful for associating data with DOM elements, images, cached files, or the like. If given an `Element`, it parses the `dataset` property and adds its properties to `data`.

If no `key`, returns `data` object.

### Mathy

#### ö.random( min, max, float? = false ) → integer | Number

Shorthand for random integers between `min` and `max`-1. If `max` is omitted or `Boolean`, assumes a `min` value of 0. If `max` is `Boolean`, `float` is assumed. If `float` is true, returns float instead of integer.

#### ö.randomNormal( mean? = 0, sigma? = 1 ) → Number

Returns random number from reasonably approximated normal distribution, centered around `mean`, with [more or less 68.2% of the sample set](https://en.wikipedia.org/wiki/68%E2%80%9395%E2%80%9399.7_rule) within ± `sigma`. Values max out at a bit above ± 3 `sigma`, with extreme outliers up to about ± 4 `sigma`. There are [more mathematically accurate methods](https://observablehq.com/@d3/d3-random#normal) to do this, but this method is fast, and good enough for most people. Use it for fun and visuals, not for statistical analysis 🤓.

#### ö.seededRandom( seed ) → Number

Returns random number between 0 and 1 in a deterministic sequence based on `seed`. Nothing fancy, just a fast and simple PRNG (don't use it for crypto 🙀). Seeds are cached, so subsequent calls with the same seed generates the next value in the sequence. `seed` can be a number or a string. If called without seed, uses `Math.random()` instead.

```js
ö.seededRandom('hello') // 0.62696239259094
ö.seededRandom('hello') // 0.7342567658051848
```

#### ö.round( n, precision? = 0 ) → Number

Returns `n` rounded to `precision` decimals.

#### ö.mod( n, divisor ) → Number

Returns remainder modulo `divisor`, for both positive and negative numbers. Returns a number that's always between `0` and `divisor`, unlike the `%` operator.

```js
ö.mod(9, 10) == 9 % 10 // True
ö.mod(-9, 10) == -9 % 10 // False, returns 1, instead of -9
```

#### ö.clamp( n, min, max ) → Number

Clamps `n` between `min` and `max`.

#### ö.wrap( n, min, max ) → Number

Wraps `n` around between `min` and `max`, pac-man style.

#### ö.closeEnough( a, b, tolerance? ) → Boolean

Checks if `a` is close enough to `b`, given `tolerance`. Tolerance defaults to `Number.EPSILON`.

#### ö.between( n, min, max ) → Boolean

Checks if `n` is between `min` and up to, but not including, `max`.

#### ö.normalise/ö.normalize( n, min, max, clamp? = true ) → Number

Normalises `n` to a value between 0 and 1, within range given by `min` and `max`. If `clamp == true` and value of `n` is out of range, the value is clamped.

#### ö.isPrime( n ) → Number

Checks if `n` is prime.

#### ö.gcd( a, b ) → Number

Finds greatest common divisor of `a` and `b`.

#### ö.lcm( a, b ) → Number

Finds least common multiple of `a` and `b`.

#### ö.lerp( a, b, t ) → Number

Interpolates linearly between `a` and `b`. `t` is a percentage value between 0 and 1.

#### ö.smoothstep( a, b, t ) → Number

Interpolates smoothly between `a` and `b`. `t` is a percentage value between 0 and 1.

#### ö.easeIn( a, b, t ) → Number

Eases in from `a` to `b`. `t` is a percentage value between 0 and 1.

#### ö.easeOut( a, b, t ) → Number

Eases out from `a` to `b`. `t` is a percentage value between 0 and 1.

#### ö.nthRoot( x, n ) → Number

Returns nth root of positive number, for example

```js
ö.nthRoot(256, 8) === 2
```

#### ö.factorial( n ) → Number

Returns the factorial of `n`.

#### ö.nChooseK( n, k ) → Number

Returns the number of ways to choose `k` elements from a set of `n` elements, i.e. the binomial coefficient.

#### ö.toPolar(x, y) → { r, theta }

Converts cartesian coordinates to polar.

#### ö.toCartesian(r, theta) → { x, y }

Converts polar coordinates to cartesian.

### String

#### ö.prettyNumber( n, locale? = 'sv-SE', precision? = 2 ) → String

Returns `n` rounded to `precision` decimals and formatted by `n.toLocaleString()`. Defaults to swedish formatting, because why not! `locale` is optional, if second argument is `Number`, `precision` is set instead.

#### ö.wrapFirstWords( s, numWords? = 3, startWrap? = '\<span\>', endWrap? = '\</span\>', startAtChar? = 0 ) → String

Returns `s` with first `numWords` words wrapped in `startWrap` and `endWrap`. Matches first words up to and including first punctuation. Optionally starts matching at index `startAtChar`. Matches special chars for nordic languages as well as \', ’ and -.

#### ö.toCamelCase( str ) → String

Returns regular sentence, kebab-case or snake_case string converted to camelCase. Leaves `--custom-properties` alone.

#### ö.delatinise/ö.delatinize( str ) → String

Delatinises string. For example, "Gås är gött, rock n' roll är passé" becomes "Gas ar gott, rock n roll ar passe".

#### ö.capitalise/ö.capitalize( str ) → String

Capitalises first letter. No fuss!

#### ö.toKebabCase( str ) → String

Returns regular sentence or camelCase string converted to kebab-case. Leaves `--customProperties` alone.

#### ö.charRange( start, end? ) → String

Returns a range of characters (including end). Takes either string in format "a-z", strings like "a", "z", or unicode codepoints as numbers. Use like so:

```js
ö.charRange('a-z') == 'abcdefghijklmnopqrstuvwxyz'
// or
ö.charRange(97, 97 + 25) == 'abcdefghijklmnopqrstuvwxyz'
```

#### ö.randomChars( numChars? = 10 ) → String

Returns `numChars` random characters. Max for `numChars` is 100. Useful for producing unique values (Or, to be precise, with a 1/426 825 223 812 027 400 796 974 891 518 773 732 340 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 chance of being a dupe 🤯).

#### ö.stripTags( str ) → String

Returns a string without html tags.

#### ö.when( bool, whenTrue, whenFalse? ) → value | empty string;

A slightly more readable wrapper around a ternary expression. Returns `whenTrue` if `bool` is true, otherwise returns the empty string. Optionally returns `whenFalse` if specified. Useful primarily in template strings.

### Async

Awaitable wrappers for `setTimeout`, `requestAnimationFrame` and events. Takes an optional awaited `f` with no arguments. If `f` is provided, returns result from `f`, otherwise returns `undefined`. (Except for `ö.waitFrames`, which calls `f` every frame if `everyFrame` is `true`, but only returns the result of the final call.)

#### ö.wait( t? = 0, f?, resetPrevCall? = false ) → Promise

Waits `t` milliseconds. If `resetPrevCall == true`, previous pending call is rejected.

#### ö.nextFrame( f? ) → Promise

[browser] Waits one frame.

#### ö.waitFrames( n? = 1, f?, everyFrame? = false ) → Promise

[browser] Waits `n` frames. If `everyFrame == true`, callback is executed every frame.

#### ö.waitFor( selector, event, f? ) → Promise

[browser] Waits for specified event. Takes only one element, and one event type.

#### ö.load( url, isJSON? = true, errorMessage? = null, settings? = {} ) → Promise

[browser (Alternatively: Use node 18+)] Loads (and parses) JSON. Optionally loads HTML. Super simple fetch wrapper. On error, simply returns the error message, or optionally returns your custom error message. If you need to pass headers or other settings to the fetch call, use the `settings` object.

#### ö.pipeAsync( v, ...funcs ) → Promise

See `ö.pipe`.

### Throttling

#### ö.throttle( f, t? = 50 ) → Function

Throttles execution of `f` to one call per `t` milliseconds. If called multiple times per period, the last call gets executed.

#### ö.debounce( f, t? = 50, immediately? = false ) → Function

Debounces execution of `f` until no calls are made within `t` milliseconds. If called multiple times per period, the last call gets executed. If `immediately` is set to `true`, the first call gets executed as well.

#### ö.onAnimationFrame( f ) → Function

[browser] Defers execution of `f` to next animation frame. If called multiple times per frame, the last call gets executed.

### Error handling and logging

All logging methods can be silenced globally by calling `ö.verbose(false)`.

#### ö.attempt( f, handler?, ...args) → result | handled error

Wrapper around a try statement. It attempts to call `f` with `...args`, and returns the result. If `f` throws, it returns `handler`, or the return value of `handler` if `handler` is a function. `handler` gets the error as argument. `handler` defaults to a function returning the caught error.

```js
let tried = ö.attempt(tryThis, 'It failed', 1, 2, 3)
// or
let tried = ö.attempt(() => tryThis(1, 2, 3), 'It failed')
// or
let tried = ö.attempt(tryThis, e => ö.log(e.message), 1, 2, 3)
```

#### ö.attemptAsync( f, handler?, ...args) → result | handled error

Same, but awaits `f` and `handler`.

#### ö.verbose( isVerbose?, isThrowing? ) → { isVerbose, isThrowing }

Set `isVerbose`, turns off error/message logging when set to `false`. Defaults to `true`. Optionally set `isThrowing` to `true`, in order to throw errors instead of logging them.

Returns an object containing the current state of `{ isThrowing, isVerbose }`.

#### ö.error( error, ...rest ) → console.error or thrown Error, arguments

Logs errors to console, optionally throws instead. Returns single argument, or multiple arguments as an array.

#### ö.warn( message, ...rest ) → console.warn, arguments

Outputs arguments to console. Returns single argument, or multiple arguments as an array.

#### ö.log( ...messages ) → console.log, arguments

Outputs arguments to console. Returns single argument, or multiple arguments as an array. Can be used like so: `let x = ö.log( y*z );` or to tap into a call chain.

#### ö.time( f?, label? ) → logs time, f return value | undefined

The basic usecase is as a simple wrapper for `console.time`, optionally with a label. If `f`is a string, it is used as a label. In that case, the timer ends when calling `ö.timeEnd` with a matching label.

Optionally, it accepts a function with no arguments, which gets timed, called and its value returned. In this case `console.timeEnd` is called internally.

#### ö.timeEnd( label? ) → logs time

Simple wrapper for `console.timeEnd`.

#### ö.message( str ) → 'ö says: ${str}'

Wrapper for internal messages.

### Basic type checking

Less verbose than `typeof`/`Array.isArray`/`instanceof`:

#### ö.isBool( v ) → Boolean

#### ö.isNum( v ) → Boolean

#### ö.isInt( v ) → Boolean

#### ö.isBigInt( v ) → Boolean

#### ö.isStr( v ) → Boolean

#### ö.isSym( v ) → Boolean

#### ö.isFunc( v ) → Boolean

#### ö.isArr( v ) → Boolean

#### ö.isNull( v ) → Boolean

#### ö.isDate( v ) → Boolean

#### ö.isMap( v ) → Boolean

#### ö.isSet( v ) → Boolean

#### ö.isRegex( v ) → Boolean

#### ö.isError( v ) → Boolean

#### ö.isNode( v ) → Boolean

Checks if `v` is a DOM node.

#### ö.is( v ) / ö.isDefined( v ) → Boolean

#### ö.isnt( v ) / ö.isUndefined( v ) → Boolean

#### ö.isObj( v ) → Boolean

`ö.isObj` excludes `Array`, `Map`, `Set`, `Date` and `RegExp`. And `null`, of course.

#### ö.isPlainObj( v ) → Boolean

Checks if `v` is a plain object a.k.a. pojo, that is, has the same prototype as `Object`.

#### ö.isNakedObj( v ) → Boolean

Checks if `v` is a naked object, that is, has `null` as prototype.

#### ö.isIterable( v ) → Boolean

Checks for `[Symbol.iterator]` in `v`.

### Environment

#### ö.isBrowser() → Boolean

Detects if we're running in a browser, by checking for `window.document`.

#### ö.isServer() → Boolean

Detects if we're running in a server environment, by checking for `process.versions`.

### Type conversion

#### ö.mapToObj( map ) → Object

Any iterable except strings work, but produce arraylike objects without a `length`.

#### ö.objToMap( obj ) → Map

#### ö.strToNum( str ) → Number

A slightly more competent `parseFloat`. Handles spaces, commas, and the like. Returns `NaN` for `+/-Infinity`, though. Feed it for example "Debt: -1 035,50$", and it returns `-1035.5`.

### DOM and browser

#### ö.getLocal( item ) → Object

[browser] Gets `item` from local or session storage, if any. Converts item to `Object` via `JSON.parse`. Checks `sessionStorage` first.

#### ö.setLocal( item, v, expire? = false ) → v

[browser] Sets `item` in local storage to `v`, and returns `v`. Optionally sets to `sessionStorage` if `expire` is true.

#### ö.getOrInsertLocal( item, defaultVal, expire? = false ) → v

[browser] Gets `item` from local storage, if any, otherwise inserts (and returns) default value.

#### ö.getCss( prop, selector? = ':root') → css property value

[browser] Gets `prop` on selected element, or from `document.documentElement` if `selector` is unset, and returns `v`. Mainly used for getting global `--props`, using css as master for global variables.

#### ö.setCss( prop, v, selector? = ':root') → v

[browser] Sets `prop` to `v`, optionally on selected element, and returns `v`.

#### ö.createElement( html, isSvg? = false ) → Element

[browser] Creates an `Element` from an html string. Optionally creates an `SVGElement`.

#### ö.parseDOMStringMap( o ) → Object

Parses a `DOMStringMap` as `JSON`. Used internally when reading from `Element.dataset`.

#### ö.deepest( element, selector? = '\*' ) → Element

[browser] Finds deepest `Element` in `element`, optionally matching `selector`.

### Random stuff

#### ö.rorövovarorsospoproråkoketot( str ) → String

Converts string to Rövarspråket.

# Chain

Chain a.k.a TypelessScript lets you chain any method calls, on any type, kind of like a pipe on speed 🧙, or a jQuery for any object. It simply shoves the return value around, allowing you to think about more important stuff than intermediate variables.

Here's an example:

```js
import { chain } from 'ouml/chain'

let guessWhat = chain(11)
    .f(v => [...Array(v).keys()])
    .map(v => v ** v)
    .sum()
    .toString()
    .length()
    .return()
```

It takes the number 11, makes an array of integers using the `.f()` directive, maps the values to the power of themselves, sums them using an `ö` method, converts the resulting number to a string, gets the length of the string, and returns it.

Here's another:

```js
import { chainAsync } from 'ouml/chain'

let errorMessage = 'error'

let nameOfPriciestProduct = await chainAsync('https://dummyjson.com/products')
    .load(true, errorMessage)
    .returnIf(v => v === errorMessage)
    .products()
    .sort((a, b) => a.price > b.price)
    .at(0)
    .title()
    .return()
```

It takes a url, loads it as json using an `ö` method, handles the error case, gets the products property of the json object, sorts it, gets the first one, gets the title, and returns it. Simple as that!

### Usage

`chain` chains method calls, but with some quirks and gotchas. For example, properties on objects can be retrieved by calling the property name as a function. Methods on objects in the global scope can be accessed by an underscore, for example `Object_groupBy()`. Also, if a method in the chain creates an error, the step is skipped by default (and the error is logged), prioritising a return value. You can override this by setting `isThrowing` to true, or handle the error with a `.try()`.
Use like so:

```js
import { chain, chainAsync } from 'ouml/chain'

let processedValue = chain('AnyValueOfAnyType')
    .anyMethodOnCurrentType()
    .anyPropertyOnCurrentValue()
    .anyMethodInÖ()
    .anyMethodInGlobalScope()
    .AnyObjectInGlobalScope_anyMethod()
    .f(anyFunction)
    .peek() // Logs current value and type
    .returnIf(anyFunctionReturningABoolean)
    .try(tryFunction, catchFunction)
    .return()
```

Or like so, saving the chain for later, providing the value last:

```js
import { chain } from 'ouml/chain'

const doStuffAndThings = chain().f(coolStuff).f(wonderfulThings).end()

let processedValue = doStuffAndThings('anyValue')
```

A quick note on performance: `chain` does string matching, proxying and other fun stuff that adds some overhead. It adds a small hit performance-wise, and might not be the best option in a game loop 😇. It's mainly a proof of concept, but since it produces some really nice, terse and readable code, it might come in handy in some situations!

### Methods

Chain exports two methods:

#### chain( value?, isThrowing? = false, isAsync? = false ) → Proxy

Chain wraps a value, and creates a `Proxy` that handles the chaining. `chain` evaluates lazily, so nothing is calculated until `.return()` or `.value` is called. Errors are skipped by default, set `isThrowing` to true to throw errors instead. Optionally, set `isAsync` to `true` to handle async values, or use:

#### chainAsync( value, isThrowing? = false ) → Proxy

Same as `chain`, but results in a `Promise` once the chain is executed.

### "Methods"

The chain proxy defines a few special cases, that look and behave like methods:

#### .return() → value

Executes call chain, and returns computed value.

#### .value → value

Same as `.return()`, executes call chain, and returns computed value.

#### () → value

A method call with no arguments has the same effect as `.return()` or `.value`, executes call chain, and returns computed value.

#### .end() → function( value ) → value

Ends the chain, and returns a function that takes a value and executes the chain on it, allowing you to save a chain as a function.

#### .returnIf( function ) → value | Proxy

Guard clause, lets you exit the call chain early. The function receives the current value as argument, and is expected to return a boolean. Returns current value on truthy values, otherwise continues call chain.

#### .try( tryFunction, catchFunction? ) → Proxy

Error handler, lets you try a function, and run `catchFunction` if it throws. `tryFunction` receives the current value as argument, `catchFunction` receives `value, error` as arguments. `catchFunction` defaults to `v => v`, simply passing the previous value along.

#### .peek() → Proxy

Lets you peek into the call chain, logging current value and type to the console.

#### .f( function ) → Proxy

`f` allows arbitrary functions to be passed into the call chain. The function receives the current value as argument. `f` is particularly useful for methods defined in a function or module scope, since these scopes are unreachable otherwise.

#### ( function ) → Proxy

A variant for passing in arbitrary functions is directly with parentheses, in effect calling the proxy as a function, with your function as the argument. This in turn can be chained, like so:

```js
let v = chain('Hi')(letsDo)(cool)(stuff)()
```

This doesn't play that nicely with Prettier, if you happen to use that, but it's cool!

#### .anyMethodOnCurrentType( ...args? ) → Proxy

Lets you call a method of the current value. Methods are called "as is", so for exemple a `.map(v => v)` on an array takes a function, `.toUpperCase()` on a string takes no argument, and `.toUpperCase()` on a number is skipped along with a warning to the console, since no such method exists on a number.

#### .anyPropertyOnCurrentValue( newVal? ) → Proxy

Lets you access properties on the current value as a method call, for example `.length()` to get the length of a string or an array. If `newVal` is provided, sets the property to `newVal`, and passes `newVal` along the chain.

#### .anyMethodInÖ( ...args? ) → Proxy

Lets you pass any `ö` method into the chain. The current value is passed as the first argument, so if you would normally call `ö.sum(arr)`, in a chain you need only call `.sum()`.

#### .anyMethodInGlobalScope( ...args? ) → Proxy

Lets you pass any global method into the chain. The current value is passed as the first argument, so if you would normally call `fetch('http://some.url')`, in a chain you need only call `.fetch()`.

#### .anyObjectInGlobalScope_anyMethod( ...args? ) → Proxy

Lets you pass any method on a global object into the chain. The current value is passed as the first argument, so if you would normally call `JSON.parse(someString)` or `Array.from(someIterable)`, in a chain you need only call `.JSON_parse()` or `.Array_from()`.

If you have defined any methods in the global scope that have underscores in their names, use `.f(v => my_global_method(v))` instead, since underscores get parsed out by the proxy.

# Öbservable

öbservable is loosely based on how vue.js handles reactivity, but it is much simpler, and, truthfully, not as good 🤪. It is, however, shockingly small, 1Kb minified.

### Usage

öbservable uses `Proxy` to intercept changes to observable values, and in doing so detects for exemple direct array manipulation.
Use like so:

```js
import { observable, isObservable, observe } from 'ouml/öbservable'

let obs = observable(['a', 'b', 'c'])
let lengthObserver = observe(
    () => obs.length,
    v => ö.log(`The length is ${v}`),
)
let firstItemObserver = observe(
    () => obs[0],
    v => ö.log(`The first item is ${v}`),
)
// Logs The length is 3, The first item is a

await ö.wait(666)
obs.shift()
// Logs The length is 2, The first item is b, after 666ms
```

You can also use the raw observable as input to `observe`, or call `observe` directly on the observable (due to some `Proxy` trickery):

```js
let thisGuy = observable({ name: 'Guy', surname: 'This' })

observe(thisGuy, (val, oldVal, changedProp) =>
    ö.log(`${changedProp} has changed`),
)

thisGuy.observe(v => ö.log(`Name: ${v.name}  Surname: ${v.surname}`))

thisGuy.surname = 'Fawkes'
```

When called as a method, the getter argument to `observe` is omitted.

### Methods

öbservable exports three methods:

#### observable( value ) → observable object

Takes a `value`, and returns it wrapped in an observable `Proxy`, recursively wrapping nested objects as well. If you add a new property to an observable, the value of the new property is made observable as well (if it's not a primitive).

If `value` is a primitive (`String`, `Number`, `Boolean` etc), the value is wrapped in an object with a single property: `value`. You cannot assign to a primitive observable value directly, you need to use the `value` prop instead, or else you'd overwite the proxy.

```js
let x = observable('foo')
observe(x, ö.log)
x = 'bar' // Won't work.
```

```js
let x = observable('foo')
observe(x, ö.log)
x.value = 'bar' // Assign to value instead.
```

#### observe( getter, callback ) → observer object

Takes a `getter`, responsible for reading an observable and producing a value, and a `callback` that acts on the value.
The `getter` can be either a raw observable, or a function returning the processed value of an observable.
The `callback` receives `value`, `prevValue`, `updatedKey` and `observer` as arguments. The values passed to `callback` are copied from the observable, so you can't mutate the observable value in the callback (that would create an infinite loop anyways, so don't try it 🤯).

If you're observing an object, `updatedKey` can be useful in order to retrieve and act on only the property that changed. However, if you're destructuring multiple properties from a nested object, `updatedKey` refers to the key local to the updated object, so in this case make sure not to use the same property name on different levels
.
`observer` is a reference to the observer object, giving access to primarily the `stop()` method.

If the getter is a raw primitive observable, the value is unwrapped before the callback is called, like so:

```js
let o = observable(0)
observe(o, v => ö.log(`The value is ${v}`)) // logs 'The value is 0'
```

or

```js
let o = observable(0)
o.observe(v => ö.log(`The value is ${v}`)) // logs 'The value is 0'
```

If the getter is a function, you need to access the `value` prop, like so:

```js
let o = observable(0)
observe(() => `The value is ${o.value}`, ö.log) // logs 'The value is 0'
```

It's a matter of taste, really.

When working with deep data structures, you can observe an entire object structure, and receive updates when properties on child objects change, like so:

```js
let deep = observable({
    a: { b: { c: { d: "What's the purpose of it all?" } } },
})
observe(deep, ö.log)
deep.a.b.c.d = 'Deep stuff'
```

The drawback with this, however, is that the entire object returned from the getter gets deep cloned every time the observer is triggered (to avoid recursion among other things). This is fairly untested with regards to performance, so try to keep the data structure fairly small. There are possible optimisations to be done here, maybe in the future...

When working with larger data structures, try to be as specific as possible in the getter. As a rule of thumb, get the values you output in the callback, nothing more. Maybe something like this:

```js
let bigAssObservable = observable(bigAssObject)
observe(() => {
    let {
        stuff,
        that,
        we,
        childObject: { really, need },
    } = bigAssObservable
    return { stuff, that, we, really, need }
}, renderSmallPartOfBigAssObject)
```

#### isObservable( value ) → Boolean

Checks whether a value is observable or not, just in case you'd forgotten.

### Observable object

`observable()` returns observables, responsible for notifying observers when their value changes. When an observable is read by an observer, the observer is added to an internal `Set` of observers. These get updated when values change.
If the observable holds a primitive value, it has a `value` property, otherwise values are accessed just like a regular object or array.
The observable also holds `Symbol`s for `observable` and `primitive`, used internally, and for easier debugging.

You can also call `observe` directly on an observable object (`observe` is not a proper property on the object though, this is handled by the getter in the `Proxy`).

### Observer object

`observe()` returns observers, holding the current value of the observed observable, and a few methods and properties for flow control. You don't need to save a reference to the object, but it might come in handy if you want to stop observing later on.

```js
let x = observable(0)
let o = observe(x, ö.log)
x.value = 666 // logs 666
o.stop()
```

#### o.pause()

Pauses the observer.

#### o.unpause()

You'll never guess.

#### o.stop()

Stops the observer from receiving updates, and unsubscribes the observer from observables.

#### o.update()

Updates current value and calls callback if the value has changed. Called internally by the observable.

#### o.value

Holds the most currently returned value from the `getter`. Usable mostly for debugging.

#### o.prevValue

Holds the previous value. Usable mostly for debugging.

#### o.paused

Set to `true` if paused, otherwise `undefined`.

#### o.stopped

Set to `true` if stopped, otherwise `undefined`.

# Övents

övents is a collection of should've-been-in-the-browser-already custom events.

### Usage

Övents implements the `svelte/action` interface, and are usable as svelte actions, but can be used in any browser context like so:

```js
let el = document.querySelector('#someElement')

resize(el)
// or, if you need cleanup:
let resizer = resize(el)

el.addEventListener('resize', someCallback)

// When you're done:
resizer.destroy()
```

### Events

#### resize

Emit when an `Element` gets resized, as observed by `ResizeObserver`. Relays the `ResizeObserverEntry` in the `details` object.

#### enterview, exitview

Emit when an `Element`'s bounding box enters or exits the viewport.

#### sticktotop, sticktobottom

Emit when an `Element`'s bounding box touches the top/bottom of the viewport. Useful for detecting when an `Element` with `position: sticky` sticks to the viewport. One caveat: This works only if the sticky elements have `top: 0` or `bottom: 0`.
Event status is passed via a `sticky` prop on the `details` object.

#### swipe

Emits `swipeleft`, `swiperight`, `swipeup`, `swipedown` when user swipes on a touch device. The implematation is rather basic, emitting en event on `touchend`, which creates a noticeable delay. For finegrained control, it is recommended that you roll your own swipe events adapted to your particular usecase.

#### clickoutside

Emits on click or tap outside `Element`.

# Colour

[Oklch](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) lets you use colour in an understandable way. `oklch` is great! Use `oklch`!

Hsla used to be great, but ever since [Css colour level 4](https://developer.mozilla.org/en-US/blog/css-color-module-level-4/) became the norm, there have been much better options for working with colour, so `ö.hsla` and `ö.toHsla` have been removed as of version 0.3.0.

And since oklch and its sibling oklab are great, there's really no need to support any other colour space for day-to-day use.

The `colour` module provides simple functions for working with immutable oklch colours in js. It exports the default function `colour()`, that creates `Colour` objects. It also exports `isColour()`.

Use like so:

```js
import colour, { isColour } from 'ouml/colour'

let red = colour('#f00')
let blue = colour('hsl(239.96 100% 50%)')
let purple = red.mix(blue)

ö.log(`${purple}`)
// logs oklch(53.9985% 0.1337 316.0189 / 1)

ö.log(isColour(purple), isColour(purple.valueOf()))
// logs true, false
```

Or without intermediaries:

```js
ö.log(`${colour('#f00').mix('hsl(239.96 100% 50%)')}`)
// logs oklch(53.9985% 0.1337 316.0189 / 1)
```

Or have a look at a [small demo](https://codepen.io/smlsvnssn/full/ExqWeQG).

### colour()

#### colour( lightness | cssString | Colour, chroma?, hue?, alpha? ) → Colour

The `colour` function creates `Colour`s from either css strings in hex/rgb/rgba/hsl/hsla/oklch format, or a `Colour`, or numeric values for the colour channels.

Inputs are clamped to valid values. `lightness` takes values between 0 and 1, `chroma` takes values between 0 and 0.4, `hue` takes values between 0 and 360, and `alpha` takes values between 0 and 1.

### Colour methods

The methods that return `Colour` are chainable, and the methods that return an array of `Colour`s are chainable via `.map()`.

All methods that interpolate between colours, such as `.mix()` or `.palette()`, interpolate through `oklab` by default, since oklab avoids hue variations when interpolating. Oklch and oklab are the only colourspaces supported. [Try out interpolation through different colour spaces here to see why](https://codepen.io/smlsvnssn/full/dyQaQvp).

#### Colour.lightness( v? ) → Colour

Getter/setter for the lightness value. Gets the value when used without argument. Sets the value if `number` is provided, or sets the value by calling `v` if a `function` is provided. The function gets the current lightness value as argument.

#### Colour.chroma( v? ) → Colour

Getter/setter for the chroma value. Works the same as `.lightness()`. For example, a `saturate` method might look like this:

```js
const saturate = (clr, amount = 0.01) => clr.chroma(v => v + amount)
```

#### Colour.hue( v? ) → Colour

Getter/setter for the hue value.

#### Colour.alpha( v? ) → Colour

Getter/setter for the alpha value.

#### ...Colour

`Colour` objects spread nicely into arrays, in `[l, c, h, a]` order.

#### Colour.valueOf() → { lightness, chroma, hue, alpha }

Returns an object with values. Useful for `console.log` or to get all values out.

#### Colour.toString() → css string

Returns a css string. Useful for all sorts of colour related things. Called implicitly on string concatenation and in template strings, so this works nicely:

```js
let red = colour('#e11')
let myDarkRedElement = `<div style="background:${red.darken()}; color:${red.lighten(0.8)}">Hello</div>`
```

#### Colour.complement() → Colour

Inverts the hue value. Nothing fancy.

#### Colour.invert() → Colour

Inverts lightness and hue.

#### Colour.darken( amount = 0.1 ) → Colour

Darkens `Colour` by a percentage of `amount`.

#### Colour.lighten( amount = 0.1 ) → Colour

Lightens `Colour` by a percentage of `amount`.

#### Colour.palette( colourspace? = 'oklab' ) → [Colours]

Returns a palette of 11 colours from light to dark, based on the current colour. Both chroma and lightness get adjusted to create a harmonious scale, so the exact original colour might not exist in the list.

#### Colour.gradient( clr: Colour | cssString | Colour[], type? = 'linear', rotation? = 0, position? = [0.5, 0.5], colourspace? = 'oklab' ) → css gradient string

A simple wrapper around css gradient strings, letting you create dynamic gradients easily.

`clr` can be either a css string, a `Colour`, or an array of `Colour`s. The current color is included at the start of the gradient.

Supports a subset of gradient options. Works for `'linear'`, `'radial'` and `'conic'` gradients. `position` has no effect on linear gradients, and `rotation` has no effect on radial gradients. There's no support for positional values for colours, all colours are added linearly. For fancier gradients, [roll your own](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_images/Using_CSS_gradients)!

A simple gradient from blackish to whiteish:

```js
let gradient = colour('#111').gradient('#eee')
// returns 'linear-gradient(in oklab 0deg, oklch(17.7638% 0 180 / 1), oklch(94.9119% 0 180 / 1))'
```

#### Colour.steps( clr: Colour | cssString, steps? = 1, colourspace? = 'oklab', interpolator? = ö.lerp ) → [Colours]

Interpolates between current colour and `colour`, in `steps`, and returns an array of `Colour`s. The start and end values are included in the array, so if `steps` is 1, the resulting array has three colours.

Lets you do for example:

```js
let html = `<div style="display:flex">${colour('hsl(42.41 100% 56%)')
    .steps('rgb(255, 33, 74)', 10)
    .map(v => `<div style="height:5rem; flex:1 0; background:${v}"></div>`)
    .join('')}</div>`
```

#### Colour.mix( clr: Colour | cssString, percent? = 0.5, colourspace? = 'oklab', interpolator? = ö.lerp ) → Colour

Blends two colours together, basically. Use it like this, for example:

```js
let html = ö.map(
    'Fancy effect:',
    (v, i, a) =>
        `<span style="color: ${colour('#000').mix(
            '#FE5C03',
            100 - (100 / a.length) * i,
        )}">${v}</span>`,
)
```

#### Colour.getInterpolator( clr: Colour | cssString, colourspace? = 'oklab', interpolator? = ö.lerp ) → function( t ) → Colour

Creates an interpolator function that takes a `t` value between 0 and 1, and returns the `Colour` at `t` between current colour and `colour`.

# Bits

Apparently, javascript stores a boolean as a byte, not a bit. Not at problem if you have a handful of them, but if you have thousands, or millions, `bits` can come in handy.

The `bits` module provides simple storage of and access to bits, costing an eighth of a standard boolean. It exports the default function `bits()`, that creates `Bits` objects. It also exports `isBits()`.

Handles loads of bits, up to 2^30 - 1 by the looks of it.

Use like so:

```js
import bits from 'ouml/bits'

let myBits = bits()

myBits.set(1_000_000)
myBits.get(999_999) // 0
myBits.get(1_000_000) // 1
```

### bits()

#### bits( number? | bigint? | string? | array? | Bits?, ...rest ) → Bits

The `bits` function creates `Bits` from any `number` or `bigint`. It can also take `string`s in binary format, i.e. `"1001"`. If you give it an `array`, it coerces all values to truthy/falsy before creating the bits. Optionally, you can give multiple arguments, like so:

```js
bits(true, 'yo', [], 1, 1n, () => 1).toString()
bits(63).toString()
bits([1, 1, 1, 1, 1, 1]).toString()
// 111111
```

#### isBits( v ) → boolean

Returns whether `v` is an instance of `Bits`.

### Bits methods

Methods that manipulate bits return `this` and are chainable.

#### Bits.get( index, asBool ) → number | boolean

Returns the bit at `index`.

#### Bits.set( index, value = 1 ) → Bits

Sets `index` to `1` if `value` is truthy, or not passed. Optionally pass a falsy `value` to clear bit at `index`.

#### Bits.flip( index ) → Bits

Flips bit at `index`.

#### Bits.clear( index ) → Bits

Clears bit at `index`.

#### Bits.slice( start = 0, end = Bits.length ) → Bits

Returns a slice of `Bits`.

#### Bits.range( start = 0, end = Bits.length ) yields bit

Generator, yields bits in given range.

#### ...Bits

`Bits` are iterable.

#### Bits.length

Returns the number of bits stored, a.k.a. index of most significant bit + 1.

#### Bits.valueOf()

Returns the `bigint` that contains the bits.

#### Bits.toString()

Returns the bits as a binary string.

# Spring

Spring animates a value, or a set of values, from its current value to its target value, using [spring physics](https://en.wikipedia.org/wiki/Hooke%27s_law). This animation is not time-bound, and results in a smoother motion than tween-based animations, especially when the target changes as the animation runs.

Spring runs in the main browser thread, so there's some sensitivity to renderblocking javascript execution, but the animation uses deltatime internally to compensate.

Use like so:

```js
import spring from 'ouml/spring'

let el = document.querySelector('#someEl')
let mySpring = spring(
    { x: 0, y: 0 },
    ({ x, y }) => (el.style.translate = `${x}px ${y}px`),
    { stiffness: 0.2 },
)

mySpring.setTarget({ x: 100, y: 100 }).then(doStuffWhenAnimationIsSettled)
```

or with a number value:

```js
let mySpring = spring(100, n => renderSomething(n))

mySpring.setTarget(200)
```

### spring()

`spring` creates `Spring` instances that handle animation.

#### spring( current, f , settings? ) → Spring

`spring` takes a `current` value, in the format of either a `number` or an `object` whose properties contain numbers.

`f` recieves a value in the same format, representing the updated current state, as well as a reference to the calling `Spring`. `f` is called every frame while the animation is running.

`settings` are provided in the format

```js
{ stiffness: 0.1, damping: 0.5, mass: 1, precision: 0.1 }
```

(default values). All parameters are optional. Values for stiffness and damping are clamped between 0 and 1, mass is clamped between 0.1 and 1000.

`stiffness`, or tension, controls how "springy" the animation feels. `damping`, or friction, controls how fast the animation slows down. A damping value of `0` will never settle. `mass` controls how heavy the animated object should feel, and `precision` controls the threshold for determining if the animation has settled.

### Spring methods and properties

#### Spring.setTarget( target, prevValue? ) → Promise

Sets target value for spring, and starts animation if it isn't running. Also updates the target while animation is running. Returns a `Promise` that resolves to the target value of `Spring` when the animation settles.

Accepts `prevValue` as a second argument, that can be used to give the animation an initial velocity. Defaults to the value of `current` if not specified, meaning the animation will start from zero velocity.

#### prevValue

Access to `prevValue` lets you calculate for example the difference vector between animation frames, letting you create effects like motionblur and directional rotation. [Here's an example](https://codepen.io/smlsvnssn/pen/XJKWqNP).

In principle:

```js
let el = document.querySelector('#someEl')

const renderEl = ({ x, y }, springInstance) => {
    let differenceVector = ö.toPolar(
        x - springInstance.prevValue.x,
        y - springInstance.prevValue.y,
    )
    el.style.translate = `${x}px ${y}px`
    el.style.scale = `${1 + differenceVector.r / 50} 1`
    el.style.rotate = `${differenceVector.theta}rad`
}

let mySpring = spring({ x: 0, y: 0 }, renderEl)
```

#### settings

Settings can be changed while the animation is running. Set them like this:

```js
mySpring.settings = { stiffness: 0.5 }
```
