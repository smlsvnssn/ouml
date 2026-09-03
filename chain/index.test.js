import { describe, expect, it, vi, afterEach } from 'vitest'
import * as ö from '../ouml.mjs'
import chain, { _, chainAsync } from './index.mjs'

const log = vi.spyOn(console, 'log')
const warn = vi.spyOn(console, 'warn')

afterEach(() => {
    log.mockReset()
    warn.mockReset()
})

describe('chain', () => {
    it('should produce expected values', () => {
        let o = { my: { deep: { path: 11 } } }

        let result = chain(o)
            .my.deep.path()
            .f(v => [...Array(v).keys()])
            .map(v => v ** v)
            .sum()
            .peek()
            .toString()
            .length()
            .Math.pow(3)
            .Math.cbrt()
            .return()

        expect(result).toBe(11)
    })

    it('should evaluate lazily', () => {
        let result = chain(11)
            .f(v => [...Array(v).keys()])
            .map(v => v ** v)
            .sum()
            .toString()
            .length()

        expect(result).toBeInstanceOf(Function)
        expect(result.return()).toBe(11)
    })

    it('should accept _ as placeholder for value argument', () => {
        let result = chain(11)
            .f(v => [...Array(v).keys()])
            .map(v => v ** v)
            .sum()
            .toString()
            .length()
            .Math.max(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, _)

        expect(result).toBeInstanceOf(Function)
        expect(result.return()).toBe(11)
    })

    it('should accept [bracket] syntax, and work with array indices and symbols', () => {
        let result = chain({ blubby: [[0, [11]]] })
            .blubby[0][1][0]()
            .Array()
            .keys()
            .map(v => v ** v)
            .sum()
            .toString()
            [Symbol.iterator]()
            .peek()
            .take(11)
            .toArray()
            .length()()

        expect(result).toBe(11)

        expect(log).toHaveBeenLastCalledWith(`
Peeking into chain after step 7, running Symbol(Symbol.iterator)():
Value: {}
Type:  Iterator
`)
    })

    it('should support key .end(), returning a function taking a value at the end of the chain (data last) ', () => {
        const getIt = chain()
            .f(v => [...Array(v).keys()])
            .map(v => v ** v)
            .sum()
            .toString()
            .peek()
            .length()
            .end()

        expect(getIt).toBeInstanceOf(Function)
        expect(getIt(11)).toBe(11)
    })

    it('should support key .new(), returning a new instance of f, with v + args as aruments', () => {
        function Test(v, arg1, arg2) {
            ;((this.v = v), (this.arg1 = arg1), (this.arg2 = arg2))
        }

        let result = chain(0).new(Test, 1, 2).peek().return()

        expect(result).toBeInstanceOf(Test)
        expect(result.v).toBe(0)
        expect(result.arg1).toBe(1)
        expect(result.arg2).toBe(2)

        result = chain([1,2,3,3]).new(Set).peek().return()

        expect(result).toBeInstanceOf(Set)
        expect(result.size).toBe(3)

    })

    it('should support peeking', () => {
        let result = chain(11)
            .f(v => [...Array(v).keys()])
            .map(v => v ** v)
            .sum()
            .toString()
            .peek()
            .length()
            .return()

        expect(log).toHaveBeenLastCalledWith(`
Peeking into chain after step 4, running toString():
Value: "10405071318"
Type:  String
`)
    })

    it('should warn and continue on failure', () => {
        let result = chain(11)
            .f(v => [...Array(v).keys()])
            .map(v => v ** v)
            .testFail()
            .sum()
            .toString()
            .length()
            .return()

        expect(warn)
            .toHaveBeenLastCalledWith(`ö says: No method or property found for testFail on type Array, and no method for testFail found in ö or in global scope. Skipping.
`)
    })

    it('should handle a try/catch clause', () => {
        let result = chain(11)
            .try(
                () => {
                    throw 'err'
                },
                (val, error) => [val * 2, error],
            )
            .return()

        expect(result).toEqual([22, 'err'])
    })

    it('should optionally throw on failure to find method', () => {
        let result = () =>
            chain(11, true)
                .f(v => [...Array(v).keys()])
                .map(v => v ** v)
                .testFail()
                .return()

        expect(() => result()).toThrow('Chain failed')
    })

    it('should optionally throw on failure in chained method', () => {
        let result = () =>
            chain(Math.PI, true)
                .f(() => {
                    throw 'err'
                })
                .return()

        expect(() => result()).toThrow('Chain failed')
    })

    it('should find global methods, and methods on global objects', () => {
        let result = chain('-11').Number().Math.abs().Math.pow(2).return()

        expect(result).toBe(121)
    })

    it('should support alternate syntax', () => {
        let result = chain('-11')(Number)(Math.abs)(v => Math.pow(v, 2))()

        expect(result).toBe(121)
    })
})

describe('chainAsync', () => {
    it('should produce expected values', async () => {
        let result = await chainAsync('abc')
            .toUpperCase()
            .split('')
            .map(v => `# ${v} #`)
            .join('')
            .f(v => v.split('').reverse())
            .join('')()

        expect(result).toBe('# C ## B ## A #')
    })

    it('should support key .end()', async () => {
        let doIt = chainAsync()
            .toUpperCase()
            .split('')
            .map(v => `# ${v} #`)
            .join('')
            .f(v => v.split('').reverse())
            .join('')
            .end()

        expect(await doIt('abc')).toBe('# C ## B ## A #')
    })

    it('should handle an escape clause', async () => {
        const errorMessage = 'error'

        const e = await chainAsync('/')
            .load(true, errorMessage)
            .returnIf(v => v === errorMessage)
            .products()
            .at(0)
            .return()

        expect(e).toBe('error')
    })
})
