import * as ö from './ö.mjs'
import testData from './testdata.js'

ö.log(`
---
`)

ö.log(ö.groupBy(testData, 'gender'))
//ö.log(ö.groupBy(testData, (v, i, a) => (v.gender == 'Male' ? 'Man' : 'Andra')))
//ö.log(ö.normalise(100, 0, 1000))
// ö.log(ö.toHsla('hsl(360, 10%, 90%)'))
// ö.log(ö.createEnum(['a', 'b', 'c']))
// ö.log(({ a: { b: { c: {} } } }.a.b.c.test = '?'))

//ö.log(ö.times(10, () => ö.randomChars(100)))

ö.log(ö.prettyNumber(123456, 2))

const testFilterDeep = [
	{ a: 1, obj: [{ a: 2, obj: [{ a: 3, obj: [{ a: 4, obj: [] }] }] }] },
]

ö.log(ö.filterDeep(testFilterDeep, 2, 'obj', 'a'))

ö.log(`
---
`)

let a = 0.12345
ö.log(ö.round(a, 2))

let test = { h: 100, s: 10, l: 10, a: 0.5 }

ö.pipe(test, ö.hsla, ö.log)
