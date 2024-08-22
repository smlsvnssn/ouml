// @ts-check

/**
 * Generators
 */

/**
 * Grid - Yields `Object` with `x, y` coordinates
 * @param {number} width
 * @param {number} [height = width]
 * @yields {IterableIterator.<{x: number, y: number }>}
 */

export const grid = function* (width, height) {
    height ??= width
    let x = 0

    do {
        yield { x: x % width, y: Math.floor(x / width) }
    } while (++x < width * height)
}

/**
 * Range - Yields `Number`s within specified range.
 * @param {number} start
 * @param {number} [end = start]
 * @param {number} [step = 1]
 * @yields {IterableIterator<number>}
 */

// prettier-ignore
export const range = function* (start, end, step = 1) {
    ;[start, end, step] = isnt(end) ?
        [0, +start, +step]
    :   [+start, +end, +step]

    const count = start < end ?
        () => (start += step) < end
    :   () => (start -= step) > end

    do {
        yield start
    } while (count())
}

/**
 * Iterators
 */

/**
 * @callback timesCB
 * @param {number} index
 * @param  {Array} rest
 */

/**
 * Times - Calls a function `times` times, with `index` as argument.
 * @param {number} times
 * @param {timesCB} f
 * @param  {Array} rest
 * @returns {Array}
 */

export const times = (times, f = i => i, ...rest) =>
    Array(Math.abs(times))
        .fill(0)
        // @ts-ignore
        .map((_, i) => f(i, ...rest))

/**
 * Array/Iterable
 */

/**
 * RangeArray - Returns an `Array` populated with given range.
 * @param {number} start
 * @param {number} [end = start]
 * @param {number} [step = 1]
 * @returns {Array<number>}
 */

export const rangeArray = (start, end, step) => [...range(start, end, step)]

/**
 * @callback reduceCB
 * @param {*} accumulator
 * @param {*} value
 * @param {number} index
 * @param {Array} array
 */

/**
 * @callback mapCB
 * @param {*} value
 * @param {number} index
 * @param {Array} array
 */

/**
 * Map - Same as a normal map, except it accepts a `string` as a shorthand for retrieving values from an object property, if the iterable contains objects.
 * @param {Iterable} iterable
 * @param {(string | mapCB)} f
 * @returns {Iterable}
 */

export const map = (iterable, f) => {
    const getMapper = f =>
        isFunc(f) ? f
        : isMap(iterable) ? v => [v[0], v[1]?.[f]]
        : v => v[f]

    const getMap = iterable => Array.from(iterable).map(getMapper(f))

    if (!isIterable(iterable))
        return error('Argument "iterable" must be an iterable.')

    if (isStr(iterable)) return getMap(iterable).join('')

    if (isMap(iterable)) return new Map(getMap(iterable))

    if (isSet(iterable)) return new Set(getMap(iterable))

    if ('map' in iterable && isFunc(iterable.map))
        return iterable.map(getMapper(f))

    return getMap(iterable) // Base case: Just convert to array
}

/**
 * Unique - Returns an `Array` with unique entries.
 * @param {Iterable} arr
 * @returns {Array}
 */

export const unique = arr => [...new Set(arr)]

/**
 * Shuffle - Returns a new shuffled `Array`.
 * @param {Iterable} iterable
 * @returns {Array}
 * @see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 */

export const shuffle = iterable => {
    let a = Array.from(iterable)

    // classic loop for performance reasons
    for (let i = a.length - 1; i > 0; i--) {
        let j = random(i + 1)
        ;[a[i], a[j]] = [a[j], a[i]]
    }

    return a
}

/**
 * Sample - Returns random sample from `arr`, or an array of samples if `samples` is larger than one.
 * @param {Iterable} iterable
 * @param {number} [samples = 1]
 * @returns {(* | Array)}
 */

// prettier-ignore
export const sample = (iterable, samples = 1) => {
    let arr = Array.from(iterable)

    // since shuffle is fast, shuffle whole array before sampling, ez!
    return samples === 1 ?
        arr[random(arr.length)]
        : shuffle(arr).slice(0, samples)
}

/**
 * Sum - Sums `arr`, with `Number` coercion.
 * @param {Iterable<number>} iterable
 * @returns {number}
 */

export const sum = iterable =>
    Array.from(iterable).reduce((a, v) => a + Number(v), 0) 

/**
 * Mean - Calculates mean value of `arr`, with `Number` coercion.
 * @param {Iterable<number>} iterable
 * @returns {number}
 */

export const mean = iterable => sum(iterable) / Array.from(iterable).length

/**
 * Product - Returns product of `arr`, with `Number` coercion.
 * @param {Iterable<number>} iterable
 * @returns {number}
 */

export const product = iterable =>
    Array.from(iterable).reduce((a, v) => a * Number(v), 1) 

/**
 * Geometric mean - Calculates the geometric mean of `arr`, with `Number` coercion.
 * @param {Iterable<number>} iterable
 * @returns {number}
 */

export const geometricMean = iterable =>
    nthRoot(product(iterable), Array.from(iterable).length)

/**
 * Median - Calculates median value of `arr`, with `Number` coercion.
 * @param {Iterable<number>} arr
 * @returns {number}
 */

// prettier-ignore
export const median = (arr) => {
    let a = Array.from(arr).sort(
        (a, b) => Number(a) - Number(b)
    )
    let m = Math.floor(a.length / 2)
    
    return m % 2 ? 
    (Number(a[m - 1]) + Number(a[m])) / 2
    :   Number(a[m])
}

/**
 * Max - Returns largest value in `arr`.
 * @param {Iterable<number>} arr
 * @returns {number}
 */

export const max = arr => Math.max(...arr)

/**
 * Min - Returns smallest value in `arr`.
 * @param {Iterable<number>} arr
 * @returns {number}
 */

export const min = arr => Math.min(...arr)

/**
 * GroupBy - Returns a `Map` with keys corresponding to `prop` values.
 * @param {Iterable} arr
 * @param {(string | mapCB)} prop
 * @param {boolean} [asObject = false]
 * @returns {Map<*, Array> | Object.<string, Array>}
 */

export const groupBy = (arr, prop, asObject = false) =>
    // @ts-ignore
    globalThis[asObject ? 'Object' : 'Map'].groupBy(
        arr,
        isFunc(prop) ? prop : v => v[prop],
    )

/**
 * MapToTree - Maps a flat array of objects to a tree structure.
 * @param {Array<Object>} arr
 * @param {(string | mapCB)} idProp
 * @param {string} [parentProp]
 * @returns {Array}
 */

export const mapToTree = (arr, idProp, parentProp) => {
    let parents = new Map()
    let rootKey = null

    for (let [i, v] of arr.entries()) {
        let [key, parentKey] =
            isFunc(idProp) ?
                idProp(v, i, arr) // Should return [ownKey, parentKey]
            :   [v[idProp], v?.[parentProp ?? ''] ?? rootKey]

        if (parents.has(parentKey))
            parents.get(parentKey).push({ key, v }) // Using .push for performance reasons
        else parents.set(parentKey, [{ key, v }])
    }

    const traverse = (parentKey = rootKey) =>
        parents.get(parentKey)?.map(parent => ({
            // did you see the base case? Pretty small eh?
            ...parent.v,
            children: traverse(parent.key),
        }))

    return traverse()
}

/**
 * Methods for arrays of nested objects
 */

/**
 * ReduceDeep - Reduces arrays of nested objects to a single value.
 * @param {Array<Object>} arr
 * @param {reduceCB} f
 * @param {string} subArrayProp
 * @param {*} [initial]
 * @param {*} [flatten = false]
 * @param {boolean} [isFirstItem = true] Do not set, used by recursive calls
 * @returns {*}
 */

export const reduceDeep = (
    arr,
    f,
    subArrayProp,
    initial,
    flatten = false,
    isFirstItem = true,
) => {
    const traverse = (subArr, initial) =>
        reduceDeep(subArr, f, subArrayProp, initial, flatten, false)

    for (let [i, v] of arr.entries()) {
        initial = isFirstItem && isnt(initial) ? v : f(initial, v, i, arr)

        if (v[subArrayProp]) {
            if (!flatten && isArr(initial) && isObj(initial[i]))
                initial[i][subArrayProp] = traverse(v[subArrayProp], [])
            else initial = traverse(v[subArrayProp], initial)
        }
    }

    return initial
}

/**
 * MapDeep - Maps over arrays of nested objects.
 * @param {Array<Object>} arr
 * @param {mapCB} f
 * @param {string} subArrayProp
 * @param {*} [flatten = false]
 * @returns {Array}
 */

export const mapDeep = (arr, f, subArrayProp, flatten = false) =>
    reduceDeep(
        arr,
        (acc, v, i) => (
            isFunc(f) ? acc.push(f(v, i, arr)) : acc.push(v[f]), acc
        ),
        subArrayProp,
        [],
        flatten,
    )

/**
 * FilterDeep - Finds items that match `f` in arrays of nested objects.
 * @param {Array<Object>} arr
 * @param {mapCB} f
 * @param {string} subArrayProp
 * @returns {Array}
 */

export const filterDeep = (arr, f, subArrayProp, prop) =>
    reduceDeep(
        arr,
        (acc, v, i) => {
            if (isFunc(f)) {
                if (f(v, i, arr)) acc.push(v)
            } else if (v[prop] === f) acc.push(v)
            return acc
        },
        subArrayProp,
        [],
    )

/**
 * FindDeep - Same as `ö.filterDeep`, except it returns first match.
 * @param {Array<Object>} arr
 * @param {mapCB} f
 * @param {string} subArrayProp
 * @returns {(* | undefined)}
 */

export const findDeep = (arr, f, subArrayProp, prop) => {
    for (let [i, v] of arr.entries()) {
        if (isFunc(f)) {
            if (f(v, i, arr)) return v
        } else if (v[prop] === f) return v

        if (v[subArrayProp]) {
            let result = findDeep(v[subArrayProp], f, subArrayProp, prop)
            if (is(result)) return result
        }
    }

    return undefined
}

/**
 * Set operations
 */

/**
 * Intersect - Intersection, returns elements that are members of both `a` and `b`.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const intersect = (a, b) => [...new Set(a).intersection(new Set(b))]

/**
 * Subtract - Difference, returns members of `a` but not members of `b`, i.e. subtracts `b` from `a`.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const subtract = (a, b) => [...new Set(a).difference(new Set(b))]

/**
 * Exclude - Symmetric difference, returns elements that are members of `a` or `b`, but not both.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const exclude = (a, b) => [...new Set(a).symmetricDifference(new Set(b))]

/**
 * Union - Returns (unique) members of both `a` and `b`.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const union = (a, b) => [...new Set(a).union(new Set(b))]

/**
 * IsSubset - Returns `true` if `a` is a subset of `b`.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */

export const isSubset = (a, b) => new Set(a).isSubsetOf(new Set(b))

/**
 * IsSuperset - Returns `true` if `a` is a superset of `b`.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */

export const isSuperset = (a, b) => new Set(a).isSupersetOf(new Set(b))

/**
 * IsDisjoint - Returns `true` if `a` and `b` share no members.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */

export const isDisjoint = (a, b) => new Set(a).isDisjointFrom(new Set(b))

/**
 * DOM methods
 */

/**
 * CreateElement - Creates an `Element` from an html string. Optionally creates an `SVGElement`.
 * @param {string} html Following the format "<tag>"
 * @param {boolean} [isSvg = false]
 * @returns {HTMLElement | SVGElement}
 */

export const createElement = (html, isSvg = false) => {
    let template = document.createElement('template')

    if (isSvg) {
        template.innerHTML = `<svg>${html.trim()}</svg>`
        // @ts-ignore
        return template.content.firstChild.firstChild
    }

    template.innerHTML = html.trim()
    // @ts-ignore
    return template.content.firstChild
}

/**
 * parseDOMStringMap
 * @param {DOMStringMap} obj
 * @returns {Object}
 */

export const parseDOMStringMap = obj => {
    // convert from DOMStringMap to object
    let o = { ...obj }

    // parse what's parseable
    for (let key in o)
        try {
            // @ts-ignore
            o[key] = JSON.parse(o[key])
        } catch (e) {}

    return o
}

// global data storage
const d = new WeakMap()

/**
 * Data - Associates `anyVal` with data via a `WeakMap`.
 * @param {*} anyVal
 * @param {(string | Object)} key
 * @param {*} value
 * @returns {Object.<string, *> | *}
 */

export const data = (anyVal, key, value) => {
    let thisData =
        d.has(anyVal) ? d.get(anyVal) : parseDOMStringMap(anyVal?.dataset)

    if (is(value) || isObj(key))
        d.set(
            anyVal,
            Object.assign(thisData, isObj(key) ? key : { [key]: value }),
        )

    return isStr(key) ? thisData[key] : thisData
}

/**
 * Deepest - Finds deepest element in element matching selector.
 * Potential performance hog for deep DOM structures.
 * @param {Element} element
 * @param {string} [selector]
 * @returns {Element}
 */

export const deepest = (element, selector = '*') => {
    let deepestEl = { depth: 0, deepestElement: element }

    for (let el of element.querySelectorAll(selector)) {
        let depth = 0

        // @ts-ignore
        for (let e = el; e !== element; depth++) e = e.parentNode // from bottom up
        deepestEl =
            depth > deepestEl.depth ?
                { depth: depth, deepestElement: el }
            :   deepestEl
    }

    return deepestEl.deepestElement
}

/**
 * Logical
 */

/**
 * IsEqual - Checks equality by value rather than reference.
 * Based on https://www.30secondsofcode.org/js/s/equals
 * TODO: Use Reflect.ownKeys? Testcase?
 * @param {*} a
 * @param {*} b
 * @param {boolean} deep
 * @returns {boolean}
 */

export const isEqual = (a, b, deep = true) =>
    a === b ? true
        // are same date?
    : a instanceof Date && b instanceof Date ? a.getTime() === b.getTime()
        // are lexically same functions? (Closures not compared)
    : a instanceof Function && b instanceof Function ? '' + a === '' + b
        // are nullish?
    : !a || !b || (typeof a !== 'object' && typeof b !== 'object') ? a === b
        // have same prototype?
    : Reflect.getPrototypeOf(a) !== Reflect.getPrototypeOf(b) ? false
        // have same length ?
    : Reflect.ownKeys(a).length !== Reflect.ownKeys(b).length ? false
        // have same properties and values? (Recursively if deep)
    : Reflect.ownKeys(a).every(k =>
            deep ? isEqual(a[k], b[k]) : a[k] === b[k],
        )

export const equals = isEqual

/**
 * Clone - Performs deep cloning of most common types.
 * @param {*} v
 * @param {boolean} [deep]
 * @param {boolean} [immutable]
 * @param {boolean} [preservePrototype]
 * @returns {*}
 */

export const clone = (
    v,
    deep = true,
    immutable = false,
    preservePrototype = true,
) => {
    const doClone = v =>
        deep ? clone(v, deep, immutable, preservePrototype) : v
    const doFreeze = v => (immutable ? Object.freeze(v) : v)

    // Return primitives and functions as is.
    // no cloning of functions, too gory. They are passed by reference instead
    if (typeof v != 'object' || isNull(v)) return v

    // catch arraylike
    if ('map' in v && isFunc(v.map)) return doFreeze(v.map(i => doClone(i)))

    if (isMap(v)) return doFreeze(new Map(doClone(Array.from(v))))

    if (isSet(v)) return doFreeze(new Set(doClone(Array.from(v))))

    if (isDate(v)) return doFreeze(new Date().setTime(v.getTime()))

    let o = {}
    for (let key of Reflect.ownKeys(v)) o[key] = doClone(v[key])

    return doFreeze(
        preservePrototype ?
            Object.assign(Object.create(Reflect.getPrototypeOf(v) ?? {}), o)
        :   o,
    )
}

/**
 * Immutable - Returns a freezed clone of `v`.
 * @param {*} v
 * @param {boolean} deep
 * @returns {*}
 */

export const immutable = (v, deep = true) => clone(v, deep, true)

/**
 * Pipe - Pipes function calls for a value.
 * @param {*} v
 * @param  {...function} funcs
 * @returns {*}
 */

export const pipe = (v, ...funcs) => funcs.reduce((x, f) => f(x), v)

/**
 * ToPiped - Pipes function calls, and returns a function that takes the value to pipe.
 * @param  {...function} funcs
 * @returns {(v: any) => any}
 */

export const toPiped =
    (...funcs) =>
    v =>
        pipe(v, ...funcs)

/**
 * PipeAsync
 * @param {*} v
 * @param  {...function} funcs
 * @returns {Promise}
 */

export const pipeAsync = async (v, ...funcs) =>
    await funcs.reduce(async (x, f) => f(await x), v)

/**
 * ToPipedAsync
 * @param  {...function} funcs
 * @returns {(v: *) => Promise}
 */

export const toPipedAsync =
    (...funcs) =>
    v =>
        pipeAsync(v, ...funcs)

/**
 * Curry - Returns a curried version of `f`.
 * @param {function} f
 * @returns {(...args: *) => (function | *)}
 */

export const curry =
    f =>
    (...args) =>
        f.length > args.length ?
            (...newArgs) => curry(f)(...args, ...newArgs)
        :   f(...args)

/**
 * Memoise - Creates and returns memoised functions.
 * @param {function} f
 * @param {(...args: *) => (string | number)} [keymaker]
 * @returns {function}
 */

export const memoise = (f, keymaker) => {
    let cache = new Map()

    return (...args) => {
        let key =
            isFunc(keymaker) ? keymaker(...args)
            : args.length > 1 ? args.join('-')
            : args[0]

        if (cache.has(key)) return cache.get(key)

        let result = f(...args)
        cache.set(key, result)

        return result
    }
}

// for the yankees
export const memoize = memoise

/**
 * CreateEnum - Creates and returns an enumerable.
 * @template T
 * @param {T} v This lies a bit. TODO: Find solution
 * @returns {Readonly<T>}
 */

export const createEnum = (v, ...rest) => {
    if (rest.length == 0 && isObj(v)) return Object.freeze(v)

    let enu = {}
    for (let val of isArr(v) ? [...v, ...rest] : [v, ...rest])
        enu[val] = Symbol(String(val))

    // @ts-ignore
    return Object.freeze(enu)
}

/**
 * Mathy
 */

/**
 * Random - random integers between `min` and `max`-1.
 * @param {number} [min = 0]
 * @param {(number | boolean)} [max = 2]
 * @param {boolean} [float = false]
 * @returns {number}
 */

export const random = (min = 0, max = 2, float = false) => {
    // max can be omitted
    float = isBool(max) ? max : float
    ;[min, max] =
        isnt(max) || isBool(max) ?
            // with no parameters, defaults to 0 or 1
            isnt(min) ? [0, 2]
            :   [0, +min]
        :   [+min, +max]

    return float ?
            Math.random() * (max - min) + min
        :   Math.floor(Math.random() * (max - min)) + min
}

/**
 * RandomNormal - random number from reasonably approximated normal distribution.
 * @param {number} [mean = 0]
 * @param {number} [sigma = 1]
 * @returns {number}
 */

export const randomNormal = (mean = 0, sigma = 1) => {
    const SAMPLES = 6
    let sum = 0,
        i = 0

    for (i; i < SAMPLES; i++) sum += Math.random()

    return (sigma * 8.35 * (sum - SAMPLES / 2)) / SAMPLES + mean
    //              ^ hand made spread constant :-)
}

/**
 * Round - Returns `n` rounded to `precision` decimals.
 * @param {number} n
 * @param {number} [precision = 0]
 * @returns {number}
 */

export const round = (n, precision = 0) =>
    Math.round(n * 10 ** precision + Number.EPSILON) / 10 ** precision

/**
 * NthRoot - Returns nth root of positive number.
 * @param {number} x
 * @param {number} n
 * @returns {number}
 */

export const nthRoot = (x, n) => x ** (1 / Math.abs(n))

/**
 * Factorial
 * @param {number} n
 * @returns {number}
 */

export const factorial = n => (n <= 1 ? 1 : n * factorial(n - 1))

/**
 * nChooseK - Returns the number of ways to choose `k` elements from a set of `n` elements.
 * @param {number} n
 * @param {number} k
 * @returns {number}
 */

export const nChooseK = (n, k) => {
    if (k < 0 || k > n) return 0
    if (k == 0 || k == n) return 1
    if (k == 1 || k == n - 1) return n

    let res = n
    for (let i = 2; i <= k; i++) res *= (n - i + 1) / i

    return Math.round(res)
}

/**
 * Lerp - Interpolates linearly between `a` and `b`.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */

export const lerp = (a, b, t) => {
    t = clamp(t, 0, 1)
    return (1 - t) * a + t * b
}

/**
 * Smoothstep - Interpolates smoothly between `a` and `b`.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 * @see https://en.wikipedia.org/wiki/Smoothstep
 */

export const smoothstep = (a, b, t) => lerp(a, b, 3 * t ** 2 - 2 * t ** 3)

/**
 * EaseIn - Eases in from `a` to `b`.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */

export const easeIn = (a, b, t) => lerp(a, b, t ** 2)

/**
 * EaseOut - Eases out from `a` to `b`.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */

export const easeOut = (a, b, t) => lerp(a, b, t * (2 - t))

// https://lisyarus.github.io/blog/posts/exponential-smoothing.html
//export const spring = (a, b, t, speed = 5) =>
//    lerp(a, b, 1 - Math.exp(-speed * t))
// todo: test

/**
 * Clamp - Clamps `n` between `min` and `max`.
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

/**
 * Between - Checks if `n` is between `min` and `max`.
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */

export const between = (n, min, max) => n >= min && n < max

/**
 * Normalize - Normalises `n` to a value between 0 and 1, within range given by `min` and `max`.
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @param {boolean} [doClamp = true]
 * @returns {number}
 */

export const normalize = (n, min, max, doClamp = true) => {
    n = (n - min) / (max - min + Number.EPSILON) // Prevent / by 0
    return doClamp ? clamp(n, 0, 1) : n
}

// for the britons
export const normalise = normalize

/**
 * ToPolar - Converts cartesian coordinates to polar.
 * @param {number} x
 * @param {number} y
 * @returns {{r: number, theta: number }}
 */

export const toPolar = (x, y) => ({
    r: Math.hypot(x, y),
    theta: Math.atan2(y, x),
})

/**
 * ToCartesian - Converts polar coordinates to cartesian.
 * @param {number} r
 * @param {number} theta
 * @returns {{x: number, y: number }}
 */

export const toCartesian = (r, theta) => ({
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
})

// https://www.youtube.com/watch?v=sULa9Lc4pck&t=3s
// export const triangleOfPower = (base, exponent, power) => {
// 	if (base && exponent) return base ** exponent // pow
// 	if (exponent && power) return power ** (1 / Math.abs(exponent)) // root
// 	if (base && power) return Math.log(power) / Math.log(base) // log
// }

/**
 * String
 */

/**
 * PrettyNumber - Returns `n` rounded to `precision` decimals and formatted by `n.toLocaleString()`.
 * @param {number} n
 * @param {string} [locale = 'sv-SE']
 * @param {number} [precision = 2]
 * @returns {string}
 */

export const prettyNumber = (n, locale = 'sv-SE', precision = 2) => {
    // locale can be omitted
    ;[locale, precision] =
        isNum(locale) ? ['sv-SE', locale] : [locale, precision]

    n = round(n, precision)

    return (
        Number.isNaN(n) ? '-'
        : isInt(n) ? n.toLocaleString(locale)
        : n.toLocaleString(locale, {
                minimumFractionDigits: precision,
            })
    )
}

/**
 * WrapFirstWords - Returns `s` with first `numWords` words wrapped in `startWrap` and `endWrap`.
 * @param {string} s
 * @param {number} [numWords = 3]
 * @param {string} [startWrap]
 * @param {string} [endWrap]
 * @param {number} [startAtChar]
 * @returns {string}
 */

// \p{L} /u see https://eloquentjavascript.net/09_regexp.html#h-+y54//b0l+
export const wrapFirstWords = (
    s,
    numWords = 3,
    startWrap = '<span>',
    endWrap = '</span>',
    startAtChar = 0,
) =>
    s.slice(0, startAtChar) +
    s
        .slice(startAtChar)
        .replace(
            new RegExp(
                `([\\s]*[\\p{L}\\p{M}\\p{N}'’\"-&]+){${numWords}}\\S?`,
                'u',
            ),
            `${startWrap}$&${endWrap}`,
        )

/**
 * ToCamelCase - Returns regular sentence, kebab-case or snake_case string converted to camelCase.
 * @param {string} s
 * @returns {string}
 */

export const toCamelCase = s =>
    s.match(/^\-\-/) ?
        s // is css var, so leave it alone
    :   s.replace(/([-_\s])([a-zA-Z0-9])/g, (m, _, c, o) =>
            o ? c.toUpperCase() : c,
        )

/**
 * ToKebabCase - Returns regular sentence or camelCase string converted to kebab-case.
 * @param {string} s
 * @returns {string}
 */

// thx https://gist.github.com/nblackburn/875e6ff75bc8ce171c758bf75f304707
export const toKebabCase = s =>
    s.match(/^\-\-/) ?
        s // is css var, so leave it alone
    :   s
            .replace(/\s/g, '-')
            .replace(/([a-z0-9])([A-Z0-9])/g, '$1-$2')
            .toLowerCase()

/**
 * Capitalise
 * @param {string} s
 * @returns {string}
 */

export const capitalise = s => s[0].toUpperCase() + s.slice(1)

export const capitalize = capitalise

/**
 * RandomChars - Returns `numChars` random characters.
 * @param {number} [numChars = 10]
 * @returns {string}
 */

export const randomChars = (numChars = 10) =>
    (BigInt(Math.random() * 2 ** 512) * BigInt(Math.random() * 2 ** 512))
        .toString(36)
        .substring(0, numChars)

/**
 * StripTags - Strips HTML tags.
 * @param {string} s
 * @returns {string}
 */

export const stripTags = s => s.replace(/(<([^>]+)>)/gi, '')

/**
 * When - an inline if.
 * @param {boolean} bool
 * @param {*} v
 * @param {*} [f]
 * @returns {(* | string)}
 */

export const when = (bool, v, f = false) => (bool ? v : f || '')

/**
 * Colours
 */

export * from './colour/hsla.js'

/**
 * Async
 */

let timeout, rejectPrev

/**
 * Wait - Waits `t` milliseconds.
 * @param {number} [t]
 * @param {function} [f]
 * @param {boolean} [resetPrevCall = false]
 * @returns {Promise<void>}
 */

export const wait = async (t = 1, f, resetPrevCall = false) => {
    // callback is optional
    resetPrevCall = isBool(f) ? f : resetPrevCall

    if (resetPrevCall && rejectPrev) {
        clearTimeout(timeout)
        rejectPrev()
    }

    try {
        await new Promise((resolve, reject) => {
            timeout = setTimeout(resolve, t)
            rejectPrev = reject
        })

        if (isFunc(f)) return await f()
    } catch (e) {}
}

/**
 * NextFrame - Waits one frame.
 * @param {function} [f]
 * @returns {Promise<void>}
 */

export const nextFrame = async f => {
    return new Promise(resolve =>
        requestAnimationFrame(async () => {
            if (isFunc(f)) resolve(await f())
            else resolve()
        }),
    )
}

/**
 * WaitFrames - Waits `n` frames.
 * @param {number} [n]
 * @param {function} [f]
 * @param {boolean} [everyFrame]
 * @returns {Promise<void>}
 */

export const waitFrames = async (n = 1, f, everyFrame = false) => {
    while (n-- > 0) await nextFrame(everyFrame ? f : undefined)
    if (isFunc(f)) return await f()
}

/**
 * WaitFor - Waits for specified event.
 * @param {string} selector
 * @param {string} event
 * @param {function} [f]
 * @returns {Promise<void>}
 */

export const waitFor = async (selector, event, f) => {
    return new Promise(resolve => {
        document.querySelector(selector)?.addEventListener(
            event,
            async e => {
                if (isFunc(f)) resolve(await f(e))
                else resolve()
            },
            { once: true },
        )
    })
}

/**
 * Load - Loads (and parses) JSON. Optionally loads HTML.
 * @param {string} url
 * @param {boolean} [isJSON = true]
 * @param {(string | null)} [errorMessage]
 * @param {{}} [errorMessage]
 * @returns {Promise<{} | string>} JSON or text
 */

export const load = async (
    url,
    isJSON = true,
    errorMessage = null,
    settings = {},
) => {
    try {
        let response = await fetch(url, settings)
        return (await isJSON) ? response.json() : response.text()
    } catch (e) {
        error(e)
        return errorMessage ?? e
    }
}

/**
 * Basic type checking
 */

export const isBool = v => typeof v == 'boolean'

export const isNum = v => typeof v == 'number'

export const isInt = v => Number.isInteger(v)

export const isBigInt = v => typeof v == 'bigint'

export const isStr = v => typeof v == 'string'

export const isSym = v => typeof v == 'symbol'

export const isnt = v => typeof v == 'undefined'
export const isUndefined = isnt

export const is = v => !isnt(v)
export const isDefined = is

/**
 * @returns {v is null}
 */

export const isNull = v => v === null

export const isArr = v => Array.isArray(v)

/**
 * @returns {v is function}
 */

export const isFunc = v => v instanceof Function

export const isDate = v => v instanceof Date

export const isMap = v => v instanceof Map

export const isSet = v => v instanceof Set

export const isRegex = v => v instanceof RegExp

export const isObj = v =>
    typeof v == 'object' &&
    v !== null &&
    !isArr(v) &&
    !isDate(v) &&
    !isMap(v) &&
    !isSet(v) &&
    !isRegex(v)

export const isPlainObj = v =>
    isObj(v) && Reflect.getPrototypeOf(v) === Object.prototype

export const isNakedObj = v => isObj(v) && Reflect.getPrototypeOf(v) === null

/**
 * @param {*} v
 * @returns {v is Iterable}
 */

export const isIterable = v =>
    v !== null && v[Symbol.iterator] instanceof Function

/**
 * Type conversion
 */

/**
 * @param {Map} map
 * @returns {{}}
 */

export const mapToObj = map => Object.fromEntries(map.entries())

/**
 * @param {{}} obj
 * @returns {Map}
 */

export const objToMap = obj => new Map(Object.entries(obj))

/**
 * Throttle, debounce, onAnimationFrame
 */

/**
 * Throttle - Throttles execution of `f` to one call per `t` milliseconds.
 * @param {function} f
 * @param {number} [t]
 * @param {boolean} [debounce = false]
 * @param {boolean} [immediately = false]
 * @returns {(...args: any) => void}
 */

export const throttle = (f, t = 50, debounce = false, immediately = false) => {
    let timeout,
        lastRan,
        running = false

    return function () {
        let context = this,
            args = arguments

        if (!lastRan || (debounce && !running)) {
            // first run or debounce rerun
            if (!debounce || immediately) f.apply(context, args)
            lastRan = Date.now()
        } else {
            clearTimeout(timeout)
            timeout = setTimeout(
                () => {
                    if (Date.now() - lastRan >= t) {
                        f.apply(context, args)
                        lastRan = Date.now()
                        running = false
                    }
                },
                debounce ? t : t - (Date.now() - lastRan),
            )
        }
        running = true
    }
}

/**
 * Debounce - Debounces execution of `f` until no calls are made within `t` milliseconds.
 * @param {function} f
 * @param {number} [t]
 * @param {boolean} [immediately = false]
 * @returns {(...args: any) => void}
 */

export const debounce = (f, t = 50, immediately = false) =>
    throttle(f, t, true, immediately)

/**
 * OnAnimationFrame - Defers execution of `f` to next animation frame.
 * @param {function} f
 * @returns {(...args: any) => void}
 */

export const onAnimationFrame = f => {
    let timeout

    return function () {
        let context = this,
            args = arguments

        cancelAnimationFrame(timeout)
        timeout = requestAnimationFrame(() => f.apply(context, args))
    }
}

/**
 * Util & environment
 */

// export const q = document.querySelector.bind(document);
// export const qa = document.querySelectorAll.bind(document);

/**
 * GetLocal - Gets `item` from local storage, if any. Converts item to `Object` via `JSON.parse`.
 * @param {*} item
 * @returns {* | undefined}
 */

export const getLocal = item => {
    let i = localStorage.getItem(item)
    return i && JSON.parse(i)
}

/**
 * SetLocal - Sets `item` in local storage to `v`, and returns `v`.
 * @template {string} v
 * @param {v} item
 * @returns {v}
 */

export const setLocal = (item, v) => (
    localStorage.setItem(item, JSON.stringify(v)), v
)

/**
 * GetCss - Gets `prop` on selected element.
 * @param {string} prop
 * @param {string} [selector = ':root']
 * @returns {* | undefined}
 */

export const getCss = (prop, selector = ':root') =>
    // @ts-ignore
    document.querySelector(selector)?.style.getPropertyValue(prop)

/**
 * SetCss - Sets `prop` to `v`.
 * @param {string} prop
 * @param {string} v
 * @param {string} [selector = ':root']
 * @returns {string}
 */

export const setCss = (prop, v, selector = ':root') =>
    (
        // @ts-ignore
        document.querySelector(selector)?.style.setProperty(prop, v), v
    )

/**
 * Errors and logging
 */

// verbose errors
let isVerbose = true,
    isThrowing = false

/**
 * Verbose - Get/set `isVerbose`.
 * @param {boolean | undefined} verbose
 * @param {*} throwing
 * @returns {boolean}
 */

export const verbose = (verbose, throwing = false) =>
    isnt(verbose) ? isVerbose : (
        ((isThrowing = !!throwing), (isVerbose = !!verbose))
    )

/**
 * Error - Logs errors to console, optionally throws instead.
 * @param {*} e
 * @param  {...any} r
 * @returns {* | Array}
 */

export const error = (e, ...r) => {
    if (isVerbose) {
        if (isThrowing) throw new Error(e)
        console.error(message(e), ...r)
    }
    return r ? [e, ...r] : e
}

/**
 * Warn - Outputs arguments to console.
 * @param {*} msg
 * @param  {...any} r
 * @returns {* | Array}
 */

export const warn = (msg, ...r) => {
    if (isVerbose) console.warn(message(msg), ...r)
    return r ? [msg, ...r] : msg
}

/**
 * Log - Outputs arguments to console. Returns single argument, or multiple arguments as an array.
 * @param  {...any} msg
 * @returns {* | Array}
 */

export const log = (...msg) => {
    if (isVerbose) console.log(...msg)
    return msg.length == 1 ? msg[0] : msg
}

const defaultLabel = 'ö.time says'

/**
 * Time
 * @param  {(function | string)} f
 * @param  {string} [label]
 * @returns {* | undefined}
 */

export const time = (f, label = defaultLabel) => {
    if (!isFunc(f))
        return isVerbose ? console.time(isStr(f) ? f : label) : undefined

    if (isVerbose) console.time(label)
    let result = f()
    if (isVerbose) console.timeEnd(label)

    return result
}

/**
 * TimeEnd
 * @param  {string} [label]
 * @returns {undefined}
 */

export const timeEnd = (label = defaultLabel) => {
    if (isVerbose) console.timeEnd(label)
}

/**
 * Message
 * @param  {string} s
 * @returns {string}
 */

export const message = s => `ö says: ${s}\n`

// stuff
export const toString = () => `Hello ö!`

/**
 * @param  {string} s
 * @returns {string}
 */

export const rorövovarorsospoproråkoketot = s =>
    (s || '').replace(
        /[bcdfghjklmnpqrstvwxyz]/gi,
        m => `${m}o${m.toLowerCase()}`,
    )
