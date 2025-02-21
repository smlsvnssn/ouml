import { describe, expect, it } from 'vitest'
import bits from './index.mjs'
import { time, log } from '../ö.mjs'
log(bits(63).toString())
describe('bits', () => {
    it('should create Bits from number input', () => {
        let a = bits(1023),
            b = bits(1023n)
        expect(a.valueOf()).toBe(b.valueOf())
        expect(b.toString()).toBe('1111111111')
    })

    it('should create Bits from array or arguments input, and coerce vals to number', () => {
        let a = bits([1, 'str', true, []]),
            b = bits(1, 1, 1, 1)
        expect(a.valueOf()).toBe(b.valueOf())
        expect(b.toString()).toBe('1111')
        expect(b.valueOf()).toBe(15n)

        a = bits([0, '', false, NaN])
        b = bits(0, 0, 0, 0)

        expect(a.valueOf()).toBe(b.valueOf())
        expect(b.toString()).toBe('0')
        expect(b.valueOf()).toBe(0n)
    })

    it('should create Bits from binary string', () => {
        let a = bits('1010')

        expect(a.valueOf()).toBe(10n)
        expect(a.toString()).toBe('1010')
    })

    it('should throw on faulty binary string', () => {
        expect(() => bits('10 Det går ju inte')).toThrow('Strange bits')
    })

    it('should create new Bits from old Bits', () => {
        let a = bits(bits('1010'))

        expect(a.valueOf()).toBe(10n)
        expect(a.toString()).toBe('1010')
    })

    it('should handle empty input', () => {
        let a = bits()
        expect(a.valueOf()).toBe(0n)
    })
})

describe('Bits.get', () => {
    it('should get bit at index', () => {
        let a = bits(4).get(2)
        let b = bits(4).get(1)
        expect(a).toBe(1)
        expect(b).toBe(0)
    })

    it('should get bit at index as boolean', () => {
        let a = bits(4).get(2, true)
        let b = bits(4).get(1, true)
        expect(a).toBe(true)
        expect(b).toBe(false)
    })

    it('should return 0 for negative indicies', () => {
        let a = bits(-4).get(-2, true)
        let b = bits(-4).get(-2)
        expect(a).toBe(false)
        expect(b).toBe(0)
    })
})

describe('Bits.set', () => {
    it('should set bit at index', () => {
        let a = bits(4).set(1).get(1)
        let b = bits(4).get(1)
        expect(a).toBe(1)
        expect(b).toBe(0)
    })

    it('should set bit at index to 0 if value is 0', () => {
        let a = bits(4).set(1, 0).get(1)
        let b = bits(4).get(1)
        expect(a).toBe(0)
        expect(b).toBe(0)
    })

    it('should coerce value to number', () => {
        let a = bits(4).set(1, false).get(1)
        expect(a).toBe(0)
    })

    it('should set nothing for negative indicies', () => {
        let a = bits(-4).set(-2)
        expect(a.valueOf()).toBe(-4n)
    })

    it('should set large indices', () => {
        let a = bits().set(1_000_000_000)
        expect(a.get(1_000_000_000)).toBe(1)

        expect(a.length).toBe(1_000_000_001)
    })

    it('should work up to max bigint size', () => {
        expect(() => bits().set(1_073_741_823)).not.toThrow(
            'Maximum BigInt size exceeded',
        )
        expect(() => bits().set(1_073_741_824)).toThrow(
            'Maximum BigInt size exceeded',
        )
    })
})

describe('Bits.flip', () => {
    it('should flip bit at index', () => {
        let a = bits(4).flip(2).get(2)
        let b = bits(4).flip(1).get(1)
        expect(a).toBe(0)
        expect(b).toBe(1)
    })
})

describe('Bits.clear', () => {
    it('should clear bit at index', () => {
        let a = bits(4).clear(2).get(2)
        let b = bits(4).clear(1).get(1)
        expect(a).toBe(0)
        expect(b).toBe(0)
    })
})

describe('Bits.slice', () => {
    it('should return a slice of bits', () => {
        let a = bits('1010101010').slice(5)
        let b = a.slice()

        expect(a.toString()).toBe('10101')
        expect(a.valueOf()).toBe(21n)
        expect(b.valueOf()).toBe(a.valueOf())

        let c = b.slice(1, 2)
        expect(c.valueOf()).toBe(0n)
    })
})

describe('Bits.range', () => {
    it('should yield a slice of bits', () => {
        let a = [...bits('1010101010').range(5)]
        expect(a).toEqual([1, 0, 1, 0, 1])
    })
})

describe('Bits[Symbol.iterator]', () => {
    it('should yield all bits', () => {
        let a = [...bits('10101')]
        expect(a).toEqual([1, 0, 1, 0, 1])
    })
})

describe('Bits.length', () => {
    it('should return the length of the bits (equal to position of most significant bit + 1)', () => {
        let a = bits('10101')
        expect(a.length).toEqual(5)

        a = bits(1023)
        expect(a.length).toEqual(10)

        a = bits(1024)
        expect(a.length).toEqual(11)
    })

    it('should use efficient string conversion to calculate the length', () => {
        let a = bits().set(1_000_000_000)
        expect(a.get(1_000_000_000)).toBe(1)
        expect(a.length).toBe(1_000_000_001)
    })
})

describe('Bits.valueOf()', () => {
    it('should return the BigInt holding the bits', () => {
        let a = bits('10101')
        expect(a.valueOf()).toEqual(21n)

        a = bits(1023)
        expect(a.valueOf()).toEqual(1023n)

        a = bits(1024)
        expect(a.valueOf()).toEqual(1024n)
    })
})

describe('Bits.toString()', () => {
    it('should return the bits as binary string', () => {
        let a = bits('10101')
        expect(a.toString()).toEqual('10101')

        a = bits(1023)
        expect(a.toString()).toEqual('1111111111')

        a = bits(1024)
        expect(a.toString()).toEqual('10000000000')
    })
})
