import * as ö from 'ouml'
import { isFunc, mapToTree } from 'ouml'
/* 
TODO:
Environment methods, ie isMobile, isTouchscreen, isHiResScreen, isDesktop, isServer etc
Extend lerp to accept any-dimensional numbers, and optional easing functions (https://github.com/AndrewRayCode/easing-utils)
db? Server part for secrets and relay?

multiply and convolve for arrays

√ include .observable in ö?
√ rewrite övents as svelte actions?
(√ kinda) partition as separate modules?

Beziers?
Cubic, Quadratic

Rework colour functions to include oklch and new css features (browser only? Use create element hack?)

*/

// based on https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
const hash = (str, seed = 0) => {
    const shift = (a, b) =>
        (Math.imul(a ^ (a >>> 16), 2246822507) ^
            Math.imul(b ^ (b >>> 13), 3266489909)) >>>
        0

    const format = (n) => n.toString(36).padStart(7, '0')

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

const bubblePipe = (val) =>
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

/* let flat = [
    { id: '1' },
    { id: '1.1', parent: '1' },
    { id: '1.1.1', parent: '1.1' },
    { id: '1.2', parent: '1' },
    { id: '1.2.1', parent: '1.2' },
    { id: '1.3', parent: '1' },
    { id: '2' },
    { id: '2.2', parent: '2' },
    { id: '2.2.1', parent: '2.2' },
]
let tree = mapToTree(flat, (child) => [
    child.id,
    child.id.split('.').slice(0, -1).join('.') || null,
])

ö.log('tree:', tree)
// or
let sameTree = mapToTree(flat, 'id', 'parent')

ö.log('same:', sameTree)
ö.log(JSON.stringify(tree, null, 2))
ö.log(ö.equals(tree, sameTree))

console.log(
    flat.map((v, _, a) =>
        a.findIndex((vv) => vv.id === v.id.split('.').slice(0, -1).join('.')),
    ),
)
 */
const loop = (f, until, i = 0, increment = (i) => i + 1) =>
    !until(i) ? null : (f(i), loop(f, until, increment(i)))

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

let t = 'apa'
ö.log(map(t, (v) => v + ' '))

// slow
const map3 = (a, f, acc = [], i = 0) =>
    i >= a.length ? acc : map3(a, f, [...acc, f(a[i], i, a)], ++i)

// fast
const map2 = (a, f, acc = [], i = 0) =>
    i >= a.length ? acc : map2(a, f, (acc.push(f(a[i], i, a)), acc), ++i)

ö.time(() => map3(ö.times(4000), (v) => v * 2), 1)
ö.time(() => map2(ö.times(4000), (v) => v * 2), 2)
// 1: 47.631ms
// 2: 0.864ms

// loop(
//     (i) => ö.log(i),
//     (i) => i < 4737,
//     -2,
//     (i) => ++i,
// )

let a = [
    {
        a: 1,
        b: [{ a: 1 }, { a: 2 }],
    },
    {
        a: 1,
        b: [{ a: 1 }, { a: 1, b: [{ a: 1 }, { a: 2 }] }],
    },
]

//ö.log(reduceDeep(a, (acc, v, i) => acc + v.a, 'b', 0))

// ö.log(
//     JSON.stringify(
//         ö.reduceDeep(a, (acc, v, i) => (acc.push(1), acc), 'b', [], true),
//         null,
//         2,
//     ),
// )
/* ö.log(
    JSON.stringify(
        ö.mapDeep(
            a,
            () => ({
                b: 1,
            }),
            'b',
            true,
        ),
        null,
        2,
    ),
) */
// ö.log(
//     JSON.stringify(
//         ö.filterDeep(a, (v) => v.a === 2, 'b'),
//         null,
//         2,
//     ),
// )
/* ö.log(ö.reduceDeep([{ k: 'kuk', kuk: ['u'] }], (acc, v) => acc + v, 'kuk'))

ö.log(ö.isPlainObj(a[0]), ö.isPlainObj(new Date()))

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
ö.log(ö.reduceDeep(arr, (acc, v) => acc + v.value, 'children', 0))
 */
