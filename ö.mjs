// @ts-check

/**
 * Generators
 */


/**
 * grid
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
 * range
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
 * times
 * @param {number} times
 * @param {timesCB} f
 * @param  {Array} rest
 * @returns {Array}
 */

export const times = (times, f = (i) => i, ...rest) =>
    Array(Math.abs(times))
        .fill(0)
        // @ts-ignore
        .map((_, i) => f(i, ...rest))

/**
 * Array/Iterable
 */

/**
 * rangeArray
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
 * map
 * @param {Iterable} iterable
 * @param {(string | mapCB)} f
 * @returns {Iterable}
 */

export const map = (iterable, f) => {
    const getMapper = (f) =>
        isFunc(f) ? f
        : isMap(iterable) ? (v) => [v[0], v[1]?.[f]]
        : (v) => v[f]

    const getMap = (iterable) => Array.from(iterable).map(getMapper(f))

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
 * unique
 * @param {Iterable} arr
 * @returns {Array}
 */

export const unique = (arr) => [...new Set(arr)]

/**
 * Shuffle
 * @param {Iterable} iterable
 * @returns {Array}
 * @see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 */

export const shuffle = (iterable) => {
    let a = Array.from(iterable)

    // classic loop for performance reasons
    for (let i = a.length - 1; i > 0; i--) {
        let j = random(i + 1)
        ;[a[i], a[j]] = [a[j], a[i]]
    }

    return a
}

/**
 * sample
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
 * sum
 * @param {Iterable<number>} iterable
 * @returns {number}
 */

//sum = arr => arr.reduce( (a, v) => a + Number(v) , 0); < 10xslower

export const sum = (iterable) => {
    let arr = Array.from(iterable)
    let a = 0

    for (let i = 0; i < arr.length; i++) a += Number(arr[i])

    return a
}

/**
 * mean
 * @param {Iterable<number>} iterable
 * @returns {number}
 */

export const mean = (iterable) => sum(iterable) / Array.from(iterable).length

/**
 * median
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
 * max
 * @param {Iterable<number>} arr
 * @returns {number}
 */

export const max = (arr) => Math.max(...arr)

/**
 * min
 * @param {Iterable<number>} arr
 * @returns {number}
 */

export const min = (arr) => Math.min(...arr)

/**
 * groupBy
 * @param {Iterable} arr
 * @param {(string | mapCB)} prop
 * @param {boolean} [asObject = false]
 * @returns {Map<*, Array> | Object.<string, Array>}
 */

export const groupBy = (arr, prop, asObject = false) =>
    // @ts-ignore
    globalThis[asObject ? 'Object' : 'Map'].groupBy(
        arr,
        isFunc(prop) ? prop : (v) => v[prop],
    )

/**
 * mapToTree
 * @param {Array<Object>} arr
 * @param {(string | mapCB)} idProp
 * @param {string} [parentProp]
 * @returns {Array}
 */

export const mapToTree = (arr, idProp, parentProp) => {
    let parents = new Map()

    for (let [i, v] of arr.entries()) {
        let [key, parentKey] =
            isFunc(idProp) ?
                idProp(v, i, arr) // Should return [ownKey, parentKey]
            :   [v[idProp], v?.[parentProp ?? ''] ?? null]

        parents.set(
            parentKey,
            parents.has(parentKey) ?
                [...parents.get(parentKey), { key, v }]
            :   [{ key, v }],
        )
    }

    const traverse = (parentIndex = null) =>
        parents.get(parentIndex)?.map((parent) => ({
            // did you see the guard clause? Pretty small eh?
            ...parent.v,
            children: traverse(parent.key),
        }))

    return traverse()
}

/**
 * Methods for arrays of nested objects
 */

/**
 * reduceDeep
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
 * mapDeep
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
 * filterDeep
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
 * findDeep
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
 * Intersect
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const intersect = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return [...A].filter((v) => B.has(v))
}

/**
 * Subtract
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const subtract = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return [...A].filter((v) => !B.has(v))
}

/**
 * Exclude
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const exclude = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return [
        ...[...A].filter((v) => !B.has(v)),
        ...[...B].filter((v) => !A.has(v)),
    ]
}

/**
 * Union
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const union = (a, b) => [...new Set([...a, ...b])]

/**
 * isSubset
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */

export const isSubset = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return A.size <= B.size && [...A].every((v) => B.has(v))
}

/**
 * isSuperset
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */

export const isSuperset = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return A.size >= B.size && [...B].every((v) => A.has(v))
}

/**
 * isDisjoint
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */

export const isDisjoint = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return [...A].every((v) => !B.has(v))
}

/**
 * DOM methods
 */

/**
 * createElement
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

export const parseDOMStringMap = (obj) => {
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
 * Data
 * @param {*} element
 * @param {(string | Object)} key
 * @param {*} value
 * @returns {Object.<string, *> | *}
 */

export const data = (element, key, value) => {
    let thisData =
        d.has(element) ? d.get(element) : parseDOMStringMap(element?.dataset)

    if (is(value) || isObj(key))
        d.set(
            element,
            Object.assign(thisData, isObj(key) ? key : { [key]: value }),
        )

    return isStr(key) ? thisData[key] : thisData
}

/**
 * Finds deepest element in element matching selector.
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
 * isEqual
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
    : Reflect.ownKeys(a).every((k) =>
            deep ? isEqual(a[k], b[k]) : a[k] === b[k],
        )

export const equals = isEqual

/**
 * clone
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
    const doClone = (v) =>
        deep ? clone(v, deep, immutable, preservePrototype) : v
    const doFreeze = (v) => (immutable ? Object.freeze(v) : v)

    // Return primitives and functions as is.
    // no cloning of functions, too gory. They are passed by reference instead
    if (typeof v != 'object' || isNull(v)) return v

    // catch arraylike
    if ('map' in v && isFunc(v.map)) return doFreeze(v.map((i) => doClone(i)))

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
 * immutable
 * @param {*} v
 * @param {boolean} deep
 * @returns {*}
 */

export const immutable = (v, deep = true) => clone(v, deep, true)

/**
 * pipe
 * @param {*} v
 * @param  {...function} funcs
 * @returns {*}
 */

export const pipe = (v, ...funcs) => funcs.reduce((x, f) => f(x), v)

/**
 * toPiped
 * @param  {...function} funcs
 * @returns {(v: any) => any}
 */

export const toPiped =
    (...funcs) =>
    (v) =>
        pipe(v, ...funcs)

/**
 * pipeAsync
 * @param {*} v
 * @param  {...function} funcs
 * @returns {Promise}
 */

export const pipeAsync = async (v, ...funcs) =>
    await funcs.reduce(async (x, f) => f(await x), v)

/**
 * toPipedAsync
 * @param  {...function} funcs
 * @returns {(v: *) => Promise}
 */

export const toPipedAsync =
    (...funcs) =>
    (v) =>
        pipeAsync(v, ...funcs)

/**
 * curry
 * @param {function} f
 * @returns {(...args: *) => (function | *)}
 */

export const curry =
    (f) =>
    (...args) =>
        f.length > args.length ?
            (...newArgs) => curry(f)(...args, ...newArgs)
        :   f(...args)

/**
 *
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
 * createEnum
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
 * random
 * @param {number} [min = 0]
 * @param {(number | boolean)} [max = 1]
 * @param {boolean} [float = false]
 * @returns {number}
 */

export const random = (min = 0, max = 1, float = false) => {
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
 * randomNormal
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
 * round
 * @param {number} n
 * @param {number} [precision = 0]
 * @returns {number}
 */

export const round = (n, precision = 0) =>
    Math.round(n * 10 ** precision + Number.EPSILON) / 10 ** precision

/**
 * nthRoot
 * @param {number} x
 * @param {number} n
 * @returns {number}
 */

export const nthRoot = (x, n) => x ** (1 / Math.abs(n))

/**
 * factorial
 * @param {number} n
 * @returns {number}
 */

export const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1))

/**
 * nChooseK
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
 * lerp
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
 * smoothstep
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 * @see https://en.wikipedia.org/wiki/Smoothstep
 */

export const smoothstep = (a, b, t) => lerp(a, b, 3 * t ** 2 - 2 * t ** 3)

/**
 * easeIn
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */

export const easeIn = (a, b, t) => lerp(a, b, t ** 2)

/**
 * easeOut
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
 * clamp
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

/**
 * between
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */

export const between = (n, min, max) => n >= min && n < max

/**
 * normalize
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
 * toPolar
 * @param {number} x
 * @param {number} y
 * @returns {{r: number, theta: number }}
 */

export const toPolar = (x, y) => ({
    r: Math.hypot(x, y),
    theta: Math.atan2(y, x),
})

/**
 * toCartesian
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
 * prettyNumber
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
 * wrapFirstWords
 * @param {string} s
 * @param {number} [numWords = 3]
 * @param {string} [startWrap]
 * @param {string} [endWrap]
 * @param {number} [startAtChar]
 * @returns {string}
 */

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
            new RegExp(`([\\s]*[\\w\\dåäöÅÄÖøØ'’\"-]+){${numWords}}\\S?`),
            `${startWrap}$&${endWrap}`,
        )

/**
 * toCamelCase
 * @param {string} s
 * @returns {string}
 */

export const toCamelCase = (s) =>
    s.match(/^\-\-/) ?
        s // is css var, so leave it alone
    :   s.replace(/([-_\s])([a-zA-Z0-9])/g, (m, _, c, o) =>
            o ? c.toUpperCase() : c,
        )

/**
 * toKebabCase
 * @param {string} s
 * @returns {string}
 */

// thx https://gist.github.com/nblackburn/875e6ff75bc8ce171c758bf75f304707
export const toKebabCase = (s) =>
    s.match(/^\-\-/) ?
        s // is css var, so leave it alone
    :   s
            .replace(/\s/g, '-')
            .replace(/([a-z0-9])([A-Z0-9])/g, '$1-$2')
            .toLowerCase()

/**
 * capitalise
 * @param {string} s
 * @returns {string}
 */

export const capitalise = (s) => s[0].toUpperCase() + s.slice(1)

export const capitalize = capitalise

/**
 * randomChars
 * @param {number} [numChars = 10]
 * @returns {string}
 */

export const randomChars = (numChars = 10) =>
    (BigInt(Math.random() * 2 ** 512) * BigInt(Math.random() * 2 ** 512))
        .toString(36)
        .substring(0, numChars)

/**
 * stripTags
 * @param {string} s
 * @returns {string}
 */

export const stripTags = (s) => s.replace(/(<([^>]+)>)/gi, '')

/**
 * when
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
 * wait
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
 * nextFrame
 * @param {function} [f]
 * @returns {Promise<void>}
 */

export const nextFrame = async (f) => {
    return new Promise((resolve) =>
        requestAnimationFrame(async () => {
            if (isFunc(f)) resolve(await f())
            else resolve()
        }),
    )
}

/**
 * waitFrames
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
 * waitFor
 * @param {string} selector
 * @param {string} event
 * @param {function} [f]
 * @returns {Promise<void>}
 */

export const waitFor = async (selector, event, f) => {
    return new Promise((resolve) => {
        document.querySelector(selector)?.addEventListener(
            event,
            async (e) => {
                if (isFunc(f)) resolve(await f(e))
                else resolve()
            },
            { once: true },
        )
    })
}

/**
 * load
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

export const isBool = (v) => typeof v == 'boolean'

export const isNum = (v) => typeof v == 'number'

export const isInt = (v) => Number.isInteger(v)

export const isBigInt = (v) => typeof v == 'bigint'

export const isStr = (v) => typeof v == 'string'

export const isSym = (v) => typeof v == 'symbol'

export const isnt = (v) => typeof v == 'undefined'
export const isUndefined = isnt

export const is = (v) => !isnt(v)
export const isDefined = is

/**
 * @param {*} v
 * @returns {v is null}
 */

export const isNull = (v) => v === null

export const isArr = (v) => Array.isArray(v)

/**
 * @param {*} v
 * @returns {v is function}
 */

export const isFunc = (v) => v instanceof Function

export const isDate = (v) => v instanceof Date

export const isMap = (v) => v instanceof Map

export const isSet = (v) => v instanceof Set

export const isRegex = (v) => v instanceof RegExp

export const isObj = (v) =>
    typeof v == 'object' &&
    v !== null &&
    !isArr(v) &&
    !isDate(v) &&
    !isMap(v) &&
    !isSet(v) &&
    !isRegex(v)

export const isPlainObj = (v) =>
    isObj(v) && Reflect.getPrototypeOf(v) === Object.prototype

export const isNakedObj = (v) => isObj(v) && Reflect.getPrototypeOf(v) === null

/**
 * @param {*} v
 * @returns {v is Iterable}
 */

export const isIterable = (v) =>
    v != null && typeof v[Symbol.iterator] == 'function'

/**
 * Type conversion
 */

/**
 * @param {Map} map
 * @returns {{}}
 */

export const mapToObj = (map) => Object.fromEntries(map.entries())

/**
 * @param {{}} obj
 * @returns {Map}
 */

export const objToMap = (obj) => new Map(Object.entries(obj))

/**
 * Throttle, debounce, onAnimationFrame
 */

/**
 * throttle
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
 * debounce
 * @param {function} f
 * @param {number} [t]
 * @param {boolean} [immediately = false]
 * @returns {(...args: any) => void}
 */

export const debounce = (f, t = 50, immediately = false) =>
    throttle(f, t, true, immediately)

/**
 * onAnimationFrame
 * @param {function} f
 * @returns {(...args: any) => void}
 */

export const onAnimationFrame = (f) => {
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
 * getLocal
 * @param {*} item
 * @returns {* | undefined}
 */

export const getLocal = (item) => {
    let i = localStorage.getItem(item)
    return i && JSON.parse(i)
}

/**
 * setLocal
 * @template {string} v
 * @param {v} item
 * @returns {v}
 */

export const setLocal = (item, v) => (
    localStorage.setItem(item, JSON.stringify(v)), v
)

/**
 * getCss
 * @param {string} prop
 * @param {string} [selector = ':root']
 * @returns {* | undefined}
 */

export const getCss = (prop, selector = ':root') =>
    // @ts-ignore
    document.querySelector(selector)?.style.getPropertyValue(prop)

/**
 * setCss
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
 * verbose
 * @param {boolean | undefined} verbose
 * @param {*} throwing
 * @returns {boolean}
 */

export const verbose = (verbose, throwing = false) =>
    isnt(verbose) ? isVerbose : (
        ((isThrowing = !!throwing), (isVerbose = !!verbose))
    )

/**
 * error
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
 * warn
 * @param {*} msg
 * @param  {...any} r
 * @returns {* | Array}
 */

export const warn = (msg, ...r) => {
    if (isVerbose) console.warn(message(msg), ...r)
    return r ? [msg, ...r] : msg
}

/**
 * log
 * @param  {...any} msg
 * @returns {* | Array}
 */

export const log = (...msg) => {
    if (isVerbose) console.log(...msg)
    return msg.length == 1 ? msg[0] : msg
}

const defaultLabel = 'ö.time says'

/**
 * time
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
 * timeEnd
 * @param  {string} [label]
 * @returns {undefined}
 */

export const timeEnd = (label = defaultLabel) => {
    if (isVerbose) console.timeEnd(label)
}

/**
 * message
 * @param  {string} s
 * @returns {string}
 */

export const message = (s) => `ö says: ${s}\n`

// stuff
export const toString = () => `Hello ö!`

/**
 * @param  {string} s
 * @returns {string}
 */

export const rorövovarorsospoproråkoketot = (s) =>
    (s || '').replace(
        /[bcdfghjklmnpqrstvwxyz]/gi,
        (m) => `${m}o${m.toLowerCase()}`,
    )
