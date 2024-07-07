/*
TypelessScript™
*/
// @ts-check
import * as ö from '../ö.mjs'

const lookup = (key, v, isThrowing) => {
    // check for methods on v
    if (ö.isFunc(v[key])) return (...args) => v[key](...args)

    // check for props on v
    if (Object.hasOwn(v, key))
        return (newVal) => (ö.is(newVal) ? ((v[key] = newVal), newVal) : v[key])
    

    // check for methods on ö
    if (ö.isFunc(ö[key])) return (...args) => ö[key](v, ...args)

    let keys = key.split('_')

    // check for methods on globalThis, but only if not compound key
    if (keys.length == 1 && ö.isFunc(globalThis[key]))
        return (...args) => globalThis[key](v, ...args)

    // check for methods on global objects
    if (keys.length == 2 && ö.isFunc(globalThis[keys.at(0)]?.[keys.at(1)]))
        return (...args) => globalThis[keys.at(0)][keys.at(1)](v, ...args)

    let errorMsg = `No method or property found for ${key} on type ${
        v.constructor.name
    }, and no method for ${keys.join('.')} found in ö or in global scope.`

    if (isThrowing) throw new Error(errorMsg)

    ö.warn(`${errorMsg} Skipping.`)

    // on error, just return value
    return () => v
}

const peek = (i, key, v) => {
    if (i > 0)
        ö.log(`
Peeking into chain after step ${i}, running ${key}():
Value: ${JSON.stringify(v, null, 2)}
Type:  ${v.constructor.name}
`)
}

const warn = (i, key, error, isThrowing) => {
    let errorMsg = `Chain failed at step ${i} for method ${key}.`

    if (isThrowing) throw new Error(errorMsg + '\n' + error)

    ö.warn(`${errorMsg} Skipping:`, error)
}

/**
 * Chain
 * @param {*} initial 
 * @param {boolean} [isThrowing] 
 * @param {boolean} [isAsync] 
 * @returns {Proxy}
 */

export const chain = (initial, isThrowing = false, isAsync = false) => {
    let v = ö.clone(initial)
    let q = []

    const queue = (key, f) => {
        q.push({ key, f })

        return p
    }

    const caseRunQueue =
        isAsync ?
            async () => {
                for (let [i, { key, f }] of q.entries()) {
                    try {
                        if (key === 'returnIf') {
                            if (await f(v)) break
                            else continue
                        }

                        if (key === 'peek') {
                            peek(i, q[i - 1].key, v)
                            continue
                        }

                        v = await f(v)
                    } catch (error) {
                        warn(i, key, error, isThrowing)
                    }
                }

                return v
            }
        :   () => {
                for (let [i, { key, f }] of q.entries()) {
                    try {
                        if (key === 'returnIf') {
                            if (f(v)) break
                            else continue
                        }

                        if (key === 'peek') {
                            peek(i, q[i - 1].key, v)
                            continue
                        }

                        v = f(v)
                    } catch (error) {
                        warn(i, key, error, isThrowing)
                    }
                }

                return v
            }

    const caseInternal = (key) => (f) => queue(key, f)

    const caseFunction = (f) => queue(f.name || 'anonymous', f)

    const caseDefault =
        (key) =>
        (...args) =>
            queue(key, (v) => lookup(key, v, isThrowing)(...args))

    let p = new Proxy(() => {}, {
        // prettier-ignore
        get: (_, key) =>
             key === "returnIf" || key === "peek" ? caseInternal(key)
           : key === "value" ?                      caseRunQueue()
           : key === "return" ?                     caseRunQueue
           : key === "f" ?                          caseFunction
           :                                        caseDefault(key),

        apply: (_, __, args) =>
            args.length ? caseFunction(...args) : caseRunQueue(),
    })

    return p
}

/**
 * ChainAsync
 * @param {*} v 
 * @param {boolean} [isThrowing] 
 * @returns {Proxy}
 */

export const chainAsync = (v, isThrowing = false) => chain(v, isThrowing, true)
