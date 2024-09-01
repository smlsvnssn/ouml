import { describe, expect, it } from 'vitest'
import * as ö from '../ö.mjs'

describe('ö.toHsla', () => {
    it('should return a { h, s, l, a } obj from hex, rgb or hsl stings', () => {
        let result = ö.toHsla('#666')
        expect(result).toStrictEqual({
            a: 1,
            h: 0,
            l: 40,
            s: 0,
        })

        result = ö.toHsla('rgba(255,255,255,1)')
        expect(result).toStrictEqual({
            a: 1,
            h: 0,
            l: 100,
            s: 0,
        })

        result = ö.toHsla('hsl(60, 50%, 50%)')
        expect(result).toStrictEqual({
            a: 1,
            h: 60,
            l: 50,
            s: 50,
        })

        result = ö.toHsla('hsl(60, 50%, 50%)', true)
        expect(result).toBe('hsla(60, 50%, 50%, 1)')
    })
})

describe('ö.hsla', () => {
    it('should return a hsla string from { h, s, l, a } values', () => {
        let result = ö.hsla(ö.toHsla('#666'))
        expect(result).toBe('hsla(0, 0%, 40%, 1)')
        
        result = ö.hsla(0, 0, 40)
        expect(result).toBe('hsla(0, 0%, 40%, 1)')

        result = ö.hsla({h:0, s:0,l:40})
        expect(result).toBe('hsla(0, 0%, 40%, 1)')

    })
})
