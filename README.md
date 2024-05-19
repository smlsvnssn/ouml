# ö.js

ö.js - a small collection of useful stuff.

Usage:

```
(p)npm install ouml
```

```js
import { random } from 'ouml'
const oneOrZero = random()
```

or, with treeshaking:

```js
import * as ö from 'ouml'
const oneOrZero = ö.random()
```

Most methods are runnable within node/deno. Some methods require browser API:s, those are marked with [browser].

## Modules

Includes modules [chain](#Chain), a method for chaining calls on any type, [öbservable](#%C3%B6bservable), a basic implementation of reactive values, and [övents](#%C3%B6vents), a collection of useful custom browser events.

Import them from

```js
import { chain, chainAsync } from 'ouml/chain'
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
```

## Methods

### Generators / Iterators

Helper methods for iterations, less verbose than regular loops.

#### ö.range( start, end, step = 1 ) yields Number

Yields `Number`s within specified range. Parameters `end` and `step` are optional. If `end` is not provided, range starts with `0`, and ends with `start`. Handles negative values. Useful in `for of` loops, for example

```js
for (let i of ö.range(100)) doStuff(i)
```

#### ö.grid( width, height ) yields { x, y }

Yields `Object` with `x, y` coordinates. If `height` is omitted, `width` is assumed. Use like so:

```js
for (let i of ö.grid(8)) drawChessboard(i.x, i.y)
```

#### ö.times( times, f = i => i, ...rest ) → Array

Calls a function `times` times, with `index` as argument. Additional arguments are passed on to `f` like so:

```js
ö.times(100, (i, a, b) => i + a + b, 'a', 'b')
```

Returns an array containing the return values of `f`, or an array containing index values if `f` is `undefined`.

### Array / Iterable

Methods for manipulating arrays or array-like objects. Inputs are coerced to `Array`, so `String`, `Set` and the like works as input as well. All methods are non-mutating.

#### ö.rangeArray( start, end, step = 1 ) → Array

Returns an `Array` populated with given range.

#### ö.map( arr, f | str ) → Array

Same as a normal map, except it accepts a `string` as a shorthand for retrieving values from a property.

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

#### ö.groupBy( arr, prop, asObject = false) → Map

If `prop` is a string, takes an `Array` of `Objects` with a common property. If `prop` is a function, takes a function returning keys for grouping based on array contents. The function receives `value, index, array` as arguments.

Returns a `Map` with keys corresponding to `prop` values, holding grouped values as arrays. Optionally returns an `object` if `asObject` is set to true.

#### ö.mapToTree( arr, idProp | f, parentProp) → Nested array

Maps a flat array of objects to a tree structure. Objects with children get a new `children` property, unsurprisingly containing an array of children 🙄. Leaf nodes have no `children` property. Works in one of two ways:

Either you provide an `idProp` and a `parentProp`, where the `ìdProp` holds a value unique to every item in the array, and `parentProp` holds a reference to the parent's `idProp` value (useful for example if you get a flattened hierarchic list from an api).

Or, you provide a mapping function responsible for providing a unique key for the item, and a unique key for the parent. The function receives `value, index, array` as arguments, and should produce an array with `[ ownKey, parentKey ]`. If the item has no parent, set `parentKey` to `null`. Useful for example for mapping urls to a hierarchy.

Parentless children (orphans) will be discarded.

Example:

```js
const flat = [
    { id: '1' },
    { id: '1.1', parent: '1' },
    { id: '1.1.1', parent: '1.1' },
    { id: '2' },
    { id: '2.2', parent: '2' },
]

const tree = mapToTree(flat, 'id', 'parent')
// or
const sameTree = mapToTree(flat, (item) => [
    item.id,
    item.id.split('.').slice(0, -1).join('.'),
])
```

#### ö.findDeep( arr, val, subArrayProp, prop ) → Array item

Finds first occurence of `val` in arrays of nested objects.
If `val` is a function, returns first item where `val` returns `true`. The function receives `value, index, array` as arguments. If `val` is a function, `prop` can be omitted.
If `val` is not a function, `val` is compared to the value of property `prop`.

`subArrayProp` is a `string` matching the property containing nested arrays.

#### ö.filterDeep( arr, val, subArrayProp, prop ) → Array item

Same as `ö.findDeep`, except it returns all matches.

### Set operations

Methods for comparing arrays or array-like objects. Inputs are coerced to `Set`. All methods return a new `Array`, or `Boolean`.
The outputs adhere to strict set logic. If the inputs are `Array`s, duplicate items are removed. All these methods will be replaced by internal `Set` methods when these become widely available in browsers.

#### ö.intersect( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="9" height="9" stroke="white"/><rect x="5.5" y="5.5" width="9" height="9" stroke="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 5V10H5V5H10Z" fill="black"/></svg> Intersection, returns elements that are members of both `a` and `b`.
Example:

```js
ö.intersect([0, 1], [1, 2]) // returns [1]
```

#### ö.subtract( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="9" height="9" stroke="white"/><rect x="5.5" y="5.5" width="9" height="9" stroke="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H0V10H5V5H10V0Z" fill="black"/></svg> Difference, returns members of `a` but not members of `b`, i.e. subtracts `b` from `a`.
Example:

```js
ö.subtract([0, 1], [1, 2]) // returns [0]
```

#### ö.exclude( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H0V10H5V15H15V5H10V0ZM10 5H5V10H10V5Z" fill="black"/></svg> Symmetric difference, returns elements that are members of `a` or `b`, but not both.
Example:

```js
ö.exclude([0, 1], [1, 2]) // returns [0, 2]
```

#### ö.union( a, b ) → Array

<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="9" height="9" stroke="white"/><rect x="5.5" y="5.5" width="9" height="9" stroke="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H0V10H5V15H15V5H10V0Z" fill="black"/></svg> Returns (unique) members of both `a` and `b`.
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

#### ö.isEqual/ö.equals( a, b, deep = true ) → Boolean

Checks equality by value rather than reference. Checks own enumerable properties only. Works for all basic types and most built in classes, but may produce unexpected results in edge cases. Equality is tricky, and depends on what you personally beleive to be equal 😇. Does deep comparison by default, and may be slow for large data structures. If `deep == false`, does flat comparison instead.

#### ö.clone( v, deep = true, immutable = false, preservePrototype = true ) → cloned value

Performs cloning of most common types, including `Array` and typed arrays, `Map`, `Set`, `Date` and objects. Defaults to deep cloning, set `deep` to `false` for shallow cloning. Tries to preserve `prototype` when cloning objects, but may fail in untested edge cases. Set `preservePrototype` to false to disable this (this is somewhat faster). Does not clone functions, and doesn't handle circular references. Use with some caution 🤫.

The native `structuredClone` is probably slower (by alot!) in most cases, errors on functions, and doesn't preserve prototype, but it handles circular references. Choose wisely!

#### ö.immutable(v, deep = true) immutable value

Returns a freezed clone of `v`. Set `deep` to `false` to make only top level immutable.

#### ö.pipe( v, ...funcs ) → value

Pipes function calls for a value. For multiple arguments, use closures. Usage:

```js
ö.pipe(
    1,
    (x) => x * 6,
    (x) => x ** 2,
    (x) => x + 6,
    ö.log,
) // logs 42
```

#### ö.toPiped( ...funcs ) → function( v ) → value

Pipes function calls, and returns a function that takes the value to pipe. The data last save for later version of pipe.
Usage:

```js
const myPipe = ö.toPiped(
    (x) => x * 6,
    (x) => x ** 2,
    (x) => x + 6,
    ö.log,
)
myPipe(1) // logs 42
```

#### ö.pipeAsync( v, ...funcs ) → Promise

Same as `ö.pipe`, but awaits functions and returns a `Promise`.

#### ö.toPipedAsync( ...funcs ) → function( v ) → Promise

Pipes function calls, and returns a function that takes the value to pipe. That function returns a `Promise`.

#### ö.curry( f ) → function

Returns a <a href='https://en.wikipedia.org/wiki/Currying' target=_blank>curried</a> version of `f`, allowing partial application of arguments. If `f` takes three arguments, it can be called like so:

```js
const f = (a, b, c) => a + b + c
const curried = ö.curry(f)

curried(1)(2)(3) // returns 6
// or
const partial = curried(1, 2)
partial(3) // also 6
```

#### ö.memoise/ö.memoize( f, keymaker ) → f

Creates and returns memoised functions. By default, the arguments to the memoised function are used as key for storing the result (If only one argument, the raw input is used as key, if more than one, the arguments are joined to a string). If the arguments are objects instead of primitive values, you should provide a `keymaker`. `keymaker` receives all inputs from the memoised function, and should return something unique to use as a `Map` key for a given set of inputs. Use for example `JSON.stringify` when you expect objects as input.

#### ö.createEnum( object ) → Object;

Creates and returns an enumerable, i.e. a frozen object where the keys and values are the same. Lets you create kinda sorta vanilla typechecking light, but at runtime 🤪. Takes an object, or strings, or an array of strings, as input.
Example:

```js
const sizes = ö.createEnum({ small: 'small', medium: 'medium', large: 'large' })
// or:
const sizes = ö.createEnum('small', 'medium', 'large')
// or:
const sizes = ö.createEnum(['small', 'medium', 'large'])

giveMeIcecream(sizes.large)
```

#### ö.data( anyVal, key, value ) → data | data.key

Associates `anyVal` with data via a `WeakMap`. With only `key` set, acts as a getter for `key`. With `key` and `value` set, acts as a setter. Useful for associating data with DOM elements. If given an `Element`, it parses the `dataset` property and adds its properties to `data`.

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

#### ö.normalise/ö.normalize( n, min, max, clamp = true ) → Number

Normalises `n` to a value between 0 and 1, within range given by `min` and `max`. If `clamp == true` and value of `n` is out of range, the value is clamped.

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

#### ö.prettyNumber( n, locale = 'sv-SE', precision = 2 ) → String

Returns `n` rounded to `precision` decimals and formatted by `n.toLocaleString()`. Defaults to swedish formatting, because why not! `locale` is optional, if second argument is `Number`, `precision` is set instead.

#### ö.wrapFirstWords( s, numWords = 3, startWrap = '\<span\>', endWrap = '\</span\>', startAtChar = 0 ) → String

Returns `s` with first `numWords` words wrapped in `startWrap` and `endWrap`. Matches first words up to and including first punctuation. Optionally starts matching at index `startAtChar`. Matches special chars for nordic languages as well as \', ’ and -.

#### ö.toCamelCase( str ) → String

Returns regular sentence, kebab-case or snake_case string converted to camelCase. Leaves `--custom-properties` alone.

#### ö.capitalise/ö.capitalize( str ) → String

Capitalises first letter. No fuss!

#### ö.toKebabCase( str ) → String

Returns regular sentence or camelCase string converted to kebab-case. Leaves `--customProperties` alone.

#### ö.randomChars( numChars = 10 ) → String

Returns `numChars` random characters. Max for `numChars` is 100. Useful for producing unique values (Or, to be precise, with a 1/426 825 223 812 027 400 796 974 891 518 773 732 340 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 000 chance of being a dupe 🤯).

#### ö.stripTags( str ) → String

Returns a string without html tags.

#### ö.when( bool, whenTrue, whenFalse = false ) → value | empty string;

A slightly more readable wrapper around a ternary expression. Returns `whenTrue` if `bool` is true, otherwise returns the empty string. Optionally returns `whenFalse` if specified. Useful primarily in template strings.

### Colours

<a href=https://css-tricks.com/yay-for-hsla/ target=_blank>Hsla</a> lets you use colour in an understandable way. `hsla` is great! Use `hsla`!

#### ö.toHsla( colour, asString = false) → { h, s, l, a } | String

Returns `colour` converted to an object with `hsla` values. Optionally returns a colour string in `hsla` format. Takes hex values, as well as all valid forms of rgb/rgba strings.
Hsla is really easy to work with compared to rgb. For example, a `darken` method could look like this, given a `hsla` object as input:

```js
const darken = (c, amount) => ({ ...c, l: c.l - amount })
```

#### ö.hsla( h, s = 70, l = 50, a = 1 ) → String

Returns colour string in `hsla` format, for css input. Takes separate values, or a single object with properties `{ h, s, l, a }`.

### Async

Awaitable wrappers for `setTimeout`, `requestAnimationFrame` and events. Takes an optional awaited `f` with no arguments. If `f` is provided, returns result from `f`, otherwise returns `undefined`. (Except for `ö.waitFrames`, which calls `f` every frame if `everyFrame` is `true`, but only returns the result of the final call.)

#### ö.wait( t = 0, f, resetPrevCall = false ) → Promise

Waits `t` milliseconds. If `resetPrevCall == true`, previous pending call is rejected.

#### ö.nextFrame( f ) → Promise

[browser] Waits one frame.

#### ö.waitFrames( n = 1, f, everyFrame = false ) → Promise

[browser] Waits `n` frames. If `everyFrame == true`, callback is executed every frame.

#### ö.waitFor( selector, event, f ) → Promise

[browser] Waits for specified event. Takes only one element, and one event type.

#### ö.load( url, isJSON = true, errorMessage = null, settings = {} ) → Promise

[browser (Alternatively: Use node-fetch)] Loads (and parses) JSON. Optionally loads HTML. Super simple fetch wrapper. On error, simply returns the error message, or optionally returns your custom error message. If you need to pass headers or other settings to the fetch call, use the `settings` object.

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

All logging methods can be silenced globally by calling `ö.verbose(false)`.

#### ö.verbose( isVerbose, isThrowing = false ) → Boolean

Get/set `isVerbose`, turns off error/message logging when set to `false`. Defaults to `true`. Optionally set `isThrowing` to `true`, in order to throw errors instead.

#### ö.error( error, ...rest ) → console.error or thrown Error, arguments

Logs errors to console, optionally throws instead. Returns single argument, or multiple arguments as an array.

#### ö.warn( message, ...rest ) → console.warn, arguments

Outputs arguments to console. Returns single argument, or multiple arguments as an array.

#### ö.log( ...messages ) → console.log, arguments

Outputs arguments to console. Returns single argument, or multiple arguments as an array. Can be used like so: `const x = ö.log( y*z );` or to tap into a call chain.

#### ö.time( f, label ) → logs time, f return value | undefined

The basic usecase is as a simple wrapper for `console.time`, optionally with a label. If `f`is a string, it is used as a label. In that case, the timer ends when calling `ö.timeEnd` with a matching label.

Optionally, it accepts a function with no arguments, which gets timed, called and its value returned. In this case `console.timeEnd` is called internally.

#### ö.timeEnd( label ) → logs time

Simple wrapper for `console.timeEnd`.

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

### Type conversion

#### ö.mapToObj( map ) → Object

#### ö.objToMap( obj ) → Map

### DOM and browser

#### ö.getLocal( item ) → Object

[browser] Gets `item` from local storage, if any. Converts item to `Object` via `JSON.parse`.

#### ö.setLocal( item, v ) → v

[browser] Sets `item` in local storage to `v`, and returns `v`.

#### ö.getCss( prop, selector = ':root') → css property value

[browser] Gets `prop` on selected element, or from `document.documentElement` if `selector` is unset. and returns `v`. Mainly used for getting global `--props`, using css as master for global variables.

#### ö.setCss( prop, v, selector = ':root') → v

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

## Chain

Chain a.k.a TypelessScript lets you chain any method calls, on any type, kind of like a pipe on speed 🧙, or a jQuery for any object. It simply shoves the return value around, allowing you to think about more important stuff than intermediate variables.

Here's an example:

```js
import { chain } from 'ouml/chain'

const guessWhat = chain(11)
    .f((v) => [...Array(v).keys()])
    .map((v) => v ** v)
    .sum()
    .toString()
    .length()
    .return()
```

It takes the number 11, makes an array of integers using the `.f()` directive, maps the values to the power of themselves, sums them using an `ö` method, converts the resulting number to a string, gets the length of the string, and returns it.

Here's another:

```js
import { chainAsync } from 'ouml/chain'

const errorMessage = 'error'

const nameOfPriciestProduct = await chainAsync('https://dummyjson.com/products')
    .load(true, errorMessage)
    .returnIf((v) => v === errorMessage)
    .products()
    .sort((a, b) => a.price > b.price)
    .at(0)
    .title()
    .return()
```

It takes a url, loads it as json using an `ö` method, handles the error case, gets the products property of the json object, sorts it, gets the first one, gets the title, and returns it. Simple as that!

### Usage

`chain` chains method calls, but with some quirks and gotchas. For example, properties on objects can be retrieved by calling the property name as a function. Methods on objects in the global scope can be accessed by an underscore, for example `Object_groupBy()`. Also, if a method in the chain creates an error, the step is skipped by default (and the error is logged), guaranteeing a return value. You can override this by setting `isThrowing` to true.
Use like so:

```js
import { chain, chainAsync } from 'ouml/chain'

const processedValue = chain('AnyValueOfAnyType')
    .anyMethodOnCurrentType()
    .anyPropertyOnCurrentValue()
    .anyMethodInÖ()
    .anyMethodInGlobalScope()
    .AnyObjectInGlobalScope_anyMethod()
    .f(anyFunction)
    .peek() // Logs current value and type
    .returnIf(anyFunctionReturningABoolean)
    .return()
```

A quick note on performance: `chain` does string matching, proxying and other fun stuff that adds some overhead. It adds a small hit performance-wise, and might not be the best option in a game loop 😇. It's mainly a proof of concept, but since it produces some really nice, terse and readable code, it might come in handy in some situations!

### Methods

Chain exports two methods:

#### chain( value, isThrowing = false, isAsync = false ) → Proxy

Chain wraps a value, and creates a `Proxy` that handles the chaining. `chain` evaluates lazily, so nothing is calculated until `.return()` or `.value` is called. Errors are skipped by default, set `isThrowing` to true to throw errors instead. Optionally, set `isAsync` to `true` to handle async values, or use:

#### chainAsync( value, isThrowing = false ) → Proxy

Same as `chain`, but results in a `Promise`.

### "Methods"

The chain proxy defines a few special cases, that looks and behaves like methods:

#### .return() → value

Executes call chain, and returns computed value.

#### .value → value

Same as `.return()`, executes call chain, and returns computed value.

#### () → value

A method call with no arguments has the same effect as `.return()` or `.value`, executes call chain, and returns computed value.

#### .returnIf( function ) → value | Proxy

Guard clause, lets you exit the call chain early. The function receives the current value as argument, and is expected to return a boolean. Returns current value on truthy values, otherwise continues call chain.

#### .peek() → Proxy

Lets you peek into the call chain, logging current value and type to the console.

#### .f( function ) → Proxy

`f` allows arbitrary functions to be passed into the call chain. The function receives the current value as argument. `f` is particularly useful for methods defined in a function or module scope, since these scopes are unreachable otherwise.

#### ( function ) → Proxy

A variant for passing in arbitrary functions is directly with parentheses, in effect calling the proxy as a function, with your function as the argument. This in turn can be chained, like so:

```js
const v = chain('Hi')(letsDo)(cool)(stuff)()
```

This doesn't play that nicely with Prettier, if you happen to use that, but it's cool!

#### .anyMethodOnCurrentType( ...args ) → Proxy

Lets you call a method of the current value. Methods are called "as is", so for exemple a `.map(v => v)` on an array takes a function, `.toUpperCase()` on a string takes no argument, and `.toUpperCase()` on a number is skipped along with a warning to the console, since no such method exists on a number.

#### .anyPropertyOnCurrentValue() → Proxy

Lets you access properties on the current value as a method call, for example `.length()` to get the length of a string or an array.

#### .anyMethodInÖ( ...args ) → Proxy

Lets you pass any `ö` method into the chain. The current value is passed as the first argument, so if you would normally call `ö.sum(arr)`, in a chain you need only call `.sum()`.

#### .anyMethodInGlobalScope( ...args ) → Proxy

Lets you pass any global method into the chain. The current value is passed as the first argument, so if you would normally call `fetch('http://some.url')`, in a chain you need only call `.fetch()`.

#### .anyObjectInGlobalScope_anyMethod( ...args ) → Proxy

Lets you pass any method on a global object into the chain. The current value is passed as the first argument, so if you would normally call `JSON.parse(someString)` or `Array.from(someIterable)`, in a chain you need only call `.JSON_parse()` or `.Array_from()`.

If you have defined any methods in the global scope that have underscores in their names, use `.f(v => my_global_method(v))` instead, since underscores get parsed out by the proxy.

## Öbservable

öbservable is loosely based on how vue.js handles reactivity, but it is much simpler, and, truthfully, not as good 🤪. It is, however, shockingly small, 1Kb minified.

### Usage

öbservable uses `Proxy` to intercept changes to observable values, and in doing so detects for exemple direct array manipulation.
Use like so:

```js
import { observable, isObservable, observe } from 'ouml/öbservable'

const obs = observable(['a', 'b', 'c'])
const lengthObserver = observe(
    () => obs.length,
    (v) => ö.log(`The length is ${v}`),
)
const firstItemObserver = observe(
    () => obs[0],
    (v) => ö.log(`The first item is ${v}`),
)
// Logs The length is 3, The first item is a

await ö.wait(666)
obs.shift()
// Logs The length is 2, The first item is b, after 666ms
```

You can also use the raw observable as input to `observe`, or call `observe` directly on the observable (due to some `Proxy` trickery):

```js
const thisGuy = observable({ name: 'Guy', surname: 'This' })

observe(thisGuy, (val, oldVal, changedProp) =>
    ö.log(`${changedProp} has changed`),
)

thisGuy.observe((v) => ö.log(`Name: ${v.name}  Surname: ${v.surname}`))

thisGuy.surname = 'Fawkes'
```

When called as a method, the getter argument to `observe` is omitted.

### Methods

öbservable exports three methods:

#### observable( value, deep = true, extendable = true ) → observable object

Takes a `value`, and returns it wrapped in an observable `Proxy`. By default, it recursively wraps nested objects as well. Set `deep` to `false` if you only want the top level to be observable (For example for observing changes in an `Array` of complex `Object`s, where the changes in individual objects are irrelevant). By default, if you add a new property to an observable, the new property is made observable as well (if it's not a primitive value). Set `extendable` to `false` to disable this behaviour.
If `value` is a primitive (`String`, `Number`, `Boolean` etc), the value is wrapped in an object with a single property: `value`. You cannot assign to a primitive observable value directly, you need to use the `value` prop instead, or else you'd overwite the proxy.

```js
let x = observable('foo')
observe(x, ö.log)
x = 'bar' // Won't work.
```

```js
const x = observable('foo')
observe(x, ö.log)
x.value = 'bar' // Declare a const, and assign to value instead.
```

#### observe( getter, callback, deep = false ) → observer object

Takes a `getter`, responsible for reading an observable and producing a value, and a `callback` that acts on the value.
The `getter` can be either a raw observable, or a function returning the processed value of an observable.
The `callback` receives `value`, `prevValue`, `updatedKey` and `observer` as arguments. The values passed to `callback` are copied from the observable, so you can't mutate the observable value in the callback (that would create an infinite loop anyways, so don't try it 🤯).
If you're observing an object, `updatedKey` can be useful in order to retrieve and act on only the property that changed. However, if you're destructuring multiple properties from a nested object, `updatedKey` refers to the key local to the updated object, so in this case make sure not to use the same property name on different levels.
`observer` is a reference to the observer object, giving access to primarily the `stop()` method.

If the getter is a raw primitive observable, the value is unwrapped before the callback is called, like so:

```js
const o = observable(0)
observe(o, (v) => ö.log(`The value is ${v}`))
// logs 'The value is 0'
```

If the getter is a function, you need to access the `value` prop, like so:

```js
const o = observable(0)
observe(() => `The value is ${o.value}`, ö.log)
// logs 'The value is 0'
```

It's a matter of taste, really.

However, when working with larger data structures, try to be as specific as possible in the `getter`, since returned values get copied from the observable (to avoid recursion among other things). As a rule of thumb, get the values you output in the callback, nothing more. Maybe something like this:

```js
const bigAssObservable = observable(bigAssObject)
observe(() => {
    const {
        stuff,
        that,
        we,
        childObject: { really, need },
    } = bigAssObservable
    return { stuff, that, we, really, need }
}, renderSmallPartOfBigAssObject)
```

When working with deep data structures, like a global state object with a reducer function, you may want to enable the `deep` option. This lets you observe an entire object structure, and receive updates when properties on child objects change, like so:

```js
const deep = observable({
    a: { b: { c: { d: "What's the purpose of it all?" } } },
})
observe(deep, ö.log, true)
deep.a.b.c.d = 'Deep stuff' // Triggers observer when deep option is true
```

The drawback with this option, however, is that the entire data structure gets deep cloned every time the observer is triggered. This is fairly untested with regards to performance, so use with caution, and try to keep the data structure small. There are possible optimisations to be done here, maybe in the future...

#### isObservable( value ) → Boolean

Checks whether a value is observable or not, just in case you'd forgotten.

### Observable object

`observable()` returns observables, responsible for notifying observers when their value changes. When an observable is read by an observer, the observer is added to an internal `Set` of observers. These get updated when values change.
If the observable holds a primitive value, it has a `value` property, otherwise values are accessed just like a regular object or array.
The observable also holds `Symbol`s for `observable`, `extendable` and `primitive`, used internally, and for easier debugging.

You can also call `observe` directly on an observable object (`observe` is not a proper property on the object though, this is handled by the getter in the `Proxy`).

### Observer object

`observe()` returns observers, holding the current value of the observed observable, and a few methods and properties for flow control. You don't need to save a reference to the object, but it might come in handy if you want to stop observing later on.

```js
const x = observable(0)
const o = observe(x, ö.log)
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

Updates current value an calls callback if the value has changed. Called internally by the observable.

#### o.value

Holds the most currently returned value from the `getter`. Usable mostly for debugging.

#### o.prevValue

Holds the previous value. Usable mostly for debugging.

#### o.paused

Set to `true` if paused, otherwise `undefined`.

#### o.stopped

Set to `true` if stopped, otherwise `undefined`.

## Övents

**övents** is a collection of should've-been-in-the-browser-already custom events.

### Usage

Övents implements she `svelte/action` interface, and are usable as svelte actions, but can be used in any browser context like so:

```js
const el = document.querySelector('#someElement')

resize(el)
// or, if you need cleanup:
const resizer = resize(el)

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

Emits `swipeleft`, `swiperight`, `swipeup`, `swipedown` when user swipes on a touch device.

#### clickoutside

Emits on click or tap outside `Element`.
