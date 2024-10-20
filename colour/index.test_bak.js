import { describe, expect, it } from 'vitest'
import Colour from './index.mjs'
import { log, easeIn } from '../ö.mjs'

// log(new Colour('#f00').mix(Colour.of('#0f0')).toString())
// log(new Colour('#f00').mix(Colour.of('#00f')).toString())
// log(new Colour('#a75517').mix(Colour.of('#008568')).toString())
// log(
//     Colour.of('#a7551788')
//         .steps(Colour.of('#008568'), 1, undefined, easeIn)
//         .map(v => v.toString()),
// )

// log(Colour.of('#f00').invert().toString())

// log(Colour.of().toString())
// log(Colour.of().darken(0.5).toString())
// log(Colour.of().lighten(0.5).toString())
// log(Colour.of('kuken').darken(0))

// log(
//     Colour.of('#a7551788')
//         .getInterpolator(Colour.of('#008568'), undefined, easeIn)(0.5)
//         .toString(),
// )

// log(`${Colour.of('#008568')}`)

log( Colour.of('#008568') )

describe('Colour.of', () => {
    it('should create a new Colour from color strings', () => {
        let c = Colour.of('#fff')
        expect(c.lightness()).toBeCloseTo(1)
        expect(c.chroma()).toBeCloseTo(0)
        expect(c.toString()).toBe('oklch(100% 0 180 / 1)')

        c = Colour.of('#ffffff')
        expect(c.toString()).toBe('oklch(100% 0 180 / 1)')

        c = Colour.of('#ffffffff')
        expect(c.toString()).toBe('oklch(100% 0 180 / 1)')

        c = Colour.of('#ffffff00')
        expect(c.toString()).toBe('oklch(100% 0 180 / 0)')
    })

    it('should create a new Colour from a Colour', () => {
        let r = Colour.of('#fff')
        let c = Colour.of(r)

        expect(c).toBeInstanceOf(Colour)
        expect(c).toStrictEqual(r)
        expect(c).not.toBe(r)

        
    })

    it('should create a new Colour from numeric input', () => {
        let c = Colour.of(0.5, 0.2, 180)

        expect(c).toBeInstanceOf(Colour)
        expect(c.toString()).toBe('oklch(50% 0.2 180 / 1)')
    })

    it('should create a new Colour with default values from no input', () => {
        let c = Colour.of()

        expect(c).toBeInstanceOf(Colour)
        expect(c.toString()).toBe('oklch(70% 0.15 30 / 1)')
    })

    it('should clamp numeric input within ranges', () => {
        let c = Colour.of(10, 20, 361, 10),
            expected = 'oklch(100% 0.4 360 / 1)'

        expect(c.toString()).toBe(expected)

        c = Colour.of(1.1, 0.5, 361, 1.1)
        expect(c.toString()).toBe(expected)

        c = Colour.of(1, 0.4, 360)
        expect(c.toString()).toBe(expected)
    })
})

describe('...Colour', () => {
    it('should spread to array values', () => {
        let c = [...Colour.of('#000')]
        let expected = [0, 0, 0, 1]

        expect(c).toEqual(expected)
    })
})

describe('Colour channel getters/setters', () => {
    it('should clamp values to expected range', () => {
        let c = Colour.of(),
            r = c.lightness(0.5)

        expect(r.lightness()).toBe(0.5)
        expect(c).not.toBe(r)
    })
})

describe('Colour.toString', () => {
    it('should convert colour to string', () => {
        let c = Colour.of('#ff0')
        let expected = 'oklch(96.7983% 0.211 109.7692 / 1)'

        expect(c.toString()).toBe(expected)
        expect(`${c}`).toBe(expected)
    })
})

describe('Colour.invert', () => {
    it('should invert colour and return new colour', () => {
        let c = Colour.of('#fff'),
            inverted = c.invert()

        expect(c.toString()).toBe('oklch(100% 0 180 / 1)')
        expect(inverted.toString()).toBe('oklch(0% 0 0 / 1)')
    })
})
