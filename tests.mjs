import * as ö from "./ö.mjs"
import * as öbservable from "./öbservable/index.mjs"
import * as övents from "./övents/index.mjs"

import testData from "./testdata.js"

/* ö.log(`
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

ö.log(ö.rorövovarorsospoproråkoketot('design-core'))

ö.log(ö.createEnum('test'))

ö.log(md5('test'))

ö.log(ö.map(testData, 'id'))

ö.log(ö.times(5)) */

///

/* let primitive = öbservable.observable(0)
const array = öbservable.observable(['test'])
const object = öbservable.observable({ test: 'Yes, test' })

// ö.log(primitive)
// ö.log(array)
// ö.log(object)
ö.log(`...


...`)

const cb = (...v) => console.log('callback: ', ...v)
primitive.observe(cb)
array.observe(cb)
object.observe(cb)

primitive.value = 2

primitive.value = 3

array.push(5)

object.test2 = 'Also test'

ö.log(öbservable.isObservable(array))

const thisGuy = öbservable.observable({ name: 'Guy', surname: 'This' })

öbservable.observe(thisGuy, (val, oldVal, changedProp) =>
	ö.log(`${changedProp} has changed`),
)

thisGuy.observe(v => ö.log(`Name: ${v.name}  Surname: ${v.surname}`))

thisGuy.surname = 'Fawkes' */

import { chain, chainAsync } from "./chain/index.mjs"

//ö.log('Output: ', chain([100]).pop().toString(2).value)

/* ö.log(
	'Output: ',
	await chainAsync('Hilarious')
		.toUpperCase()
		.testFail()
		.split('')
		.map(v => `### ${v} ###`)
		.shuffle()
		.peek()
		.join('')
		//.peek()
		.f(v => v.split('').reverse())
		.join('').value,
) */

/* ö.log(
    'Output:',
    chain(11)
        .f(v => [...Array(v).keys()])
        .map(v => v ** v)
        .peek()
        .sum()
        .toString()
        .length()
        .return(),
)
*/

const errorMessage = "error"
const nameOfPriciestProduct = await chainAsync("https://dummyjson.com/products")
    .load(true, errorMessage)
    .returnIf((v) => v === errorMessage)
    .products()
    .sort((a, b) => a.price > b.price)
    .at(0)
    .title()
    .return()

ö.log("Output: ", nameOfPriciestProduct)

ö.log(chain("AnyValueOfAnyType").toKebabCase().split("-").at(1).return())

ö.log(chain(5).toString().toUpperCase().return())

/* ö.log(
    chain(Math.PI, null, true)
        .fkkfk_fkfk()
        .f(() => {
            throw new Error('lalala')
        })
        .return(),
) */

const obj = { return: "123" }

ö.log(
    chain(obj)
        .f((v) => v.return)
        .return(),
)

ö.log(ö.nChooseK(16, 2))

const parsePersonnummer = (s) => {
    const thisYear = +String(new Date().getFullYear()).substring(2)
    s = s.replaceAll("-", "")
    if (s.length === 10) {
        if (+s.substring(0, 2) > thisYear) return `19${s}`
        return `20${s}`
    }
    if (s.length === 12) return s
    return "FELFELFEL"
}

ö.log(parsePersonnummer("7705143316"))

ö.log(parsePersonnummer("201105143316"))

ö.log("Output: ", ö.isEqual(0, 1))

const va = { a: 1 },
    la = va
la.a = 2
ö.log(va, la)

ö.log(typeof new Array())
class Öbablubb {
    test = "bubb"
    constructor(t) {
        this.test = t
    }
}
ö.log(ö.clone(new Öbablubb("buff")))
ö.log(Object.getPrototypeOf(ö.clone({ a: 1 })))
