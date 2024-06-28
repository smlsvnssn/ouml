/*
TypelessScript™
*/

import * as ö from '../ö.mjs'

const lookup = (key, v, isThrowing) => {
    // check for methods on v
    if (ö.isFunc(v[key])) return (...args) => v[key](...args)

    // check for props on v
    if (Object.hasOwn(v, key)) return () => v[key]

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

    return () => v
}

const peek = (i, key, v) =>
    ö.log(`
Peeking into chain after step ${i}, running ${key}():
Value: ${JSON.stringify(v, null, 2)}
Type:  ${v.constructor.name}
`)

const warn = (i, key, error, isThrowing) => {
    let errorMsg = `Chain failed at step ${i} for method ${key}.`

    if (isThrowing) throw new Error(errorMsg + '\n' + error)

    ö.warn(`${errorMsg} Skipping:`, error)
}

const createProxy = (initial, isAsync, isThrowing) => {
    let q = []

    const caseRunQ =
        isAsync ?
            async () => {
                let v = initial

                for (let [i, { key, f }] of q.entries()) {
                    if (key === 'returnIf' && (await f(v))) break

                    if (key === 'peek') {
                        if (i > 0) peek(i, q[i - 1].key, v)
                        continue
                    }

                    try {
                        v = await f(v)
                    } catch (error) {
                        warn(i, key, error, isThrowing)
                    }
                }

                return v
            }
        :   () => {
                let v = initial

                for (let [i, { key, f }] of q.entries()) {
                    if (key === 'returnIf' && f(v)) break

                    if (key === 'peek') {
                        if (i > 0) peek(i, q[i - 1].key, v)
                        continue
                    }

                    try {
                        v = f(v)
                    } catch (error) {
                        warn(i, key, error, isThrowing)
                    }
                }

                return v
            }

    const caseReturnIf = (key) => (f) => {
        q.push({
            key,
            f: isAsync ? async (v) => await f(v) : (v) => f(v),
        })

        return p
    }

    const caseFunction = (f) => {
        q.push({
            key: f.name || 'anonymous',
            f: isAsync ? async (v) => await f(v) : (v) => f(v),
        })

        return p
    }

    const casePeek = (key) => () => {
        q.push({ key })

        return p
    }

    // prettier-ignore
    const caseDefault = (key) => (...args) => {
        q.push({
            key,
            f: isAsync ?
            async (v) => await lookup(key, v, isThrowing)(...args)
            :     (v) => lookup(key, v, isThrowing)(...args),
    })

        return p
    }

    let p = new Proxy(() => {}, {
        // prettier-ignore
        get: (_, key) =>
             key === "value" ?      caseRunQ()
           : key === "return" ?     caseRunQ
           : key === "returnIf" ?   caseReturnIf(key)
           : key === "peek" ?       casePeek(key)
           : key === "f" ?          caseFunction
           :                        caseDefault(key),

        apply: (_, __, args) =>
            args.length ? caseFunction(...args) : caseRunQ(),
    })

    return p
}

export const chain = (v, isThrowing = false, isAsync = false) =>
    createProxy(ö.clone(v), isAsync, isThrowing)

export const chainAsync = (v, isThrowing = false) =>
    createProxy(ö.clone(v), true, isThrowing)
