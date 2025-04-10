import { describe, expect, it, vi, afterEach } from 'vitest'
import * as ö from '../ö.mjs'
import chain, { chainAsync } from './index.mjs'

const log = vi.spyOn(console, 'log')
const warn = vi.spyOn(console, 'warn')

afterEach(() => {
    log.mockReset()
    warn.mockReset()
})

describe('chain', () => {
    it('should produce expected values', () => {
        let result = chain(11)
            .f(v => [...Array(v).keys()])
            .map(v => v ** v)
            .sum()
            .toString()
            .length()
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

    it('should support peeking', () => {
        let result = chain(11)
            .f(v => [...Array(v).keys()])
            .map(v => v ** v)
            .sum()
            .toString()
            .peek()
            .length().value

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
            .length().value

        expect(warn)
            .toHaveBeenLastCalledWith(`ö says: No method or property found for testFail on type Array, and no method for testFail found in ö or in global scope. Skipping.
`)
    })

    it('should handle a try/catch clause', () => {
        let result = chain(11).try(
            () => {
                throw 'err'
            },
            (val, error) => [val * 2, error],
        ).value

        expect(result).toEqual([22, 'err'])
    })

    it('should optionally throw on failure to find method', () => {
        let result = () =>
            chain(11, true)
                .f(v => [...Array(v).keys()])
                .map(v => v ** v)
                .testFail().value

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

    it('should find global methods, and methods on global objects with underscore', () => {
        let result = chain('-11').Number().Math_abs().value

        expect(result).toBe(11)
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
            .join('').value

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
        // const nameOfPriciestProduct = await chainAsync(
        //     'https://dummyjson.com/products',
        // )
        //     .load(true, errorMessage)
        //     .returnIf(v => v === errorMessage)
        //     .products()
        //     .sort((a, b) => a.price > b.price)
        //     .at(0)
        //     .title()
        //     .return()

        // expect(nameOfPriciestProduct).toBe('Essence Mascara Lash Princess')

        const e = await chainAsync('/')
            .load(true, errorMessage)
            .returnIf(v => v === errorMessage)
            .products()
            .sort((a, b) => a.price > b.price)
            .at(0)
            .title()
            .return()

        expect(e).toBe('error')
    })
})
