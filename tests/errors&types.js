import { describe, expect, it, vi, afterAll } from 'vitest'
import * as ö from '../ö.mjs'

describe.todo('error methods', () => {
    // describe('should mock console.log', () => {
    //     const consoleMock = vi
    //         .spyOn(console, 'log')
    //         .mockImplementation(() => undefined)
    //     afterAll(() => {
    //         consoleMock.mockReset()
    //     })
    //     it('should log `sample output`', () => {
    //         console.log('sample output')
    //         expect(consoleMock).toHaveBeenCalledOnce()
    //         expect(consoleMock).toHaveBeenLastCalledWith('sample output')
    //     })
    // })
})

describe('type checking', () => {
    it('should pass', () => {
        expect(true).toSatisfy(ö.isBool)
        expect(1).not.toSatisfy(ö.isBool)

        expect(0).toSatisfy(ö.isNum)
        expect('0').not.toSatisfy(ö.isNum)

        expect(1).toSatisfy(ö.isInt)
        expect(0.1).not.toSatisfy(ö.isInt)
        expect(1n).not.toSatisfy(ö.isInt)

        expect(1n).toSatisfy(ö.isBigInt)
        expect(BigInt(1)).toSatisfy(ö.isBigInt)
        expect(1).not.toSatisfy(ö.isBigInt)

        expect('0').toSatisfy(ö.isStr)
        expect('').toSatisfy(ö.isStr)
        expect(`''`).toSatisfy(ö.isStr)
        expect("`''`").toSatisfy(ö.isStr)
        expect(`${0}`).toSatisfy(ö.isStr)
        expect(0).not.toSatisfy(ö.isStr)
        expect(/0/).not.toSatisfy(ö.isStr)

        expect(Symbol()).toSatisfy(ö.isSym)
        expect(Symbol.for(1)).toSatisfy(ö.isSym)
        expect(0).not.toSatisfy(ö.isSym)

        expect(Function).toSatisfy(ö.isFunc)
        expect(i => i).toSatisfy(ö.isFunc)
        expect(new Function('i => i')).toSatisfy(ö.isFunc)
        expect('i => i').not.toSatisfy(ö.isFunc)

        expect([]).toSatisfy(ö.isArr)
        expect(Array()).toSatisfy(ö.isArr)
        expect({}).not.toSatisfy(ö.isArr)

        expect(null).toSatisfy(ö.isNull)
        expect(undefined).not.toSatisfy(ö.isNull)
        expect({}).not.toSatisfy(ö.isNull)

        expect(new Date()).toSatisfy(ö.isDate)
        expect(Date()).not.toSatisfy(ö.isDate)
        expect(Date.now()).not.toSatisfy(ö.isDate)

        expect(new Map()).toSatisfy(ö.isMap)

        expect(new Set()).toSatisfy(ö.isSet)

        expect(new RegExp('0')).toSatisfy(ö.isRegex)
        expect(/0/).toSatisfy(ö.isRegex)

        expect(null).toSatisfy(ö.is)
        expect(undefined).not.toSatisfy(ö.is)

        expect(undefined).toSatisfy(ö.isnt)
        expect(null).not.toSatisfy(ö.isnt)

        expect({}).toSatisfy(ö.isObj)
        expect(Object.create(null)).toSatisfy(ö.isObj)
        expect(null).not.toSatisfy(ö.isObj)
        expect([]).not.toSatisfy(ö.isObj)
        expect(/0/).not.toSatisfy(ö.isObj)

        expect({}).toSatisfy(ö.isPlainObj)
        expect(Object.create(null)).not.toSatisfy(ö.isPlainObj)

        expect(Object.create(null)).toSatisfy(ö.isNakedObj)
        expect({}).not.toSatisfy(ö.isNakedObj)

        expect('123').toSatisfy(ö.isIterable)
        expect([]).toSatisfy(ö.isIterable)
        expect([][Symbol.iterator]).not.toSatisfy(ö.isIterable)
        expect(123).not.toSatisfy(ö.isIterable)
    })
})

describe('type conversion', () => {
    it('should pass', () => {
        expect(ö.mapToObj(new Map())).toSatisfy(ö.isObj)
        expect(Object.create(Map)).toSatisfy(ö.isObj)
        expect(ö.objToMap({})).toBeInstanceOf(Map)
    })

    it('should eat iterables, but throw on strings', () => {
        expect(() => ö.mapToObj('test')).toThrow(
            'map.entries is not a function',
        )
        expect(ö.mapToObj(new Set())).toSatisfy(ö.isObj)
        expect(ö.mapToObj([])).toSatisfy(ö.isObj)
    })
})
