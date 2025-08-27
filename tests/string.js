import { describe, expect, it } from 'vitest'
import * as ö from '../ouml.mjs'

describe('ö.prettyNumber', () => {
    it('should return nicely formatted numbers', () => {
        let result = ö.prettyNumber(123456.789)
        expect(result).toBe('123 456,79')

        result = ö.prettyNumber(123456.789, 'en-UK')
        expect(result).toBe('123,456.79')

        result = ö.prettyNumber(123456.789, 0)
        expect(result).toBe('123 457')
    })
})

describe('ö.wrapFirstWords', () => {
    it('should return first words wrapped', () => {
        let result = ö.wrapFirstWords('jag älskar hjortron utan kärnor', 3)

        expect(result).toBe('<span>jag älskar hjortron</span> utan kärnor')

        result = ö.wrapFirstWords('jag älskar: hjortron utan kärnor', 3)

        expect(result).toBe('<span>jag älskar:</span> hjortron utan kärnor')

        result = ö.wrapFirstWords(
            'jag älskar hjortron utan kärnor',
            4,
            '<a>',
            '</a>',
        )

        expect(result).toBe('<a>jag älskar hjortron utan</a> kärnor')

        result = ö.wrapFirstWords(
            'jag älskar hjortron utan kärnor',
            8,
            '<a>',
            '</a>',
        )

        expect(result).toBe('<a>jag älskar hjortron utan kärnor</a>')
    })
})

describe('ö.toCamelCase', () => {
    it('should return camelCasedStrings', () => {
        expect(ö.toCamelCase('Snygg hatt!')).toBe('SnyggHatt!')

        expect(ö.toCamelCase('my_var')).toBe('myVar')
    })

    it('should leave css vars as is', () => {
        expect(ö.toCamelCase('--my_var')).toBe('--my_var')
    })
})

describe('ö.toKebabCase', () => {
    it('should return camelCasedStrings', () => {
        expect(ö.toKebabCase('Snygg hatt!')).toBe('snygg-hatt!')

        expect(ö.toKebabCase('myVar')).toBe('my-var')
    })

    it('should leave css vars as is', () => {
        expect(ö.toKebabCase('--myVar')).toBe('--myVar')
    })
})

describe('ö.capitalise', () => {
    it('should capitalise first letter', () => {
        expect(ö.capitalise('snygg hatt!')).toBe('Snygg hatt!')
        expect(ö.capitalise('a')).toBe('A')
    })
})

describe('ö.randomChars', () => {
    it('should return a random string of length numChars', () => {
        expect(ö.randomChars(10)).toHaveLength(10)
        expect(ö.randomChars(100)).toHaveLength(100)
    })
})

describe('ö.charRange', () => {
    let alphabet = 'abcdefghijklmnopqrstuvwxyz'
    it('should return a range of characters given string input', () => {
        expect(ö.charRange('a', 'z')).toHaveLength(26)
        expect(ö.charRange('a', 'z')).toEqual(alphabet)
        expect(ö.charRange('a-z')).toEqual(alphabet)
        expect(ö.charRange('z-a')).toEqual(
            alphabet.split('').reverse().join(''),
        )

        expect(ö.charRange('0-9')).toEqual('0123456789')
    })

    it('should take numbers as well', () => {
        expect(ö.charRange(0, 10)).toHaveLength(11)
        expect(ö.charRange(97, 97 + 25)).toEqual(alphabet)
    })

    it('should handle single argument nicely', () => {
        expect(ö.charRange('a')).toBe('a')
        expect(ö.charRange(97)).toBe('a')
    })
})

describe('ö.stripTags', () => {
    it('should return a string without html', () => {
        let s = 'a <a href="#">link</a>'
        expect(ö.stripTags(s)).toHaveLength(6)
        expect(ö.stripTags(s)).toBe('a link')

        expect(ö.stripTags('<a>')).toBe('')
        expect(ö.stripTags('<>')).not.toBe('')
        expect(
            ö.stripTags(
                `<a href="${'javascript:eval("function(){ return evil }")'}>not evil</a>`,
            ),
        ).toBe('not evil')
    })
})

describe('ö.when', () => {
    it('should return whenTrue when bool = true', () => {
        let s = 'a <a href="#">link</a>'
        expect(ö.when(true, 'Hello')).toBe('Hello')
        expect(ö.when(false, 'Hello')).toBe('')
        expect(ö.when(false, 'Hello', 'Bye')).toBe('Bye')
    })
})
