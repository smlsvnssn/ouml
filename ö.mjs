// generators
export const grid = function* (width, height) {
    height ??= width
    let x = 0
    do {
        yield { x: x % width, y: Math.floor(x / width) }
    } while (++x < width * height)
}

export const range = function* (start, end, step = 1) {
    ;[start, end, step] = isnt(end) ? [0, +start, +step] : [+start, +end, +step]
    const count =
        start < end ? () => (start += step) < end : () => (start -= step) > end
    do {
        yield start
    } while (count() !== false)
}

// iterators
export const times = (times, f = (i) => i, ...rest) =>
    [...range(Math.abs(times))].map((i) => f(i, ...rest))

// arr
export const rangeArray = (start, end, step) => [...range(start, end, step)]

export const map = (iterable, f) => {
    const getter = (f) =>
        isFunc(f) ? f
        : ö.isMap(iterable) ? (v) => [v[0], v[1]?.[f]]
        : (v) => v[f]

    const getMap = (iterable) => Array.from(iterable).map(getter(f))

    if (ö.isIterable(iterable)) {
        if (ö.isStr(iterable)) return getMap(iterable).join('')
        if (ö.isMap(iterable)) return new Map(getMap(iterable))
        if (ö.isSet(iterable)) return new Set(getMap(iterable))
        if ('map' in iterable && isFunc(iterable.map))
            return iterable.map(getter(f))
        // Base case: Just convert to array
        return getMap(iterable)
    }
    return ö.error('Argument "iterable" must be an iterable.')
}

export const unique = (arr) => [...new Set(arr)]

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
export const shuffle = (arr) => {
    arr = Array.from(arr)

    // classic loop for performance reasons
    for (let i = a.length - 1; i > 0; i--) {
        let j = random(i + 1)
        ;[a[i], a[j]] = [a[j], a[i]]
    }

    return a
}

export const sample = (arr, samples = 1) =>
    // since shuffle is fast, shuffle whole array before sampling, ez!
    samples === 1 ? arr[random(arr.length)] : shuffle(arr).slice(0, samples)

//sum = arr => arr.reduce( (a, v) => a + Number(v) , 0); < 10xslower
export const sum = (arr) => {
    arr = Array.from(arr)

    let a = 0
    for (let i = 0; i < arr.length; i++) a += Number(arr[i])

    return a
}

export const mean = (arr) => sum(arr) / arr.length

export const median = (arr) => {
    // no mutation
    let a = Array.from(arr).sort((a, b) => Number(a) - Number(b)),
        m = Math.floor(arr.length / 2)

    return m % 2 ? (Number(a[m - 1]) + Number(a[m])) / 2 : Number(a[m])
}

export const max = (arr) => Math.max(...arr)

export const min = (arr) => Math.min(...arr)

export const groupBy = (arr, prop, asObject = false) =>
    globalThis[asObject ? 'Object' : 'Map'].groupBy(
        arr,
        isFunc(prop) ? prop : (v) => v[prop],
    )

/* 
// Old version from before native .groupBy
{
    const acc = new Map()
    for (const [i, v] of arr.entries()) {
        if (isFunc(prop)) {
            const p = prop(v, i, arr)
            acc.set(p, [...(acc.get(p) || []), v])
        } else acc.set(v[prop], [...(acc.get(v[prop]) || []), v])
    }
    return acc
}
*/

export const mapToTree = (arr, idProp, parentProp) => {
    let parents = new Map()

    for (let [i, v] of arr.entries()) {
        let [key, parentKey] =
            isFunc(idProp) ?
                idProp(v, i, arr) // Should return [ownKey, parentKey]
            :   [v[idProp], v?.[parentProp] ?? null]

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

// methods for arrays of nested objects
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

// SET OPS
export const intersect = (a, b) => {
    ;[a, b] = [new Set(a), new Set(b)]
    return [...a].filter((v) => b.has(v))
}

export const subtract = (a, b) => {
    ;[a, b] = [new Set(a), new Set(b)]
    return [...a].filter((v) => !b.has(v))
}

export const exclude = (a, b) => {
    ;[a, b] = [new Set(a), new Set(b)]
    return [
        ...[...a].filter((v) => !b.has(v)),
        ...[...b].filter((v) => !a.has(v)),
    ]
}

export const union = (a, b) => [...new Set([...a, ...b])]

export const isSubset = (a, b) => {
    ;[a, b] = [new Set(a), new Set(b)]
    return a.size <= b.size && [...a].every((v) => b.has(v))
}

export const isSuperset = (a, b) => {
    ;[a, b] = [new Set(a), new Set(b)]
    return a.size >= b.size && [...b].every((v) => a.has(v))
}

export const isDisjoint = (a, b) => {
    ;[a, b] = [new Set(a), new Set(b)]
    return [...a].every((v) => !b.has(v))
}

// DOM
export const createElement = (html, isSvg = false) => {
    let template = document.createElement('template')

    if (isSvg) {
        template.innerHTML = `<svg>${html.trim()}</svg>`
        return template.content.firstChild.firstChild
    }

    template.innerHTML = html.trim()
    return template.content.firstChild
}

export const parseDOMStringMap = (obj) => {
    // convert from DOMStringMap to object
    let o = { ...obj }

    // parse what's parseable
    for (let key in o)
        try {
            o[key] = JSON.parse(o[key])
        } catch (e) {}

    return o
}

// global data storage
const d = new WeakMap()

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

// Finds deepestElement in element matching selector. Potential performance hog for deep DOM structures.
export const deepest = (element, selector = '*') => {
    let deepestEl = { depth: 0, deepestElement: element }

    for (let el of element.querySelectorAll(selector)) {
        let depth = 0
        for (e = el; e !== element; depth++) e = e.parentNode // from bottom up
        deepestEl =
            depth > deepestEl.depth ?
                { depth: depth, deepestElement: el }
            :   deepestEl
    }

    return deepestEl.deepestElement
}

// logical

// Based on https://www.30secondsofcode.org/js/s/equals
// Checks own enumerable properties only.
// Does not work for ArrayBuffers because Symbols. Solvable with Object.getOwnPropertySymbols(obj)? Good enough?
export const isEqual = (a, b, deep = true) =>
    a === b ? true
        // are same date?
    : a instanceof Date && b instanceof Date ? a.getTime() === b.getTime()
        // are lexically same functions? (Closures not compared)
    : a instanceof Function && b instanceof Function ? '' + a === '' + b
        // are nullish?
    : !a || !b || (typeof a !== 'object' && typeof b !== 'object') ? a === b
        // have same prototype?
    : Object.getPrototypeOf(a) !== Object.getPrototypeOf(b) ? false
        // have same length ? (Iterables)
    : Object.keys(a).length !== Object.keys(b).length ? false
        // have same properties and values? (Recursively if deep)
    : Object.keys(a).every((k) => (deep ? isEqual(a[k], b[k]) : a[k] === b[k]))

export const equals = isEqual

// clone
export const clone = (
    v,
    deep = true,
    immutable = false,
    preservePrototype = true,
) => {
    const doClone = (v) =>
        deep ? clone(v, deep, immutable, preservePrototype) : v
    const doFreeze = (v) => (immutable ? Object.freeze(v) : v)

    // no cloning of functions, too gory. They are passed by reference instead
    if (typeof v !== 'object' || isNull(v)) return v
    // catch arraylike
    if ('map' in v && isFunc(v.map)) return doFreeze(v.map((i) => doClone(i)))
    if (isMap(v)) return doFreeze(new Map(doClone(Array.from(v))))
    if (isSet(v)) return doFreeze(new Set(doClone(Array.from(v))))
    if (isDate(v)) return doFreeze(new Date().setTime(v.getTime()))

    let o = {}
    for (let key of Object.keys(v)) o[key] = doClone(v[key])

    return doFreeze(
        preservePrototype ?
            Object.assign(Object.create(Object.getPrototypeOf(v) ?? {}), o)
        :   o,
    )
}

export const immutable = (v, deep = true) => clone(v, deep, true)

export const pipe = (v, ...funcs) => funcs.reduce((x, f) => f(x), v)

export const toPiped =
    (...funcs) =>
    (v) =>
        pipe(v, ...funcs)

export const pipeAsync = async (v, ...funcs) =>
    await funcs.reduce(async (x, f) => f(await x), v)

export const toPipedAsync =
    (...funcs) =>
    (v) =>
        pipeAsync(v, ...funcs)

export const curry =
    (f) =>
    (...args) =>
        f.length > args.length ?
            (...newArgs) => curry(f)(...args, ...newArgs)
        :   f(...args)

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

// thx https://masteringjs.io/tutorials/fundamentals/enum
// TODO: Fix generic type for codehinting purposes
export const createEnum = (...v) => {
    if (v.length === 1 && isObj(v[0])) return Object.freeze(v[0])

    if (v.length === 1 && isArr(v[0])) v = v[0] //if only one argument, use as array
    let enu = {}
    for (let val of v) enu[val] = val

    return Object.freeze(enu)
}

// mathy
export const random = (min, max, float = false) => {
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

export const randomNormal = (mean = 0, sigma = 1) => {
    const SAMPLES = 6
    let sum = 0,
        i = 0

    for (i; i < SAMPLES; i++) sum += Math.random()

    return (sigma * 8.35 * (sum - SAMPLES / 2)) / SAMPLES + mean
    //              ^ hand made spread constant :-)
}

export const round = (n, precision = 0) =>
    Math.round(n * 10 ** precision + Number.EPSILON) / 10 ** precision

export const nthRoot = (x, n) => x ** (1 / Math.abs(n))

export const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1))

export const nChooseK = (n, k) => {
    if (k < 0 || k > n) return 0
    if (k === 0 || k === n) return 1
    if (k === 1 || k === n - 1) return n

    let res = n
    for (let i = 2; i <= k; i++) res *= (n - i + 1) / i

    return Math.round(res)
}

export const lerp = (a, b, t) => {
    t = clamp(t, 0, 1)
    return (1 - t) * a + t * b
}

// https://en.wikipedia.org/wiki/Smoothstep
export const smoothstep = (a, b, t) => lerp(a, b, 3 * t ** 2 - 2 * t ** 3)

export const easeIn = (a, b, t) => lerp(a, b, t ** 2)

export const easeOut = (a, b, t) => lerp(a, b, t * (2 - t))

// https://lisyarus.github.io/blog/posts/exponential-smoothing.html
//export const spring = (a, b, t, speed = 5) =>
//    lerp(a, b, 1 - Math.exp(-speed * t))
// todo: test

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

export const between = (n, min, max) => n >= min && n < max

export const normalize = (n, min, max, doClamp = true) => {
    n = (n - min) / (max - min + Number.EPSILON) // Prevent / by 0
    return doClamp ? clamp(n, 0, 1) : n
}

// for the britons
export const normalise = normalize

export const toPolar = (x, y) => ({
    r: Math.hypot(x, y),
    theta: Math.atan2(y, x),
})

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

// string
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

export const toCamelCase = (s) =>
    s.match(/^\-\-/) ?
        s // is css var, so leave it alone
    :   s.replace(/([-_\s])([a-zA-Z0-9])/g, (m, _, c, o) =>
            o ? c.toUpperCase() : c,
        )

// thx https://gist.github.com/nblackburn/875e6ff75bc8ce171c758bf75f304707
export const toKebabCase = (s) =>
    s.match(/^\-\-/) ?
        s // is css var, so leave it alone
    :   s
            .replace(/\s/g, '-')
            .replace(/([a-z0-9])([A-Z0-9])/g, '$1-$2')
            .toLowerCase()

export const capitalise = (s) => s[0].toUpperCase() + s.slice(1)

export const capitalize = capitalise

export const randomChars = (numChars = 10) =>
    (BigInt(Math.random() * 2 ** 512) * BigInt(Math.random() * 2 ** 512))
        .toString(36)
        .substring(0, numChars)

export const stripTags = (s) => s.replace(/(<([^>]+)>)/gi, '')

export const when = (bool, v, f = false) => (bool ? v : f || '')

// Colours
export const toHsla = (c, asString = false) => {
    let rgba, h, s, l, r, g, b, a

    c = c.trim()

    // Parse
    if (/^#/.test(c)) {
        // is hex
        rgba = Array.from(c)
            .slice(1) // remove #
            .flatMap(
                (v, i, a) =>
                    a.length <= 4 ? [Number('0x' + v + v)]
                    : i % 2 ?
                        [] // omitted by flatmap
                    :   [Number('0x' + v + a[i + 1])], // current + next
            )
        // fix alpha
        if (rgba.length === 4) rgba[3] / 255
    } else if (/^rgb\(|^rgba\(/.test(c)) {
        // is rgb/rgba
        rgba = c.match(/([0-9\.])+/g).map((v) => Number(v)) // Pluck the numbers
        if (/%/.test(c))
            // fix percent
            rgba = rgba.map((v, i) => (i < 3 ? Math.round((v / 100) * 255) : v))
    } else if (/^hsl\(|^hsla\(/.test(c)) {
        // is hsl/hsla
        ;[h, s, l, a] = c.match(/([0-9\.])+/g).map((v) => Number(v)) // Pluck the numbers
        a ??= 1
    } else {
        return warn("Sorry, can't parse " + c), null
    }

    if (rgba) {
        // convert

        // add default alpha if needed
        if (rgba.length === 3)
            rgba.push(1)

            // Adapted from https://css-tricks.com/converting-color-spaces-in-javascript/
        ;[r, g, b, a] = rgba.map((v, i) => (i < 3 ? v / 255 : v))
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin

        h =
            (round(
                (delta === 0 ? 0
                : cmax === r ? ((g - b) / delta) % 6
                : cmax === g ? (b - r) / delta + 2
                : /*cmax  === b*/ (r - g) / delta + 4) * 60,
            ) +
                360) %
            360 // prevent negatives
        l = (cmax + cmin) / 2
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

        // sanitize
        s = round(s * 100, 2)
        l = round(l * 100, 2)
        a = round(a, 2)
    }

    return asString ? hsla(h, s, l, a) : { h, s, l, a }
}

/*

toOklch = s' gonna be a monster

hex/rgba > lrgb/a (linear rgb, gamma correction removed) > oklab (cartesian) > oklch (polar)

https://github.com/Evercoder/culori/blob/main/src/lrgb/convertRgbToLrgb.js
https://github.com/Evercoder/culori/blob/main/src/oklab/convertLrgbToOklab.js
https://github.com/Evercoder/culori/blob/main/src/lch/convertLabToLch.js
https://bottosson.github.io/posts/oklab/


Optionally: use css's color-mix with shadow element. Potentially slow, browser only?
*/

export const hsla = (h, s = 70, l = 50, a = 1) => {
    if (isObj(h)) ({ h, s, l, a } = h)
    return `hsla(${h % 360}, ${s}%, ${l}%, ${a})`
}

// async
let timeout, rejectPrev

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

export const nextFrame = async (f) => {
    return new Promise((resolve) =>
        requestAnimationFrame(async () => {
            if (isFunc(f)) resolve(await f())
            else resolve()
        }),
    )
}

export const waitFrames = async (n = 1, f, everyFrame = false) => {
    while (n-- > 0) await nextFrame(everyFrame ? f : null)
    if (isFunc(f)) return await f()
}

export const waitFor = async (selector, event, f) => {
    return new Promise((resolve) => {
        document.querySelector(selector).addEventListener(
            event,
            async (e) => {
                if (isFunc(f)) resolve(await f(e))
                else resolve()
            },
            { once: true },
        )
    })
}

// JSON or text
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

// basic type checking
const istype = (t) => (v) => typeof v === t
const isof = (t) => (v) => v instanceof t

export const isBool = istype('boolean')
export const isNum = istype('number')
export const isInt = (v) => Number.isInteger(v)
export const isBigInt = istype('bigint')
export const isStr = istype('string')
export const isSym = istype('symbol')
export const isFunc = istype('function')
export const isnt = (v) => v === undefined
export const isUndefined = isnt
export const is = (v) => v !== undefined
export const isDefined = is
export const isNull = (v) => v === null
export const isArr = (v) => Array.isArray(v)
export const isDate = isof(Date)
export const isMap = isof(Map)
export const isSet = isof(Set)
export const isRegex = isof(RegExp)

export const isObj = (v) =>
    typeof v === 'object' &&
    v !== null &&
    !isArr(v) &&
    !isDate(v) &&
    !isMap(v) &&
    !isSet(v) &&
    !isRegex(v)

export const isPlainObj = (v) =>
    isObj(v) && Object.getPrototypeOf(v) === Object.prototype

export const isNakedObj = (v) => isObj(v) && Object.getPrototypeOf(v) === null

export const isIterable = (v) =>
    v != null && typeof v[Symbol.iterator] === 'function'

// conversion
export const mapToObj = (map) => Object.fromEntries(map.entries())

export const objToMap = (obj) => new Map(Object.entries(obj))

// throttle, debounce, onAnimationFrame
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

export const debounce = (f, t = 50, immediately = false) =>
    throttle(f, t, true, immediately)

export const onAnimationFrame = (f) => {
    let timeout

    return function () {
        let context = this,
            args = arguments

        cancelAnimationFrame(timeout)
        timeout = requestAnimationFrame(() => f.apply(context, args))
    }
}

// util & environment

// export const q = document.querySelector.bind(document);
// export const qa = document.querySelectorAll.bind(document);

export const getLocal = (item) => {
    let i = localStorage.getItem(item)
    return i && JSON.parse(i)
}

export const setLocal = (item, v) => (
    localStorage.setItem(item, JSON.stringify(v)), v
)

export const getCss = (prop, selector = ':root') =>
    document.querySelector(selector).style.getPropertyValue(prop)

export const setCss = (prop, v, selector = ':root') => (
    document.querySelector(selector).style.setProperty(prop, v), v
)

// verbose errors
let isVerbose = true,
    isThrowing = false

export const verbose = (v, t = false) =>
    isnt(v) ? isVerbose : ((isThrowing = !!t), (isVerbose = !!v))

export const error = (e, ...r) => {
    if (isVerbose) {
        if (isThrowing) throw new Error(e)
        console.error(message(e), ...r)
    }
    return r ? [e, ...r] : e
}

export const warn = (msg, ...r) => {
    if (isVerbose) console.warn(message(msg), ...r)
    return r ? [msg, ...r] : msg
}

export const log = (...msg) => {
    if (isVerbose) console.log(...msg)
    return msg.length === 1 ? msg[0] : msg
}

const defaultLabel = 'ö.time says'

export const time = (f, label = defaultLabel) => {
    if (!isFunc(f))
        return isVerbose ? console.time(isStr(f) ? f : label) : undefined

    if (isVerbose) console.time(label)
    let result = f()
    if (isVerbose) console.timeEnd(label)

    return result
}
export const timeEnd = (label = defaultLabel) => {
    if (isVerbose) console.timeEnd(label)
}

export const message = (s) => `ö says: ${s}\n`

// stuff
export const toString = () => `Hello ö🍳uery!`

export const rorövovarorsospoproråkoketot = (s) =>
    (s || '').replace(
        /[bcdfghjklmnpqrstvwxyz]/gi,
        (m) => `${m}o${m.toLowerCase()}`,
    )
