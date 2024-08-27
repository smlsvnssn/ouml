// Disclaimer: These are mostly happy cases. This package is designed to be slim, and handles edge cases and errors for intended use cases only.

import { describe, expect, it } from 'vitest'
import * as ö from './ö.mjs'

import testData from './testdata.js'

import './tests/array&generators.js'
import './tests/logical.js'


describe('ö.pipeAsync', () => {
    it('should return 42 with async calls', async () => {
        const result = await ö.pipeAsync(
            1,
            async x => await (x * 6),
            async x => {
                await ö.wait(100)
                return x ** 2
            },
            async x => await (x + 6),
            ö.log,
        )

        expect(result).toBe(42)
    })

    it('should return 42 with sync calls', async () => {
        const result = await ö.pipeAsync(
            1,
            x => x * 6,
            x => x ** 2,
            x => x + 6,
            ö.log,
        )

        expect(result).toBe(42)
    })

    it('should play nice with closures', async () => {
        const y = 1
        const result = await ö.pipeAsync(
            1,
            x => x * 6,
            async x => {
                const z = await ö.wait(100, () => y + 1)
                return x ** z
            },
            x => x + 6,
            ö.log,
        )

        expect(result).toBe(42)
    })
})

describe('async functions return values', () => {
    it('should return values of f()', async () => {
        let result = 42
        result = await ö.nextFrame(() => result)
        result = await ö.waitFrames(10, () => result)
        result = await ö.wait(10, () => result)

        expect(result).toBe(42)
    })

    it.todo('mock browser event for ö.waitFor', () => {
        // Tried, didn't work. Why?
        const result = value
        expect(result).toBe(value)
    })
})

