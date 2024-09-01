import { describe, expect, it } from 'vitest'
import * as ö from '../ö.mjs'

describe('ö.getLocal, ö.setLocal', () => {
    it('gets/sets objects in localStorage', () => {
        let key = 'test'
        let testObj = { a: 1, b: 2 }

        expect(ö.getLocal(key)).toBe(null)
        expect(ö.setLocal(key, testObj)).toBe(testObj)

        expect(ö.getLocal(key)).not.toBe(testObj)
        expect(ö.getLocal(key)).toEqual(testObj)
    })
})

describe('ö.getCss, ö.setCss', () => {
    it('gets/sets objects in localStorage', () => {
        let key = '--test'
        let testValue = '1px'

        expect(ö.getCss(key)).toBe('')
        expect(ö.setCss(key, testValue)).toBe(testValue)

        expect(ö.getCss(key)).toEqual(testValue)
    })
})

describe('ö.createElement', () => {
    it('creates an element from html string', () => {
        let element = ö.createElement('<div data-test="test">')

        expect(element).toBeInstanceOf(HTMLDivElement)
        expect(element.dataset.test).toBe('test')
    })

    it('creates an svg element from html string if svg = true', () => {
        let element = ö.createElement('<path data-test="test">', true)

        expect(element).toBeInstanceOf(SVGElement)
        expect(element.dataset.test).toBe('test')
    })
})

describe('ö.parseDOMStringMap', () => {
    it('parses a parseDOMStringMap to an object', () => {
        let element = ö.createElement('<div data-test="test">')
        let data = ö.parseDOMStringMap(element.dataset)

        expect(data).toBeInstanceOf(Object)
        expect(data).toEqual({test: 'test'})
    })
})

describe('ö.deepest', () => {
    it('finds deepest `Element` in `element`', () => {
        let parent = ö.createElement(
            '<div><ul><li></li><li><a>Hello</a></li></ul></div>',
        )
        let child = ö.deepest(parent)

        expect(child).toBeInstanceOf(HTMLAnchorElement)
        expect(child.innerHTML).toEqual('Hello')
	})
	
	it('finds deepest `Element` in `element` by selector', () => {
        let parent = ö.createElement(
            '<div><ul><li>Bye</li><li><a>Hello</a></li></ul></div>',
        )
        let child = ö.deepest(parent, 'li')

        expect(child).toBeInstanceOf(HTMLLIElement)
        expect(child.innerHTML).toEqual('Bye')
    })
})

it('translates a string into rövarspråket', () => {
    let str = 'Hej värld!'
    let result = ö.rorövovarorsospoproråkoketot(str)

	expect(result).toBe('Hohejoj vovärorloldod!')
	
    expect(ö.rorövovarorsospoproråkoketot.name).toBe(
        ö.rorövovarorsospoproråkoketot('rövarspråket'),
    )
})
