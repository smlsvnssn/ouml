# ö.js

ö.js - a small collection of useful stuff.

Usage:

```
(p)npm install ouml
```

```
import { random } from "ouml";
const oneOrZero = random();
```

or, with treeshaking:

```
import * as ö from "ouml";
const oneOrZero = ö.random();
```

Most methods are runnable within node/deno. Some methods require browser API:s, those are marked with [browser].

### Generators / Iterators

Helper methods for iterations, less verbose than regular loops.

#### ö.range( start, end, step = 1 ) yields Number

Yields `Number`s within specified range. Parameters `end` and `step` are optional. If `end` is not provided, range starts with `0`, and ends with `start`. Handles negative values. Useful in `for of` loops, for example `for (let i of ö.range(100)) doStuff(i);`.

#### ö.grid( width, height ) yields { x, y }

Yields `Object` with `x, y` coordinates. If `height` is omitted, `width` is assumed. Use like so: `for (let i of ö.grid(8)) drawChessboard(i.x, i.y);`.

#### ö.times( times, f = i => i, ...rest ) → Array

Calls a function `times` times, with `index` as argument. Additional arguments are passed on to `f` like so: `ö.times(100, (i, a, b) => i+a+b, 'a', 'b');`.

Returns an array containing the return values of `f`, or an array containing index values if `f` is `undefined`.

### Array / Iterable

Methods for manipulating arrays or array-like objects. Inputs are coerced to `Array`, so `String`, `Set` and the like works as input as well. All methods are non-mutating.

#### ö.rangeArray( start, end, step = 1 ) → Array

Returns an `Array` populated with given range.

#### ö.unique( arr ) → Array

Returns an `Array` with unique entries.

#### ö.shuffle( arr ) → Array

Returns a new shuffled `Array`.

#### ö.sample( arr, samples = 1 ) → Array item | Array

Returns random sample from `arr`, or an array of samples if `samples` is larger than one.

#### ö.sum( arr ) → Number

Sums `arr`, with `Number` coercion.

#### ö.mean( arr ) → Number

Calculates mean value of `arr`, with `Number` coercion.

#### ö.median( arr ) → Number

Calculates median value of `arr`, with `Number` coercion.

#### ö.max( arr ) → Number

Returns largest value in `arr`.

#### ö.min( arr ) → Number

Returns smallest value in `arr`.

#### ö.groupBy( arr, prop ) → Map

If `prop` is a string, takes an `Array` of `Objects` with a common property. If `prop` is a function, takes a function returning keys for grouping based on array contents. The function receives `value, index, array` as arguments.
Returns a `Map` with keys corresponding to `prop` values, holding grouped values as arrays.

#### ö.findDeep( arr, val, subArrayProp, prop ) → Array item

Finds first occurence of `val` in arrays of nested objects.
If `val` is a function, returns first item where `val` returns `true`. The function receives `value, index, array` as arguments. If `val` is a function, `prop` can be omitted.
If `val` is not a function, `val` is compared to the value of property `prop`.

`subArrayProp` is a `string` matching the property containing nested arrays.

#### ö.filterDeep( arr, val, subArrayProp, prop ) → Array item

Same as `ö.findDeep`, except it returns all matches.

### Set operations

Methods for comparing arrays or array-like objects. Inputs are coerced to `Array`. All methods return a new `Array`, or `Boolean`.
If all inputs to these methods are `Set`s, the outputs adhere to strict set logic. If the inputs are `Array`s, duplicate items are allowed (except in `union()`).

#### ö.intersect( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="9" height="9" stroke="white"/><rect x="5.5" y="5.5" width="9" height="9" stroke="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 5V10H5V5H10Z" fill="black"/></svg> Intersection, returns elements that are members of both `a` and `b`.
Example: `ö.intersect([0, 1], [1, 2]) // returns [1]`

#### ö.subtract( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="9" height="9" stroke="white"/><rect x="5.5" y="5.5" width="9" height="9" stroke="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H0V10H5V5H10V0Z" fill="black"/></svg> Difference, returns members of `a` but not members of `b`, i.e. subtracts `b` from `a`.
Example: `ö.subtract([0, 1], [1, 2]) // returns [0]`

#### ö.exclude( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H0V10H5V15H15V5H10V0ZM10 5H5V10H10V5Z" fill="black"/></svg> Symmetric difference, returns elements that are members of `a` or `b`, but not both.
Example: `ö.exclude([0, 1], [1, 2]) // returns [0, 2]`

#### ö.union( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="9" height="9" stroke="white"/><rect x="5.5" y="5.5" width="9" height="9" stroke="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H0V10H5V15H15V5H10V0Z" fill="black"/></svg> Returns (unique) members of both `a` and `b`.
Example: `ö.union([0, 1], [1, 2]) // returns [0, 1, 2]`

#### ö.isSubset( a, b ) → Boolean

Returns `true` if `a` is a subset of `b`.

### Logical / generic

#### ö.isEqual( a, b, deep = true ) → Boolean

Checks equality by value rather than reference. Checks own enumerable properties only. Works for all basic types and most built in classes, but may produce unexpected results in edge cases. Equality is tricky, and depends on what you personally beleive to be equal 😇. Does deep comparison by default, and may be slow for large data structures. If `deep == false`, does flat comparison instead.

#### ö.clone( v, deep = true, immutable = false ) → cloned value

Performs cloning of the most common object types, including `Array` and typed arrays, `Map`, `Set`, `Date` and generic objects. Defaults to deep cloning, set `deep` to `false` to perform shallow cloning. Clones own enumerable properties only, and does not set `prototype`, so objects depending on inheritance or class instances are not cloned properly. Does not clone functions. Use with some caution 🤫.

#### ö.immutable(v, deep = true) immutable value

Returns a freezed clone of `v`. Set `deep` to `false` to make only top level immutable.

#### ö.pipe( v, ...funcs ) → value

Pipes function calls. For multiple arguments, use closures. Usage: `ö.pipe(1, x => x*6, x => x**2, x => x+6, ö.log) -> logs 42`.

#### ö.pipeAsync( v, ...funcs ) → Promise

Same as `ö.pipe`, but awaits functions and returns a `Promise`.

#### ö.memoise( f, keymaker ) → f

Creates and returns memoised functions. By default, the arguments to the memoised function are used as key for storing the result (If only one argument, the raw input is used as key, if more than one, the arguments are joined to a string). If the arguments are objects instead of primitive values, you should provide a `keymaker`. `keymaker` receives all inputs from the memoised function, and should return something unique to use as a `Map` key for a given set of inputs. Use for example `JSON.stringify` when you expect objects as input.

#### ö.createEnum(arr) → Object;

Creates and returns an enumerable, i.e. an object where the keys and values are the same. Lets you create kinda sorta vanilla typechecking light. Takes strings, or an array of strings, as input.
Example: `const sizes = ö.createEnum('small', 'medium', 'large'); giveMeIcecream(sizes.large);`

#### ö.data( object, key, value ) → data | data.key

Adds a `data` property to `object` via a `WeakMap`. With only `key` set, acts as a getter for `key`. With `key` and `value` set, acts as a setter. Useful for associating data with DOM elements.

If no `key`, returns `data` object.

### Mathy

#### ö.random( min, max, float = false ) → integer | Number

Shorthand for random integers between `min` and `max`-1. If `max` is omitted or `Boolean`, assumes a `min` value of 0. If `max` is `Boolean`, `float` is assumed. If `float` is true, returns float instead of integer.

#### ö.randomNormal( mean = 0, sigma = 1 ) → Number

Returns random number from reasonably approximated normal distribution, centered around `mean`, with <a href=https://en.wikipedia.org/wiki/68%E2%80%9395%E2%80%9399.7_rule target=_blank>more or less 68.2% of the sample set</a> within ± `sigma`. Values max out at a bit above ± 3 `sigma`, with extreme outliers up to about ± 4 `sigma`. There are <a href=https://observablehq.com/@d3/d3-random#normal target=_blank>more mathematically accurate methods</a> to do this, but this method is fast, and good enough for most people. Use it for fun and visuals, not for statistical analysis 🤓.

#### ö.round( n, precision = 0 ) → Number

Returns `n` rounded to `precision` decimals.

#### ö.clamp( n, min, max ) → Number

Clamps `n` between `min` and `max`.

#### ö.between( n, min, max ) → Boolean

Checks if `n` is between `min` and `max`.

#### ö.normalize( n, min, max, clamp = true ) → Number

Normalizes `n` to a value between 0 and 1, within range given by `min` and `max`. If `clamp == true` and value of `n` is out of range, the value is clamped.

#### ö.lerp( a, b, t ) → Number

Interpolates linearly between `a` and `b`. `t` is a percentage value between 0 and 1.

#### ö.smoothstep( a, b, t ) → Number

Interpolates smoothly between `a` and `b`. `t` is a percentage value between 0 and 1.

#### ö.easeIn( a, b, t ) → Number

Eases in from `a` to `b`. `t` is a percentage value between 0 and 1.

#### ö.easeOut( a, b, t ) → Number

Eases out from `a` to `b`. `t` is a percentage value between 0 and 1.

#### ö.nthRoot( x, n ) → Number

Returns nth root of positive number, for example `ö.nthRoot( 256, 8 ) == 2`

#### ö.factorial( n ) → Number

Returns the factorial of `n`.

#### ö.nChooseK( n, k ) → Number

Returns the number of ways to choose `k` elements from a set of `n` elements, i.e. the binomial coefficient.

#### ö.toPolar(x, y) → { r, theta }

Converts cartesian coordinates to polar.

#### ö.toCartesian(r, theta) → { x, y }

Converts polar coordinates to cartesian.

### String

#### ö.prettyNumber( n, locale = 'sv-SE', precision = 2 ) → String

Returns `n` rounded to `precision` decimals and formatted by `n.toLocaleString()`. Defaults to swedish formatting, because why not! `locale` is optional, if second argument is `Number`, `precision` is set instead.

#### ö.wrapFirstWords( s, numWords = 3, startWrap = '\<span\>', endWrap = '\</span\>', startAtChar = 0 ) → String

Returns `s` with first `numWords` words wrapped in `startWrap` and `endWrap`. Matches first words up to and including first punctuation. Optionally starts matching at index `startAtChar`. Matches special chars for nordic languages as well as \', ’ and -.

#### ö.toCamelCase( str ) → String

Returns regular sentence, kebab-case or snake_case string converted to camelCase. Leaves `--custom-properties` alone.

#### ö.toKebabCase( str ) → String

Returns regular sentence or camelCase string converted to kebab-case. Leaves `--customProperties` alone.

#### ö.randomChars( numChars = 10 ) → String

Returns `numChars` random characters. Max for `numChars` is 100. Useful for producing unique values (Or, to be precise, with a 1/426 825 223 812 027 400 796 974 891 518 773 732 340 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 chance of being a dupe 🤯).

#### ö.stripTags( str ) → String

Returns a string without html tags.

### Colours

<a href=https://css-tricks.com/yay-for-hsla/ target=_blank>Hsla</a> lets you use colour in an understandable way. `hsla` is great! Use `hsla`!

#### ö.toHsla( colour, asString = false) → { h, s, l, a } | String

Returns `colour` converted to an object with `hsla` values. Optionally returns a colour string in `hsla` format. Takes hex values, as well as all valid forms of rgb/rgba strings.
Hsla is really easy to work with compared to rgb. For example, a `darken` method could look like this, given a `hsla` object as input: `const darken = (c, amount) => ({...c, l: c.l-amount})`

#### ö.hsla( h, s = 70, l = 50, a = 1 ) → String

Returns colour string in `hsla` format, for css input. Takes separate values, or a single object with properties `{ h, s, l, a }`.

### Async

Awaitable wrappers for `setTimeout`, `requestAnimationFrame` and events. Takes an optional awaited `f` with no arguments. If `f` is provided, returns result from `f`, otherwise returns `undefined`. (Except for `ö.waitFrames`, which calls `f` every frame if `everyFrame` is `true`, but only returns the result of the final call.)

#### ö.wait( t = 0, f, resetPrevCall = false ) → Promise

Waits `t` milliseconds. If `resetPrevCall == true`, previous pending call is rejected.

#### ö.nextFrame( f ) → Promise

[browser] Waits one frame.

#### ö.waitFrames ( n = 1, f, everyFrame = false ) → Promise

[browser] Waits `n` frames. If `everyFrame == true`, callback is executed every frame.

#### ö.waitFor( selector, event, f ) → Promise

[browser] Waits for specified event. Takes only one element, and one event type.

#### ö.load( url, isJSON = true ) → Promise

[browser (Alternatively: Use node-fetch)] Loads (and parses) JSON. Optionally loads HTML. Super simple fetch wrapper.

#### ö.pipeAsync( v, ...funcs ) → Promise

See `ö.pipe`.

### Throttling

#### ö.throttle( f, t = 50 ) → Function

Throttles execution of `f` to one call per `t` milliseconds. If called multiple times per period, the last call gets executed.

#### ö.debounce( f, t = 50, immediately = false ) → Function

Debounces execution of `f` until no calls are made within `t` milliseconds. If called multiple times per period, the last call gets executed. If `immediately` is set to `true`, the first call gets executed as well.

#### ö.onAnimationFrame( f ) → Function

[browser] Defers execution of `f` to next animation frame. If called multiple times per frame, the last call gets executed.

### Error handling and logging

#### ö.verbose( isVerbose, isThrowing = false ) → Boolean

Get/set `isVerbose`, turns off error/message logging when set to `false`. Defaults to `true`. Optionally set `isThrowing` to `true`, in order to throw errors instead.

#### ö.error( error, ...rest ) → console.error or thrown Error, arguments

Logs errors to console, optionally throws instead. Can be silenced globally by calling `ö.verbose(false)`. Returns single argument, or multiple arguments as an array.

#### ö.warn( message, ...rest ) → console.warn, arguments

Outputs arguments to console. Can be silenced globally by calling `ö.verbose(false)`. Returns single argument, or multiple arguments as an array.

#### ö.log( ...messages ) → console.log, arguments

Outputs arguments to console. Can be silenced globally by calling `ö.verbose(false)`. Returns single argument, or multiple arguments as an array. Can be used like so: `const x = ö.log( y*z );` or to tap into a call chain.

#### ö.message( str ) → 'ö🍳uery says: ${str}'

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

#### ö.is( v ) / ö.isDefined( v ) → Boolean

#### ö.isnt( v ) / ö.isUndefined( v ) → Boolean

#### ö.isObj( v ) → Boolean

`ö.isObj` excludes `Array`, `Map`, `Set`, `Date` and `RegExp`. And `null`, of course.

#### ö.isIterable( v ) → Boolean

Checks for `[Symbol.iterator]` in `v`.

### DOM and browser

#### ö.getLocal( item ) → Object

[browser] Gets `item` from local storage, if any. Converts item to `Object` via `JSON.parse`.

#### ö.setLocal = ( item, v ) → v

[browser] Sets `item` in local storage to `v`, and returns `v`.

#### ö.getCss = ( prop, selector = ':root') → css property value

[browser] Gets `prop` on selected element, or from `document.documentElement` if `selector` is unset. and returns `v`. Mainly used for getting global `--props`, using css as master for global variables.

#### ö.setCss = ( prop, v, selector = ':root') → v

[browser] Sets `prop` to `v`, optionally on selected element, and returns `v`.

#### ö.createElement( html, isSvg = false ) → Element

[browser] Creates an `Element` from an html string. Optionally creates an `SVGElement`.

#### ö.parseDOMStringMap( o ) → Object

Parses a `DOMStringMap` as `JSON`. Used internally when reading from `Element.dataset`.

#### ö.deepest( element, selector = '\*' ) → Element

[browser] Finds deepest `Element` in `element`, optionally matching `selector`.

### Random stuff

#### ö.rorövovarorsospoproråkoketot( str ) → String

Converts string to Rövarspråket.
