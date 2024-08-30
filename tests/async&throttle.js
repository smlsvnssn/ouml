import { describe, expect, it } from 'vitest'
import * as ö from '../ö.mjs'

describe.todo('async methods', () => {})

describe('ö.pipeAsync', () => {
    it('should produce a promise producing a value', async () => {
        const add1 = async x => x + 1
        let promise = ö.pipeAsync(1, add1, add1, add1)

        expect(promise).toBeInstanceOf(Promise)
        expect(await promise).toBe(4)
    })
})

describe('ö.toPipedAsync', () => {
    it('should produce function producing a promise producing a value', async () => {
        const add1 = async x => x + 1
        const add3 = ö.toPipedAsync(add1, add1, add1)
        let promise = add3(1)

        expect(promise).toBeInstanceOf(Promise)
        expect(await promise).toBe(4)
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