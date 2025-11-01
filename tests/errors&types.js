import { describe, expect, it, vi, afterEach } from 'vitest'
import * as ö from '../ouml.mjs'

const log = vi.spyOn(console, 'log')
const warn = vi.spyOn(console, 'warn')
const error = vi.spyOn(console, 'error')
const time = vi.spyOn(console, 'time')
const timeEnd = vi.spyOn(console, 'timeEnd')

afterEach(() => {
    log.mockReset()
    warn.mockReset()
    error.mockReset()
    time.mockReset()
    timeEnd.mockReset()
})

describe('ö.attempt', () => {
    it('should try and fail with a default value', () => {
        let result = ö.attempt(() => {
            throw new Error()
        }, 'Caught it')

        expect(result).toBe('Caught it')
    })

    it('should try and fail with the handler receiving the error', () => {
        let result = ö.attempt(
            () => {
                throw new Error('err')
            },
            e => e.message,
        )

        expect(result).toBe('err')
    })

    it('should return caught error if handler is not provided', () => {
        let result = ö.attempt(() => {
            throw new Error('err')
        })

        expect(result).toBeInstanceOf(Error)
        expect(result.message).toBe('err')
    })

    it('should try and return result of f if no error', () => {
        let result = ö.attempt(() => 1, 0)

        expect(result).toBe(1)
    })

    it('should read rest arguments as args for f', () => {
        let result = ö.attempt((v, v2, v3) => v + v2 + v3, 'handler', 1, 2, 3)

        expect(result).toBe(6)
    })
})

describe('ö.attemptAsync', () => {
    it('should try and fail with a default value', async () => {
        let result = await ö.attemptAsync(() => {
            throw new Error()
        }, 'Caught it')

        expect(result).toBe('Caught it')
    })

    it('should try and fail with the handler receiving the error', async () => {
        let result = await ö.attemptAsync(
            () => {
                throw new Error('err')
            },
            e => e.message,
        )

        expect(result).toBe('err')
    })

    it('should try and return result of f if no error', async () => {
        let result = await ö.attemptAsync(() => 1, 0)

        expect(result).toBe(1)
    })

    it('should read rest arguments as args for f', async () => {
        let result = await ö.attemptAsync(
            (v, v2, v3) => v + v2 + v3,
            'handler',
            1,
            2,
            3,
        )

        expect(result).toBe(6)
    })
})

describe('ö.verbose', () => {
    it('should get/set isVerbose & isThrowing', () => {
        expect(ö.verbose()).toMatchObject({
            isVerbose: true,
            isThrowing: false,
        })

        ö.log('test')
        expect(log).toHaveBeenCalledOnce()

        expect(ö.verbose(false, true)).toMatchObject({
            isVerbose: false,
            isThrowing: true,
        })

        ö.log('test')
        expect(log).toHaveBeenCalledOnce()

        // reset
        ö.verbose(true, false)
    })
})

describe('ö.error', () => {
    it('should log error to console, or throw', () => {
        expect(ö.error('err')).toEqual('err')
        expect(ö.error('err', 'rest')).toEqual(['err', 'rest'])

        expect(error).toHaveBeenLastCalledWith('ö says: err\n', 'rest')

        ö.verbose(true, true)

        expect(() => ö.error('err')).toThrow('err')

        // reset
        ö.verbose(true, false)
    })
})

describe('ö.warn', () => {
    it('should log warning to console', () => {
        expect(ö.warn('warn')).toEqual('warn')
        expect(ö.warn('warn', 'rest')).toEqual(['warn', 'rest'])

        expect(warn).toHaveBeenLastCalledWith('ö says: warn\n', 'rest')
    })
})

describe('ö.log', () => {
    it('should log to console', () => {
        expect(ö.log('hello')).toEqual('hello')
        expect(ö.log('hello', 'rest')).toEqual(['hello', 'rest'])

        expect(log).toHaveBeenLastCalledWith('hello', 'rest')
    })
})

describe('ö.time, ö.timeEnd', () => {
    it('should log time to console', () => {
        expect(ö.time(() => 'value', 'hello')).toEqual('value')

        expect(time).toHaveBeenLastCalledWith('hello')
        expect(timeEnd).toHaveBeenLastCalledWith('hello')

        ö.time('bye')
        ö.timeEnd('bye')

        expect(time).toHaveBeenLastCalledWith('bye')
        expect(timeEnd).toHaveBeenLastCalledWith('bye')
    })
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

        expect(new TypeError()).toSatisfy(ö.isError)

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

    it('should produce numbers from strings', () => {
        expect(ö.strToNum('test')).toBe(NaN)
        expect(ö.strToNum('1_234_567')).toBe(1234567)
        expect(ö.strToNum('1 234 567,')).toBe(1234567)
        expect(ö.strToNum('123456,7')).toBe(123456.7)
        expect(ö.strToNum('1,23456,7')).toBe(1.23456)
        expect(ö.strToNum('1,234567E5')).toBe(123456.7)
        expect(ö.strToNum('Even: -1,23456E5 Better')).toBe(-123456)
        expect(ö.strToNum('blabla-1,23456E5dollares')).toBe(-123456)
        expect(ö.strToNum('Infinity')).toBe(NaN)
        expect(ö.strToNum('Debt: -35,50$')).toBe(-35.5)
        expect(ö.strToNum('Debt: -1 035,50$')).toBe(-1035.5)
    })
})
