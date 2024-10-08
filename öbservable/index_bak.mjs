import { isnt, isFunc, clone, isEqual } from '../ö.mjs'

const isobservable = Symbol('observable')
const extendable = Symbol('extendable')
const primitive = Symbol('primitive') // a little like a vue ref
const currentObservers = []

let currentObserver = null

const addAsCurrent = (observer) => {
    if (currentObserver) currentObservers.push(currentObserver)
    currentObserver = observer
}

const removeAsCurrent = () => (currentObserver = currentObservers.pop())

const makeObservable = (v, isExtendable, isPrimitive) => {
    let observers = new Set()
    let p = new Proxy(v, {
        get: (obj, key, receiver) => {
            // add current observer when getter is called
            if (currentObserver) observers.add(currentObserver)

            // Intercept key 'observe' and assume function call. Relay to observe()
            if (key === 'observe')
                return (callback, deep = false) =>
                    observe(receiver, callback, deep)

            return Reflect.get(obj, key)
        },
        set: (obj, key, value) => {
            if (obj[key] !== value) {
                // if new prop, and extendable, make observable
                if (isnt(obj[key]) && isExtendable)
                    value = observable(value, true, isExtendable, false)

                Reflect.set(obj, key, value)

                // check and notify observers
                observers.forEach((o) => {
                    if (o.stopped) observers.delete(o)
                    else if (!o.paused) o.update(key)
                })
            }

            return true // to avoid a type error
        },
    })

    if (isPrimitive) p[primitive] = true
    if (isExtendable) p[extendable] = true
    p[isobservable] = true

    return p
}

/**
 * @typedef Observable
 * @type {Object}
 * @property {*} [value]
 * @property {function} observe
 */

/**
 * observable
 * @param {*} v
 * @param {boolean} [deep]
 * @param {boolean} [extendable]
 * @param {boolean} [wrapPrimitive]
 * @returns {Observable}
 */

export const observable = (
    v,
    deep = true,
    extendable = true,
    wrapPrimitive = true,
) => {
    // if object, make observables recursively
    if (v !== null && typeof v === 'object') {
        if (deep)
            for (const [key, val] of Object.entries(v))
                v[key] = observable(val, deep, extendable, false)

        return makeObservable(v, extendable)
    }

    // Handle primitive values only if top level call, wrap in object for proxy to work
    if (wrapPrimitive) return makeObservable({ value: v }, false, true)

    // returns value if primitive in recursive call
    return v
}

/**
 * isObservable
 * @param {*} obj
 * @returns {boolean}
 */

export const isObservable = (obj) => !!obj[isobservable]

/**
 * observe
 * @param {(function | Observable)} getter
 * @param {function} callback
 * @param {boolean} [deep]
 * @returns {{
 *	update: Function,
 *	pause: Function,
 *	unpause: Function,
 *	stop: Function,
 *}}
 */

export const observe = (getter, callback, deep = false) => {
    const getValue = () => {
        addAsCurrent(o)
        let v = isFunc(getter) ? getter() : getter
        // If primitive, unwrap, else copy value to touch the getter in proxy and strip the proxy
        v = v[primitive] ? v.value : clone(v, deep)
        removeAsCurrent()

        return v
    }

    // observer with update method (called by proxy setter)
    let o = {
        update(key) {
            ;[o.value, o.prevValue] = [getValue(), o.value]
            if (!isEqual(o.value, o.prevValue))
                callback(o.value, o.prevValue, key, o)
        },
        pause() {
            o.paused = true
        },
        unpause() {
            delete o.paused
        },
        stop() {
            o.stopped = true
        },
    }

    // Call update on init
    o.update(null)

    return o
}
