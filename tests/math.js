import { describe, expect, it } from 'vitest'
import * as ö from '../ö.mjs'

describe('ö.random', () => {
    it('should return integers between min & non inclusive max, with 0 and 2 as defaults', () => {
        let result = ö.times(100, () => ö.random())

        expect(result.every(v => ö.between(v, 0, 2))).toBe(true)

        result = ö.times(100, () => ö.random(-100, 100))

        expect(result.every(v => ö.between(v, -100, 100))).toBe(true)
        expect(result.every(v => ö.isInt(v))).toBe(true)
    })

    it('should return floats between min & non inclusive max when float = true', () => {
        let result = ö.times(100, () => ö.random(0, 2, true))

        expect(result.every(v => ö.between(v, 0, 2))).toBe(true)
        expect(result.every(v => ö.isInt(v))).not.toBe(true)

        result = ö.times(100, () => ö.random(100, true))

        expect(result.every(v => ö.between(v, 0, 100))).toBe(true)
        expect(result.every(v => ö.isInt(v))).not.toBe(true)
    })
})

describe('ö.randomNormal', () => {
    it('should return numbers between about ± 4 sigma, centered around mean', () => {
        let result = ö.times(100, () => ö.randomNormal())

        expect(result.every(v => ö.between(v, -5, 5))).toBe(true)

        result = ö.times(100, () => ö.randomNormal(100, 100))

        expect(result.every(v => ö.between(v, -400, 500))).toBe(true)
    })
})

describe('ö.round', () => {
    it('should return rounded numbers', () => {
        expect(ö.round(0.3 - 0.2, 5)).toBe(0.1)
        expect(ö.round(0.499999999999999)).toBe(0)
        expect(ö.round(0.49999999999999999)).toBe(1)
        expect(ö.round(0.5)).toBe(1)
        expect(ö.round(1)).toBe(1)
        expect(ö.round(Math.PI)).toBe(3)
        expect(ö.round(Math.PI, 2)).toBe(3.14)
        expect(ö.round(Math.PI, 6)).toBe(3.141593)
    })
})

describe('ö.clamp', () => {
    it('should clamp n between min & non inclusive max, or flip max and min if min > max', () => {
        expect(ö.clamp(0, -1, 1)).toBe(0)
        expect(ö.clamp(0, 1, -1)).toBe(0)
        expect(ö.clamp(0, 0, 0)).toBe(0)
    })

    it('should return max or min when n is out of range', () => {
        expect(ö.clamp(1, -1, 1)).toBe(1)
        expect(ö.clamp(1, 1, -1)).toBe(1)
        expect(ö.clamp(1, 0, 1)).toBe(1)
        expect(ö.clamp(100, 0, 1)).toBe(1)
        expect(ö.clamp(-100, 0, 1)).toBe(0)
        expect(ö.clamp(1 + Number.EPSILON, 0, 1)).toBe(1)
    })
})

describe('ö.between', () => {
    it('should return true when n is between min & non inclusive max, or flip max and min if min > max', () => {
        expect(ö.between(0, -1, 1)).toBe(true)
        expect(ö.between(0, 1, -1)).toBe(true)
        expect(ö.between(0, 0, Number.EPSILON)).toBe(true)
    })

    it('should return false when n is out of range', () => {
        expect(ö.between(1, -1, 1)).toBe(false)
        expect(ö.between(1, 1, -1)).toBe(false)
        expect(ö.between(1, 0, 1)).toBe(false)
    })
})

describe('ö.normalise', () => {
    it('should normalise and clamp value given min max range', () => {
        expect(ö.normalise(10, 0, 100)).toBe(0.1)
        expect(ö.normalise(1000, 0, 100)).toBe(1)
        expect(ö.normalise(50, -100, 100)).toBe(0.75)
        expect(ö.normalise(0, -100, 100)).toBe(0.5)
    })

    it('should normalise but not clamp value given min max range', () => {
        expect(ö.normalise(1000, 0, 100, false)).toBe(10)
        expect(ö.normalise(-1000, 0, 100, false)).toBe(-10)
    })
})

describe('ö.isPrime', () => {
    it('should return true for primes, and false for composites', () => {
        let primesUnder100 = ö
            .times(100, i => (ö.isPrime(i) ? i : null))
            .filter(n => n != null)

        expect(primesUnder100).toEqual([
            2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61,
            67, 71, 73, 79, 83, 89, 97,
        ])
    })
})

describe('ö.lerp', () => {
    it('should interpolate linearly', () => {
        expect(ö.lerp(0, 10, 0.5)).toBe(5)
        expect(ö.lerp(10, 0, 0.5)).toBe(5)
        expect(ö.lerp(-10, 0, 0.25)).toBe(-7.5)
    })
})

describe('ö.smoothstep', () => {
    it('should interpolate with smoothstep', () => {
        expect(ö.smoothstep(0, 10, 0.5)).toBe(5)
        expect(ö.smoothstep(10, 0, 0.5)).toBe(5)
        expect(ö.smoothstep(-10, 0, 0.25)).toBe(-8.4375)
    })
})

describe('ö.easeIn', () => {
    it('should ease in', () => {
        expect(ö.easeIn(0, 10, 0.5)).toBe(2.5)
        expect(ö.easeIn(10, 0, 0.5)).toBe(7.5)
        expect(ö.easeIn(-10, 0, 0.25)).toBe(-9.375)
    })
})

describe('ö.easeOut', () => {
    it('should ease out', () => {
        expect(ö.easeOut(0, 10, 0.5)).toBe(7.5)
        expect(ö.easeOut(10, 0, 0.5)).toBe(2.5)
        expect(ö.easeOut(-10, 0, 0.25)).toBe(-5.625)
    })
})

describe('ö.nthRoot', () => {
    it('should return nth root of x', () => {
        expect(ö.nthRoot(256, 8)).toBe(2)
        expect(ö.nthRoot(27, 3)).toBe(3)
        expect(ö.nthRoot(1, 100)).toBe(1)
        expect(ö.nthRoot(1 / 256, 4)).toBe(0.25)
    })
})

describe('ö.factorial', () => {
    it('should return factorial of n', () => {
        expect(ö.factorial(0)).toBe(1)
        expect(ö.factorial(1)).toBe(1)
        expect(ö.factorial(2)).toBe(2)
        expect(ö.factorial(10)).toBe(3628800)
        expect(ö.factorial(171)).toBe(Infinity)
        expect(ö.factorial(-10)).toBe(1)
    })
})

describe('ö.nChooseK', () => {
    it('should return the binomial coefficient', () => {
        expect(ö.nChooseK(0, 0)).toBe(1)
        expect(ö.nChooseK(-1, 0)).toBe(0)
        expect(ö.nChooseK(0, -1)).toBe(0)
        expect(ö.nChooseK(100, 100)).toBe(1)
        expect(ö.nChooseK(100, 99)).toBe(100)
        expect(ö.nChooseK(3, 2)).toBe(3)
        expect(ö.nChooseK(50, 25)).toBe(126410606437752)
    })
})

describe('ö.toPolar', () => {
    it('should return polar coords', () => {
        expect(ö.toPolar(0, 0)).toStrictEqual({ r: 0, theta: 0 })
        expect(ö.toPolar(0, 1)).toStrictEqual({ r: 1, theta: Math.PI * 0.5 })
        expect(ö.toPolar(-1, 1)).toStrictEqual({
            r: Math.sqrt(2),
            theta: Math.PI * 0.75,
        })
    })
})

describe('ö.toCartesian', () => {
    it('should return cartesian coords', () => {
        expect(ö.toCartesian(0, 0)).toStrictEqual({ x: 0, y: 0 })
        expect(ö.toCartesian(1, 0)).toStrictEqual({
            x: 1,
            y: 0,
        })
        expect(ö.toCartesian(1, Math.PI).y).toBeCloseTo(0, 10)
    })
})
