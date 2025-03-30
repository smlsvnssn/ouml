import { it } from 'node:test'
import * as ö from 'ouml'
import {
    isFunc,
    isStr,
    is,
    mapToTree,
    range,
    clone,
    times,
    max,
    sum,
    mean,
} from 'ouml'
/* 
TODO:

Array:
√ zip/unzip?

√ partition

√ charRange

√ take
√ takeWhile
√ drop
√ dropWhile
√ split
√ splitWhile

√ correlation coefficient?
https://en.wikipedia.org/wiki/Pearson_correlation_coefficient
√ covariance
√ standard deviation

Math
  factorization?

maybe:
combinations
permutations
multiply and convolve for arrays


Environment methods, ie isMobile, isTouchscreen, isHiResScreen, isDesktop, isServer etc
let mql = window.matchMedia("(max-width: 600px)");
https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia


Extend lerp to accept any-dimensional numbers, and optional easing functions (https://github.com/AndrewRayCode/easing-utils)
db? Server part for secrets and relay?


Beziers?
Cubic, Quadratic

√ include .observable in ö?
√ rewrite övents as svelte actions?
(√ kinda) partition as separate modules?
√ Rework colour functions to include oklch and new css features (browser only? Use create element hacks
*/

const zigzag = (x, n, xn = Math.floor(x / n), p = Math.pow(-1, xn)) =>
    Math.round(n * (-(p / 2) + p * (x / n - xn) + 0.5))

const attempt = (f, handle, ...args) => {
    try {
        return f(...args)
    } catch (e) {
        return ö.isFunc(handle) ? handle(e) : handle
    }
}

const tryCatch = tryer => {
    try {
        const result = tryer()
        return [result, null]
    } catch (error) {
        return [null, error]
    }
}

// diagonal grid

const diagonalGrid = (n, w = 10, h = w) => {
    const min = Math.min(w, h)
    const max = Math.max(w, h)
    const row = n => Math.floor(n / w) + 1
    const col = n => Math.ceil((n + 0.999) % w)
    const diagonal = n => row(n) + col(n) - 1
    const t = n => (n * (n + 1)) / 2
    const sumPrevDiagonals = n => {
        const d = diagonal(n)
        return (
            d < min ? t(d - 1)
            : d <= max ? t(min) + min * (d - 1 - min)
            : t(min) + min * (d - 1 - min) - t(d - 1 - max)
        )
    }

    return diagonal(n) <= h ?
            sumPrevDiagonals(n) + col(n)
        :   sumPrevDiagonals(n) + col(n) - (diagonal(n) - h)
}

// Lens - pure setter for deep objects. Useful? Maybe when records/tuples are a thing?

const lens = (...path) => {
    const getDeep = (o, path) => path.reduce((acc, prop) => acc[prop], o)

    const setDeep = (o, v, path) => {
        let newO = clone(o)

        path.reduce(
            (acc, prop, i) => {
                acc.new[prop] = i == path.length - 1 ? v : clone(acc.old[prop])
                return { new: acc.new[prop], old: acc.old[prop] }
            },
            { new: newO, old: o },
        )

        return newO
    }

    return {
        get: o => getDeep(o, path),
        set: (o, v) => setDeep(o, v, path),
    }
}

const obj = { level1: { level2: 'value' } }
const level2lens = lens('level1', 'level2')
const newObj = level2lens.get(obj)

// based on https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
const hash = (str, seed = 0) => {
    const shift = (a, b) =>
        (Math.imul(a ^ (a >>> 16), 2246822507) ^
            Math.imul(b ^ (b >>> 13), 3266489909)) >>>
        0

    const format = n => n.toString(36).padStart(7, '0')

    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed

    for (let ch of str) {
        ch = ch.charCodeAt(0)
        h1 = Math.imul(h1 ^ ch, 2654435761)
        h2 = Math.imul(h2 ^ ch, 1597334677)
    }

    h1 = shift(h1, h2)
    h2 = shift(h2, h1)

    return format(h2) + format(h1)
}

const bubblePipe = val =>
    function next(f) {
        if (f === undefined) return val
        val = typeof f === 'function' ? f(val) : val
        return next
    }

//bubblePipe(1)(Math.cos)(Math.sin)(ö.log)()

//ö.log(bubblePipe(1)())

/* ö.time(() => {
    let s =
        "jkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb"
    ö.times(100, () => {
        ö.log(hash(s))
        s = s.slice(1)
    })
}) */

const loop = (f, until, i = 0, increment = i => i + 1) =>
    !until(i) ? null : (f(i), loop(f, until, increment(i)))

let t = new Map([
    [1, 'a'],
    [4, 'b'],
    [5, 'c'],
])
ö.log(ö.map(t, (v, i) => [v, i]))

// slow
const map3 = (a, f, acc = [], i = 0) =>
    i >= a.length ? acc : map3(a, f, [...acc, f(a[i], i, a)], ++i)

// fast
const map2 = (a, f, acc = [], i = 0) =>
    i >= a.length ? acc : map2(a, f, (acc.push(f(a[i], i, a)), acc), ++i)

ö.time(() => map3(ö.times(3000), v => v * 2), 1)
ö.time(() => map2(ö.times(3000), v => v * 2), 2)
// 1: 47.631ms
// 2: 0.864ms

// loop(
//     (i) => ö.log(i),
//     (i) => i < 4737,
//     -2,
//     (i) => ++i,
// )

ö.time(() => ö.times(1000000))

const times2 = (times, f = i => i, ...rest) =>
    Array.from({ length: Math.abs(times) }, (v, i) => f(i, ...rest))

ö.time(() => times2(1000000))

const times3 = (times, f = i => i, ...rest) =>
    Array(Math.abs(times))
        .fill()
        .map((v, i) => f(i, ...rest))

ö.time(() => times3(1000000))

let a = [
    [1, 2, 3],
    ['a', 'b', 'c'],
]

ö.pipe(
    a,
    ö.transpose,
    ö.transpose,
    transposedTwice => ö.equals(transposedTwice, a),
    ö.log,
)
