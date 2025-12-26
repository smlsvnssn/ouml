import { describe, expect, it, vi } from 'vitest'
import * as ö from '../ouml.mjs'
import spring from './index.mjs'

describe('spring', () => {
    const mySpring = spring({ x: 0, y: 0 }, () => {}, {
        stiffness: 1.2,
        damping: 1.2,
    })
    it('should return Spring instance', () => {
        expect(mySpring.constructor.name).toEqual('Spring')
    })

    it('should clamp inputs for stiffness and damping', () => {
        expect(mySpring.settings.stiffness).toEqual(1)
        expect(mySpring.settings.damping).toEqual(1)

        mySpring.settings.stiffness = -1
        expect(mySpring.settings.stiffness).toEqual(1)

        mySpring.settings = { stiffness: -1 }
        expect(mySpring.settings.stiffness).toEqual(0)
    })

    it('should take a number as input', () => {
        let out
        let mySpring = spring(0, n => (out = n))
        mySpring.setTarget(0)
        expect(out).toBe(0)
    })

    it('should throw on malformed input', () => {
        expect(() => spring('string')).toThrow('Input must ')

        expect(() => spring({ x: 'string' })).toThrow('Input must ')
    })
})

describe('spring.setTarget', async () => {
    let xVal, yVal
    let xValues = [],
        yValues = []

    const mySpring = spring(
        { x: 0, y: 0 },
        ({ x, y }) => {
            xVal = x
            yVal = y
            xValues.push(x)
            yValues.push(y)
        },
        {
            stiffness: 1.2,
            damping: 1.2,
        },
    )

    vi.useFakeTimers()
    mySpring.settings = { stiffness: 1, precision: 1 }
    let target = { x: 10, y: 10 }

    let promise = mySpring.setTarget(target)

    it('should return a promise', () => {
        expect(promise).toBeInstanceOf(Promise)
    })

    ö.times(100, vi.advanceTimersToNextFrame)
    let settled = await promise

    it('should settle at target values', () => {
        expect(xVal).toEqual(target.x)
        expect(yVal).toEqual(target.y)

        expect(settled).toBe(target)
    })

    it('should animate between current and target', () => {
        expect(yValues.length).toBe(71)
        expect(xValues.length).toBe(71)
    })

    vi.useRealTimers()
})
