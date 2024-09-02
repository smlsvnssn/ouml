import { describe, expect, it } from 'vitest'
import * as ö from '../ö.mjs'
import { observable, observe, isObservable } from './index.mjs'

let result
const setResult = x => (result = x)

describe('observable', () => {
    it('should wrap primitives in an object, but leave objects as is', () => {
        let primitive = observable(0)
        let array = observable(['test'])
        let object = observable({ test: 'Yes, test' })

        expect(primitive).toMatchObject({ value: 0 })
        expect(array).toContain('test')
        expect(object).toMatchObject({ test: 'Yes, test' })
    })

    it('should return an observable object', () => {
        const o = observable({ a: { b: 1 } })

        expect(o).toSatisfy(isObservable)
    })

    it('should create observables for nested objects', () => {
        const o = observable({ a: { b: 1 } })

        expect(o.a).toSatisfy(isObservable)
    })

    it('should create observables for new properties', () => {
        const o = observable({ a: { b: 1 } })

        o.c = {}

        expect(o.c).toSatisfy(isObservable)
    })
})

describe('observable object', () => {
    it('should be possible to call "observe" on the object', () => {
        let x = observable('foo')

        x.observe(setResult)

        x.value = 'bar'

        expect(result).toBe('bar')
    })
})

describe('observe', () => {
    it('should call observers when an observed value changes', async () => {
        let x = observable('foo')
        observe(x, setResult)
        x.value = 'bar'

        expect(result).toBe('bar')
    })

    it('should call callback when a wrapped primitive is read in the getter', () => {
        let o = observable(0)
        observe(() => `The value is ${o.value}`, setResult)

        expect(result).toBe('The value is 0')
    })

    it('should call callback with an unwrapped primitive if getter is an observable', () => {
        let o = observable(0)
        observe(o, v => (result = `The value is ${v}`))

        expect(result).toBe('The value is 0')
    })

    it('should call callback with arguments value, prevValue, updatedKey, observer', () => {
        let o = observable({ a: 0 })
        let observer = observe(
            o,
            (value, prevValue, updatedKey, observer) =>
                (result = { value, prevValue, updatedKey, observer }),
        )

        o.a = 1

        expect(result.value.a).toBe(1)
        expect(result.prevValue.a).toBe(0)
        expect(result.updatedKey).toBe('a')
        expect(result.observer).toBe(observer)
    })

    it('should provide an accurate updatedKey', () => {
        let bigAssObject = {
            stuff: 0,
            that: 1,
            we: 2,
            childObject: { really: 3, need: 4 },
        }
        let bigAssObservable = observable(bigAssObject)
        observe(
            () => {
                let {
                    stuff,
                    that,
                    we,
                    childObject: { really, need },
                } = bigAssObservable
                return { stuff, that, we, really, need }
            },
            (value, prevValue, updatedKey, observer) =>
                (result = { value, prevValue, updatedKey, observer }),
        )

        bigAssObservable.childObject.really = 'Yes, really'

        expect(result.updatedKey).toBe('really')
        expect(result.value.really).toBe('Yes, really')
    })

    it('should trigger on deep changes', () => {
        let deep = observable(
            {
                a: { b: { c: { d: "What's the purpose of it all?" } } },
            },
        )
        observe(
            deep,
            (value, prevValue, updatedKey, observer) =>
                (result = { value, prevValue, updatedKey, observer })
        )

        deep.a.b.c.d = 'Deep stuff'
		
        expect(deep.a.b.c).toSatisfy(isObservable)
        expect(result.updatedKey).toBe('d')
        expect(result.value.a.b.c.d).toBe('Deep stuff')
    })
})

describe('isObservable', () => {
    it('should return true if value is an observable', () => {
        const o = observable({ a: { b: 1 } })

        expect(o).toSatisfy(isObservable)
        expect(o.a).toSatisfy(isObservable)

        expect([]).not.toSatisfy(isObservable)
    })
})


// const cb = (...v) => ö.log('callback: ', ...v)
// primitive.observe(cb)
// array.observe(cb)
// object.observe(cb)

// primitive.value = 2

// primitive.value = 3

// array.push(5)

// object.test2 = 'Also test'

// ö.log(isObservable(array))

// const thisGuy = observable({ name: 'Guy', surname: 'This' })

// observe(thisGuy, (val, oldVal, changedProp) =>
//     ö.log(`${changedProp} has changed`),
// )

// thisGuy.observe(v => ö.log(`Name: ${v.name}  Surname: ${v.surname}`))

// thisGuy.surname = 'Fawkes'
