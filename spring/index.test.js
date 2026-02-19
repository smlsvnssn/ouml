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

    it('should clamp inputs for stiffness, damping and mass', () => {
        expect(mySpring.settings.stiffness).toBe(1)
        expect(mySpring.settings.damping).toBe(1)

        // setting directly should not work 
        mySpring.settings.stiffness = -1
        expect(mySpring.settings.stiffness).toBe(1)

        mySpring.settings = { stiffness: -1 }
        expect(mySpring.settings.stiffness).toBe(0)

        mySpring.settings = { mass: -1 }
        expect(mySpring.settings.mass).toBe(0.1)

        mySpring.settings = { mass: 1001 }
        expect(mySpring.settings.mass).toEqual(1000)
    })

    it('should take a number as input', () => {
        let out
        let mySpring = spring(0, n => (out = n))
        mySpring.setTarget(0)
        expect(out).toBe(0)
    })

    it('should throw on malformed input', () => {
        let expectedError =
            'Current and target must be either a number, or an object with properties containing numbers.'

        expect(() => spring('string')).toThrow(expectedError)
        expect(() => spring({ x: 'string' })).toThrow(expectedError)
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
        expect(yValues.length).toBe(8)
        expect(xValues.length).toBe(8)
    })

    vi.useRealTimers()
})
