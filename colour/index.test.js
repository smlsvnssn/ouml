import { describe, expect, it } from 'vitest'
import * as clr from './index.mjs'

describe('clr.toHsla', () => {
    it('should return a { type: "hsl", h, s, l, a } obj from hex, rgb or hsl stings', () => {
        let result = clr.toHsla('#666')
        expect(result).toStrictEqual({
            type: 'hsl',
            alpha: 1,
            h: 0,
            l: 40,
            s: 0,
        })

        result = clr.toHsla('rgba(255,255,255,1)')
        expect(result).toStrictEqual({
            type: 'hsl',
            alpha: 1,
            h: 0,
            l: 100,
            s: 0,
        })

        result = clr.toHsla('hsl(60, 50%, 50%)')
        expect(result).toStrictEqual({
            type: 'hsl',
            alpha: 1,
            h: 60,
            l: 50,
            s: 50,
        })

        result = clr.toHsla('hsl(60, 50%, 50%)', true)
        expect(result).toBe('hsla(60, 50%, 50%, 1)')
    })
})

describe('clr.hsla', () => {
    it('should return a hsla string from { h, s, l, a } values', () => {
        let result = clr.hsla(clr.toHsla('#666'))
        expect(result).toBe('hsla(0, 0%, 40%, 1)')

        result = clr.hsla(0, 0, 40)
        expect(result).toBe('hsla(0, 0%, 40%, 1)')

        result = clr.hsla({ h: 0, s: 0, l: 40 })
        expect(result).toBe('hsla(0, 0%, 40%, 1)')
    })
})
