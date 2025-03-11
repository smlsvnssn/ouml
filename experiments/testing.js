import * as ö from '../ö.mjs'
import { isFunc, isStr } from '../ö.mjs'
import { chain, chainAsync } from '../chain/index.mjs'
import jsdom from 'jsdom'

const { JSDOM } = jsdom
globalThis.window = new JSDOM(`...`).window
globalThis.document = window.document

chain(10)
    .times(v => v + 1)
    .log()()

ö.log(ö.times(10, v => v + 1))

let a = [0]
a[0] = a

ö.time(() => ö.isPrime(999999999989))

ö.time(() =>
    (
        BigInt(Math.random() * 2 ** 512) * BigInt(Math.random() * 2 ** 512)
    ).toString(36),
)

ö.log(ö.rotate([1, 2, 3, 4], 1))
ö.log(ö.rotate([1, 2, 3, 4], -1))
ö.log(ö.chunk([1, 2, 3, 4, 5, 6, 7], 3))
ö.log(ö.rangeArray(0, -1, 0.05))

let deepArr = [
    {
        a: 666,
        b: [{ a: 1 }, { a: 2 }],
    },
    { a: 222 },
    { a: 666, b: [{ a: 0 }] },
    {
        a: 666,
        b: [{ a: 1 }, { a: 333, b: [{ a: 1 }, { a: 2 }] }],
    },
]

ö.log(JSON.stringify(ö.filterDeep(deepArr, 3, 'b', 'a', false), null, 2))


