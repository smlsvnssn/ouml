# ö.js
ö.js - a small collection of useful stuff.

Usage: 
```
npm install ouml 

import { random } from "ouml";
const oneOrZero = random();
```
or 
```
import * as ö from "ouml";
const oneOrZero = ö.random();
```

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
Methods for manipulating arrays or array-like objects. Inputs are coerced to `Array`, so `String`, `Set`, `Ö` and the like works as input as well. All methods are non-mutating.
	
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
Takes an `Array` of `Objects` with a common property. Returns a `Map` with keys corresponding to `prop` values, holding grouped values.
	
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
<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="9" height="9" stroke="white"/><rect x="5.5" y="5.5" width="9" height="9" stroke="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 0H0V10H5V15H15V5H10V0Z" fill="black"/></svg> Returns (unique) members  of both `a` and `b`.
	
Example: `ö.union([0, 1], [1, 2]) // returns [0, 1, 2]`

#### ö.isSubset( a, b ) → Boolean
Returns `true` if `a` is a subset of `b`.
	
### Logical / generic
#### ö.isEqual( a, b, deep = true ) → Boolean
Checks equality by value rather than reference. Checks own enumerable properties only. Works for all basic types and most built in classes, but may produce unexpected results in edge cases. Equality is tricky, and depends on what you personally beleive to be equal 😇. Does deep comparison by default, and may be slow for large data structures. If `deep == false`, does flat comparison instead.
	
#### ö.clone( v, deep = true ) → new value
Performs cloning of the most common object types, including `Array` and typed arrays, `Map`, `Set`, `Date` and generic objects. Defaults to deep cloning, set `deep` to `false` to perform shallow cloning. Clones own enumerable properties only, and does not set `prototype`, so objects depending on inheritance or class instances are not cloned properly. Does not clone functions. Use with some caution 🤫.	
	
#### ö.pipe( v, ...funcs ) → value
Pipes function calls. For multiple arguments, use closures. Usage: `ö.pipe(1, x => x*6, x => x**2, x => x+6, ö.log) => logs 42`.

#### ö.memoise( f, keymaker ) → f
Creates and returns memoised functions. By default, the arguments to the memoised function are used as key for storing the result (If only one argument, the raw input is used as key, if more than one, the arguments are joined to a string). If the arguments are objects instead of primitive values, you should provide a `keymaker`. `keymaker` receives all inputs from the memoised function, and should return something unique to use as a `Map` key for a given set of inputs. Use for example `JSON.stringify` when you expect objects as input.
		
### Mathy
#### ö.random( min, max, float = false ) → integer | Number
Shorthand for random integers between `min` and `max`-1. If `max` is omitted or `Boolean`, assumes a `min` value of 0. If `max` is `Boolean`, `float` is assumed. If `float` is true, returns float instead of integer.
	
#### ö.randomNormal( mean = 0, sigma = 1 ) → Number
Returns random number from reasonably approximated normal distribution, centered around `mean`, with <a href=https://en.wikipedia.org/wiki/68%E2%80%9395%E2%80%9399.7_rule target=_blank>more or less 68.2% of the sample set</a> within ± `sigma`. Values max out at a bit above ± 3 `sigma`, with extreme outliers up to about  ± 4 `sigma`. There are <a href=https://observablehq.com/@d3/d3-random#normal target=_blank>more mathematically accurate methods</a> to do this, but this method is fast, and good enough for most people. Use it for fun and visuals, not for statistical analysis 🤓.
	
Example: <code class="runnable">for (let i of ö.range(200)) ö('\<star>⭐️\</star>').appendTo(ö('content')).move(ö.randomNormal(0, window.innerWidth / 2), ö.randomNormal(0, window.innerHeight / 2), 3000).scale(ö.randomNormal(5, 3), 3000).hide(3000);</code>
	
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
	
#### ö.nthRoot( x, n ) → Number
Returns nth root of positive number, for example `ö.nthRoot( 256, 8 ) == 2`
	

### String
#### ö.prettyNumber( n, locale = 'sv-SE', precision = 2 )	→ String
Returns `n` rounded to `precision` decimals and formatted by `n.toLocaleString()`. Defaults to swedish formatting, because why not! `locale` is optional, if second argument is `Number`, `precision` is set instead. <code class="runnable">ö('code').html(() => ö.prettyNumber(ö.random(2**16, true)));</code>
	
#### ö.wrapFirstWords( s, numWords = 3, startWrap = '\<span\>', endWrap = '\</span\>', startAtChar = 0 ) → String
Returns `s` with first `numWords` words wrapped in `startWrap` and `endWrap`. Matches first words up to and including first punctuation. Optionally starts matching at index `startAtChar`. Matches special chars for nordic languages as well as \', ’ and -.
		
#### ö.toCamelCase( str ) → String
Returns regular sentence, kebab-case or snake_case string converted to camelCase. Leaves `--custom-properties` alone.
		
#### ö.toKebabCase( str ) → String
Returns regular sentence or camelCase string converted to kebab-case. Leaves `--customProperties` alone.
	
### Colours
<a href=https://css-tricks.com/yay-for-hsla/ target=_blank>Hsla</a> lets you use colour in an understandable way. `hsla` is great! Use `hsla`!
	
#### ö.toHsla( colour, asString = false) → { h, s, l, a } | String
Returns `colour` converted to an object with `hsla` values. Optionally returns a colour string in `hsla` format. Takes hex values, as well as all valid forms of rgb/rgba strings.
	
Hsla is really easy to work with compared to rgb. For example, a `darken` method could look like this, given a `hsla` object as input: `const darken = (c, amount) => (c.l-=amount, c)`
	
#### ö.hsla( h, s = 70, l = 50, a = 1 ) → String
Returns colour string in `hsla` format, for css input. Takes separate values, or a single object with properties `{ h, s, l, a }`.
		
### Async
Awaitable wrappers for `setTimeout`, `requestAnimationFrame` and events. Takes an optional awaited `f` with no arguments.

#### ö.wait( t = 0, f, resetPrevCall = false ) → Promise
Waits `t` milliseconds. If `resetPrevCall == true`, previous pending call is rejected.
		
#### ö.nextFrame( f ) → Promise
Waits one frame.
		
#### ö.waitFrames ( n = 1, f, everyFrame = false ) → Promise
Waits `n` frames. If `everyFrame == true`, callback is executed every frame.
		
#### ö.waitFor( selector, event, f ) → Promise
Waits for specified event. Takes only one element, and one event type.
	
#### ö.load( url, isJSON = true ) → Promise
Loads (and parses) JSON. Optionally loads HTML. Super simple fetch wrapper.
	

### Throttling
#### ö.throttle( f, t = 50 ) → Function
Throttles execution of `f` to one call per `t` milliseconds. If called multiple times per period, the last call gets executed.
	
#### ö.debounce( f, t = 50, immediately = false ) → Function
Debounces execution of `f` until no calls are made within `t` milliseconds. If called multiple times per period, the last call gets executed. If `immediately` is set to `true`, the first call gets executed as well.
	
#### ö.onAnimationFrame( f ) → Function
Defers execution of `f` to next animation frame. If called multiple times per frame, the last call gets executed.
	
	
### Error handling and logging	
#### ö.verbose( isVerbose, isThrowing = false ) → Boolean
Get/set `isVerbose`, turns off error/message logging when set to `false`. Defaults to `true`. Optionally set `isThrowing` to `true`, in order to throw errors instead.
	
#### ö.error( error, ...rest ) → console.error or thrown Error,  arguments
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

### DOM	
#### ö.createElement( html, isSvg = false ) → Element
Creates an `Element` from an html string. Optionally creates an `SVGElement`.
		
#### ö.parseDOMStringMap( o ) → Object
Parses a `DOMStringMap` as `JSON`. Used internally when reading from `Element.dataset`.

#### ö.data( element, key, value ) → data | data.key
Get/sets `data` on an `Element`. If no `key`, returns `data` object. Associates `Element` with `data` via `WeakMap`.

#### ö.deepest( element, selector = '\*' ) → Element
Finds deepest `Element` in `element`, optionally matching `selector`.

	
### Random stuff
#### ö.rorövovarorsospoproråkoketot( str ) → String
Converts string to Rövarspråket, like so: <code class="runnable">ö('code').text((_, v) => ö.rorövovarorsospoproråkoketot(v) );</code> 
