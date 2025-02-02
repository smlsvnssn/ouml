import { isnt, isFunc, clone, isEqual } from '../ö.mjs'

const isobservable = Symbol('observable')
const primitive = Symbol('primitive') // a little like a vue ref

let queue = []
let current = null

const add = observer => {
    if (current) queue.push(current)
    current = observer
}

const remove = () => (current = queue.pop())

const notifyObservers = (observers, key) => {
    observers.forEach(o => {
        if (o.stopped) observers.delete(o)
        else if (!o.paused) o.update(key)
    })
}

const makeObservable = (v, isPrimitive) => {
    let observers = new Set()
    let p = new Proxy(v, {
        get: (obj, key, receiver) => {
            // add current observer when getter is called
            if (current) observers.add(current)

            // Intercept key 'observe' and assume function call. Relay to observe()
            if (key === 'observe')
                return callback => observe(receiver, callback)

            return Reflect.get(obj, key)
        },
        set: (obj, key, value) => {
            if (obj[key] !== value) {
                // if new prop, make observable
                if (isnt(obj[key])) value = observable(value, false)

                Reflect.set(obj, key, value)
                notifyObservers(observers, key)
            }
            return true // to avoid a type error
        },
        deleteProperty: (obj, key) => {
            if (Object.hasOwn(obj, key)) {
                Reflect.deleteProperty(obj, key)
                notifyObservers(observers, key) 
            }
            return true // to avoid a type error
        },
    })

    if (isPrimitive) p[primitive] = true
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
 * @param {boolean} [wrapPrimitive]
 * @returns {Observable}
 */

export const observable = (v, wrapPrimitive = true) => {
    // if object, make observables recursively
    if (v !== null && typeof v === 'object') {
        for (const [key, val] of Object.entries(v))
            v[key] = observable(val, false)

        return makeObservable(v)
    }

    // Handle primitive values only if top level call, wrap in object for proxy to work
    if (wrapPrimitive) return makeObservable({ value: v }, true)

    // returns value if primitive in recursive call
    return v
}

/**
 * isObservable
 * @param {*} obj
 * @returns {boolean}
 */

export const isObservable = obj => !!obj[isobservable]

/**
 * observe
 * @param {(function | Observable)} getter
 * @param {function} callback
 * @returns {{
 *	update: Function,
 *	pause: Function,
 *	unpause: Function,
 *	stop: Function,
 *}}
 */

export const observe = (getter, callback) => {
    const getValue = () => {
        add(o)
        let v = isFunc(getter) ? getter() : getter
        // If primitive, unwrap, else copy value to touch the getter in proxy and strip the proxy
        v = v[primitive] ? v.value : clone(v)
        remove()

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
