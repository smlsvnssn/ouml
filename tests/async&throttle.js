import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import * as ö from '../ö.mjs'

beforeEach(() => vi.useFakeTimers())

const error = vi.spyOn(console, 'error')

afterEach(() => error.mockReset())

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

describe('ö.wait', () => {
    it('should delay f for t milliseconds', async () => {
        let time = Date.now()
        let promise = ö.wait(2, () => true)

        expect(promise).toBeInstanceOf(Promise)
        await vi.advanceTimersByTimeAsync(2)
        expect(await promise).toBe(true)

        time = Date.now() - time
        expect(time).toBeGreaterThan(0).toBeLessThan(10)
    })

    it('should call error if f errors', async () => {
        let promise = ö.wait(2, () => {
            throw new Error('testy')
        })
        await vi.advanceTimersByTimeAsync(2)
        let resolved = await promise
        //expect(error).toHaveBeenCalledOnce()
        expect(resolved).toBeInstanceOf(Error)
        expect(resolved.message).toBe('testy')
    })

    it('should reset previous call globally if resetPrevCall = true', async () => {
        let first = ö.wait(1000, () => 'first')
        let second = ö.wait(2, () => 'second', true)

        await vi.advanceTimersByTimeAsync(2)

        expect(await second).toBe('second')

        await vi.advanceTimersByTimeAsync(1000)

        expect(await first).toBe(undefined)
    })
})

describe('ö.nextFrame', () => {
    it('should delay f for 1 frame', async () => {
        let time = Date.now()
        let promise = ö.nextFrame(() => true)

        expect(promise).toBeInstanceOf(Promise)

        await vi.advanceTimersToNextTimerAsync()

        expect(await promise).toBe(true)

        time = Date.now() - time
        expect(time).toBeGreaterThan(1).toBeLessThan(30)
    })
})

describe('ö.waitFrames', () => {
    it('should delay f for n frames', async () => {
        let time = Date.now()
        let promise = ö.waitFrames(2, () => true)

        expect(promise).toBeInstanceOf(Promise)

        await vi.advanceTimersToNextTimerAsync()
        await vi.advanceTimersToNextTimerAsync()

        expect(await promise).toBe(true)

        time = Date.now() - time
        expect(time).toBeGreaterThan(20).toBeLessThan(60)
    })

    it('should call f every frame if everyFrame = true', async () => {
        let n = 0
        let promise = ö.waitFrames(3, () => n++, true)

        await vi.advanceTimersToNextTimerAsync()
        await vi.advanceTimersToNextTimerAsync()
        await vi.advanceTimersToNextTimerAsync()

        expect(await promise).toBe(3)
    })
})

describe('ö.waitFor', () => {
    it('should wait for specified event', async () => {
        let n
        let listener = e => (n = e)
        let promise = ö.waitFor('html', 'test', listener)

        document.querySelector('html').dispatchEvent(new Event('test'))

        expect(n).toBeInstanceOf(Event)
        expect(promise).toBeInstanceOf(Promise)

        expect(await promise).toBe(n)
    })

    it('should await specified event', async () => {
        let promise = ö.waitFor('html', 'test')

        document.querySelector('html').dispatchEvent(new Event('test'))

        expect(promise).toBeInstanceOf(Promise)

        expect(await promise).toBe(undefined)
    })
})

describe('ö.load', () => {
    it.skip('loads json from an url', async () => {
        let result = await ö.load('https://dummyjson.com/test')
        expect(result).toEqual({
            method: 'GET',
            status: 'ok',
        })
    })

    it('returns error when failing', async () => {
        let result = await ö.load('/')
        expect(result).toBeInstanceOf(TypeError)

        result = await ö.load('/', true, 'Oops')
        expect(result).toBe('Oops')
    })
})

describe('ö.throttle', () => {
    // Skipped because it screws up if above is skipped. todo: fix
    it.skip('throttles execution of `f` to one call per `t` milliseconds', async () => {
        let n
        let f = ö.throttle(v => (n = v))

        f(1)
        f(2)
        f(3)

        expect(n).toBe(1)

        await vi.advanceTimersToNextTimerAsync()

        expect(n).toBe(1)

        await vi.advanceTimersToNextTimerAsync()

        expect(n).toBe(3)

        f(4)

        expect(n).toBe(3)

        await vi.advanceTimersToNextTimerAsync()

        f(5)

        expect(n).toBe(4)

        await vi.advanceTimersToNextTimerAsync()

        expect(n).toBe(5)
    })
})

describe('ö.debounce', () => {
    it('debounces execution of `f` until no calls are made within `t` milliseconds', async () => {
        let n
        let f = ö.debounce(v => (n = v))

        f(1)
        f(2)
        f(3)

        expect(n).toBe(undefined)

        await vi.advanceTimersToNextTimerAsync()

        expect(n).toBe(3)

        await vi.advanceTimersToNextTimerAsync()

        expect(n).toBe(3)

        f(4)

        expect(n).toBe(3)

        await vi.advanceTimersToNextTimerAsync()

        f(5)

        expect(n).toBe(3)

        await vi.advanceTimersToNextTimerAsync()

        expect(n).toBe(5)
    })

    it('executes first call if immediately = true', async () => {
        let n
        let f = ö.debounce(v => (n = v), 50, true)

        f(1)
        f(2)
        f(3)

        expect(n).toBe(1)

        await vi.advanceTimersToNextTimerAsync()

        expect(n).toBe(3)

        await vi.advanceTimersToNextTimerAsync()

        expect(n).toBe(3)

        f(4)

        expect(n).toBe(4)
    })
})

describe('ö.onAnimationFrame', () => {
    it('defers execution of `f` to next animation frame', async () => {
        let n
        let f = ö.onAnimationFrame(v => (n = v))

        f(1)
        f(2)
        f(3)

        expect(n).toBe(undefined)

        await vi.advanceTimersToNextTimerAsync()

        expect(n).toBe(3)

        await vi.advanceTimersToNextTimerAsync()

        expect(n).toBe(3)

        f(4)

        expect(n).toBe(3)

        await vi.advanceTimersToNextTimerAsync()

        expect(n).toBe(4)
    })
})
