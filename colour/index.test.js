import { describe, expect, it } from 'vitest'
import colour, { isColour } from './index.mjs'
import { log } from '../ö.mjs'

describe('colour', () => {
    it('should create a new Colour from colour strings', () => {
        let c = colour('#fff')
        expect(c.lightness()).toBeCloseTo(1)
        expect(c.chroma()).toBeCloseTo(0)
        expect(c.toString()).toBe('oklch(100% 0 180 / 1)')

        c = colour('#ffffff')
        expect(c.toString()).toBe('oklch(100% 0 180 / 1)')

        c = colour('#ffffffff')
        expect(c.toString()).toBe('oklch(100% 0 180 / 1)')

        c = colour('#ffffff00')
        expect(c.toString()).toBe('oklch(100% 0 180 / 0)')

        c = colour('rgb(203, 96, 157)')
        expect(c.toString()).toBe('oklch(63.6978% 0.1524 346.9864 / 1)')

        c = colour('hsl(325.79 51% 59%)')
        expect(c.toString()).toBe('oklch(64.0086% 0.1523 346.9539 / 1)')

        c = colour('oklch(63.68% 0.1529 347)')
        expect(c.toString()).toBe('oklch(63.68% 0.1529 347 / 1)')
    })

    it('should create a new Colour from a Colour', () => {
        let r = colour('#fff')
        let c = colour(r)

        expect(isColour(c)).toBe(true)
        expect(c.valueOf()).toStrictEqual(r.valueOf())
        expect(c).not.toBe(r)
    })

    it('should create a new Colour from numeric input', () => {
        let c = colour(0.5, 0.2, 180)

        expect(isColour(c)).toBe(true)
        expect(c.toString()).toBe('oklch(50% 0.2 180 / 1)')
    })

    it('should create a new Colour with default values from no input', () => {
        let c = colour()

        expect(isColour(c)).toBe(true)
        expect(c.toString()).toBe('oklch(70% 0.15 30 / 1)')
    })

    it('should clamp numeric input within ranges', () => {
        let c = colour(10, 20, 361, 10),
            expected = 'oklch(100% 0.4 360 / 1)'

        expect(c.toString()).toBe(expected)

        c = colour(1.1, 0.5, 361, 1.1)
        expect(c.toString()).toBe(expected)

        c = colour(1, 0.4, 360)
        expect(c.toString()).toBe(expected)
    })
})

describe('isColour', () => {
    it('should return true when value is Colour', () => {
        let c = colour()

        expect(isColour(c)).toBe(true)
        expect(isColour({})).toBe(false)
    })
})

describe('...Colour', () => {
    it('should spread to array values', () => {
        let c = [...colour('#000')]
        let expected = [0, 0, 0, 1]

        expect(c).toEqual(expected)
    })
})

describe('Colour channel getters/setters', () => {
    it('should clamp values to expected range', () => {
        let c = colour(),
            r = c.lightness(0.5)

        expect(r.lightness()).toBe(0.5)
        expect(c).not.toBe(r)
    })

    it('should take a function receiving the current value', () => {
        let c = colour(0.5),
            r = c.hue(v => v + 30)

        expect(r.hue()).toBe(60)
    })
})

describe('Colour.toString', () => {
    it('should convert Colour to string', () => {
        let c = colour('#ff0')
        let expected = 'oklch(96.7983% 0.211 109.7692 / 1)'

        expect(c.toString()).toBe(expected)
        expect(`${c}`).toBe(expected)
    })
})

describe('Colour.valueOf', () => {
    it('should return an object with l, c, h, a values', () => {
        let c = colour('#000')
        let expected = {
            lightness: 0,
            chroma: 0,
            hue: 0,
            alpha: 1,
        }
        c.lightness()

        expect(c.valueOf()).toStrictEqual(expected)
    })
})

describe('Colour.complement', () => {
    it('should return new complement Colour', () => {
        let c = colour('#dd5555'),
            expected = c.complement()

        expect(c.toString()).toBe('oklch(62.8929% 0.1708 23.3755 / 1)')
        expect(expected.toString()).toBe('oklch(62.8929% 0.1708 203.3755 / 1)')
    })
})

describe('Colour.invert', () => {
    it('should invert Colour and return new Colour', () => {
        let c = colour('#fff'),
            expected = c.invert()

        expect(c.toString()).toBe('oklch(100% 0 180 / 1)')
        expect(expected.toString()).toBe('oklch(0% 0 0 / 1)')
    })
})

describe('Colour.darken', () => {
    it('should darken Colour by a relative percentage', () => {
        let c = colour(0.5, 0.1, 0, 1)

        expect(c.toString()).toBe('oklch(50% 0.1 0 / 1)')

        expect(c.darken().toString()).toBe('oklch(45% 0.1 0 / 1)')

        expect(c.darken(0).toString()).toBe(c.toString())

        expect(c.darken(0.5).toString()).toBe('oklch(25% 0.1 0 / 1)')

        expect(c.darken(1).toString()).toBe('oklch(0% 0.1 0 / 1)')
    })
})

describe('Colour.lighten', () => {
    it('should lighten Colour by a relative percentage', () => {
        let c = colour(0.5, 0.1, 0, 1)

        expect(c.toString()).toBe('oklch(50% 0.1 0 / 1)')

        expect(c.lighten().toString()).toBe('oklch(55% 0.1 0 / 1)')

        expect(c.lighten(0).toString()).toBe(c.toString())

        expect(c.lighten(0.5).toString()).toBe('oklch(75% 0.1 0 / 1)')

        expect(c.lighten(1).toString()).toBe('oklch(100% 0.1 0 / 1)')
    })
})

describe('Colour.palette', () => {
    it('should produce a palette from colour', () => {
        let c = colour(0.5, 0.3, 0, 1).palette()

        expect(c.length).toBe(11)

        expect(c[0].lightness()).toBe(0.97)
        expect(c[0].chroma()).toBeCloseTo(0.1)

        expect(c[5].lightness()).toBe(0.5)
        expect(c[5].chroma()).toBe(0.3)

        expect(c[10].lightness()).toBe(0.03)
        expect(c[10].chroma()).toBeCloseTo(0.1)
    })
})

describe('Colour.gradient', () => {
    it('should return valid css gradient strings', () => {
        let c = colour('#333').gradient(['#666', '#888'])
        
        expect(c.toString()).toBe(
            'linear-gradient(in oklab 0deg, oklch(32.1093% 0 180 / 1), oklch(51.0278% 0 188.1301 / 1), oklch(62.6754% 0 180 / 1))',
        )

        c = colour('#333').gradient(['#666', '#888'], 'radial')
        
        expect(c.toString()).toBe(
            'radial-gradient(in oklab farthest-corner at 50% 50%, oklch(32.1093% 0 180 / 1), oklch(51.0278% 0 188.1301 / 1), oklch(62.6754% 0 180 / 1))',
        )
    })
})

describe('Colour.steps', () => {
    it('should return an array of Colours between current colour and "colour"', () => {
        let c = colour('#fff').steps(colour('#000'))

        expect(c.length).toBe(3)
        expect(c[1].toString()).toBe('oklch(50% 0 180 / 1)')

        c = colour('#fff').steps(colour('#000'), 9)

        expect(c.length).toBe(11)
        expect(c[5].toString()).toBe('oklch(50% 0 180 / 1)')
    })

    it('should be able to take a cssString as first argument', () => {
        let c = colour('#fff').steps('#000')

        expect(c.length).toBe(3)
        expect(c[1].toString()).toBe('oklch(50% 0 180 / 1)')

        c = colour('#fff').steps('#000', 9)

        expect(c.length).toBe(11)
        expect(c[5].toString()).toBe('oklch(50% 0 180 / 1)')
    })
})

describe('Colour.mix', () => {
    it('should return a Color between current colour and "colour"', () => {
        let c = colour('#fff').mix(colour('#000'))

        expect(c.toString()).toBe('oklch(50% 0 180 / 1)')

        c = colour(0.25, 0.1, 0).mix(colour(0.75, 0.2, 180), 0.5, 'oklch')

        expect(c.toString()).toBe('oklch(50% 0.15 90 / 1)')

        c = colour(0.25, 0.1, 0).mix(colour(0.75, 0.2, 180), 0.5, 'oklab')

        expect(c.toString()).toBe('oklch(50% 0.05 180 / 1)')
    })
})

describe('Colour.getInterpolator', () => {
    it('should return function returning a Color between current colour and "colour"', () => {
        let c = colour('#fff').getInterpolator(colour('#000'))

        expect(c(0).toString()).toBe(colour('#fff').toString())
        expect(c(0.5).toString()).toBe('oklch(50% 0 180 / 1)')
        expect(c(1).toString()).toBe(colour('#000').toString())
    })
})
