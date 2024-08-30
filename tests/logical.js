import { describe, expect, it } from 'vitest'
import * as ö from '../ö.mjs'

describe('ö.equals', () => {
    it('should evaluate these as equal', () => {
        expect(ö.equals(1, 1)).toBe(true)

        let f = () => null
        expect(ö.equals(() => null, f)).toBe(true)

        expect(ö.equals(null, null)).toBe(true)

        expect(ö.equals(`${1}`, '1')).toBe(true)

        expect(ö.equals(new Date(), new Date())).toBe(true)

        expect(ö.equals(/abc/, new RegExp('abc'))).toBe(true)

        let s = Symbol()
        expect(ö.equals({ [s]: s }, { [s]: s })).toBe(true)

        expect(ö.equals({ a: { a: 1 } }, { a: { a: 1 } })).toBe(true)
    })

    it('should evaluate these as not equal', () => {
        expect(ö.equals(undefined, null)).toBe(false)

        expect(ö.equals(NaN, NaN)).toBe(false)

        let arr = [1],
            arraylike = { 0: 1, length: 1 }

        expect(ö.equals(arr, arraylike)).toBe(false)

        let obj = Object.create({}),
            nakedObj = Object.create(null)

        expect(ö.equals(obj, nakedObj)).toBe(false)
    })
})

describe('ö.clone', () => {
    let obj = { a: 1, b: { c: [1, 2, 3] } }
    let arr = [
        [1, 2],
        [3, 4],
    ]

    class Test {
        prop = true
    }

    let cl = new Test()

    it('should clone', () => {
        expect(ö.clone(1)).toBe(1)

        expect(ö.clone(obj)).toStrictEqual(obj)
        expect(ö.clone(obj)).not.toBe(obj)

        expect(ö.clone(arr)).toStrictEqual(arr)
        expect(ö.clone(arr)).not.toBe(arr)
    })

    it('should preserve prototype', () => {
        expect(ö.clone(obj)).toBeInstanceOf(Object)
        expect(ö.clone(arr)).toBeInstanceOf(Array)
        expect(ö.clone(cl)).toBeInstanceOf(Test)

        expect(Object.getPrototypeOf(ö.clone(Object.create(null)))).toBe(null)
    })

    it('should shallow clone when deep = false', () => {
        let shallow = ö.clone(obj, false)

        expect(shallow).toStrictEqual(obj)
        expect(shallow.b).toBe(obj.b)
    })

    it('should produce an immutable when immutable = true', () => {
        let imm = ö.clone(obj, true, true)

        expect(() => (imm.test = 0)).toThrow('object is not extensible')
    })
})

describe('ö.immutable', () => {
    it('should produce an immutable', () => {
        let imm = ö.immutable({})

        expect(() => (imm.test = 0)).toThrow('object is not extensible')
    })
})

describe('ö.pipe', () => {
    it('should produce a value', () => {
        const add1 = x => x + 1
        expect(ö.pipe(1, add1, add1, add1)).toBe(4)
    })
})

describe('ö.toPiped', () => {
    it('should produce a function producing a value', () => {
        const add1 = x => x + 1
        const add3 = ö.toPiped(add1, add1, add1)

        expect(add3(1)).toBe(4)
    })
})

describe('ö.curry', () => {
    it('should produce a curried function', () => {
        const f = (a, b, c) => a + b + c
        const curried = ö.curry(f)
        const first = curried(1)
        const firstTwo = curried(1, 2)

        expect(curried(1)(2)(3)).toBe(6)
        expect(first(2, 3)).toBe(6)
        expect(first(2)(3)).toBe(6)
        expect(firstTwo(3)).toBe(6)
    })
})

describe('ö.memoise', () => {
    it('should return a memoised function', () => {
        const f = (a, b) => a ** b
        const memo = ö.memoise(f)
        expect(memo(2, 2)).toBe(4)
        expect(memo(2, 2)).toBe(4)
    })

    it('should work with a keymaker', () => {
        const f = a => a
        const memo = ö.memoise(f, JSON.stringify)
        let obj = { a: 1 }

        expect(memo(obj)).toStrictEqual(obj)
        expect(memo(obj)).toStrictEqual(obj)
        expect(memo({ a: 2 })).not.toStrictEqual(obj)
    })

    it('should be faster the second time for a slow operation', () => {
        const f = (a, b) => ö.sum(ö.times(100000, i => i * a * b))
        const memo = ö.memoise(f)

        let before = Date.now()
        let result1 = memo(1, -1)
        let time1 = Date.now() - before

        before = Date.now()
        let result2 = memo(1, -1)
        let time2 = Date.now() - before

        expect(time1).toBeGreaterThan(time2)
        expect(result1).toEqual(result2)
    })
})

describe('ö.createEnum', () => {
    const STR = ö.createEnum('small', 'medium', 'large')
    const ARR = ö.createEnum(['small', 'medium', 'large'])
    const OBJ = ö.createEnum({
        small: Symbol('small'),
        medium: Symbol('medium'),
        large: Symbol('large'),
    })

    it('should take an object, an array of strings, or strings', () => {
        expect(Object.keys(STR)).toEqual(Object.keys(ARR))
        expect(Object.keys(STR)).toEqual(Object.keys(OBJ))
    })

     it('should have symbols as values (if not given an object)', () => {
         expect(STR.small).toBeTypeOf('symbol')
     })

    it('should return an immutable', () => {
        expect(() => (STR.test = 0)).toThrow('not extensible')
        expect(() => (OBJ.test = 0)).toThrow('not extensible')
        expect(() => (OBJ.small = 0)).toThrow('read only property')
    })
})

describe('ö.data', () => {
    let obj = {}
    
    it('should get and set data associated with an object', () => {
        ö.data(obj, 'testdata', 'value')
        
        expect(ö.data(obj)).toStrictEqual({testdata: 'value'})
        expect(ö.data(obj, 'testdata')).toBe('value')
        
        ö.data(obj, 'testdata', 'newvalue')

        expect(ö.data(obj, 'testdata')).toBe('newvalue')

    })
})
