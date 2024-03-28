/*
TypelessScript™
*/

import * as ö from "../ö.mjs"

const lookupMethod = (key, val, isThrowing) => {
    // check for methods on val
    if (ö.isFunc(val[key])) return (...args) => val[key](...args)

    // check for props on val
    if (Object.hasOwn(val, key)) return () => val[key]

    // check for methods on ö
    if (ö.isFunc(ö[key])) return (...args) => ö[key](val, ...args)

    const keys = key.split("_")

    // check for methods on globalThis, but only if not compound key
    if (keys.length === 1 && ö.isFunc(globalThis[key]))
        return (...args) => globalThis[key](val, ...args)

    // check for methods on global objects
    if (keys.length === 2 && ö.isFunc(globalThis[keys.at(0)]?.[keys.at(1)]))
        return (...args) => globalThis[keys.at(0)][keys.at(1)](val, ...args)

    const errorMsg = `No method or property found for ${key} on type ${
        val.constructor.name
    }, and no method for ${keys.join(".")} found in ö or in global scope.`

    if (isThrowing) throw new Error(errorMsg)
    ö.warn(`${errorMsg} Skipping.`)

    return () => val
}

const peek = (i, key, val) =>
    ö.log(`
Peeking into chain after step ${i}, running ${key}():
Value: ${JSON.stringify(val, null, 2)}
Type:  ${val.constructor.name}
`)

const warn = (i, key, error, isThrowing) => {
    const errorMsg = `Chain failed at step ${i} for method ${key}.`
    if (isThrowing) throw new Error(errorMsg + "\n" + error)
    ö.warn(`${errorMsg} Skipping:`, error)
}

const createProxy = (o, isAsync, isThrowing) => {
    const q = []

    const caseRunQ =
        isAsync ?
            async () => {
                for (const [i, [key, f]] of q.entries()) {
                    if (key === "returnIf" && (await f())) break
                    if (key === "peek") {
                        if (i > 0) peek(i, q[i - 1][0], o.val)
                        continue
                    }
                    try {
                        await f(o.val)
                    } catch (error) {
                        warn(i, key, error, isThrowing)
                    }
                }
                return o.val
            }
        :   () => {
                for (const [i, [key, f]] of q.entries()) {
                    if (key === "returnIf" && f()) break
                    if (key === "peek") {
                        if (i > 0) peek(i, q[i - 1][0], o.val)
                        continue
                    }
                    try {
                        f(o.val)
                    } catch (error) {
                        warn(i, key, error, isThrowing)
                    }
                }
                return o.val
            }

    const caseReturnIf = (key) => (f) => {
        q.push([key, isAsync ? async () => await f(o.val) : () => f(o.val)])
        return p
    }

    const caseFunction = (key) => (f) => {
        q.push([
            key,
            isAsync ?
                async () => (o.val = await f(o.val))
            :   () => (o.val = f(o.val)),
        ])
        return p
    }

    const casePeek = (key) => () => {
        q.push([key])
        return p
    }

    // prettier-ignore
    const caseDefault = (key) => (...args) => {
        q.push([
            key,
            isAsync ?
            async () => (o.val = await lookupMethod(key, o.val, isThrowing)(...args))
            :     () => (o.val = lookupMethod(key, o.val, isThrowing)(...args)),
        ])
        return p
    }

    const p = new Proxy(o, {
        // prettier-ignore
        get: (_, key) =>
            key === "value" ?       caseRunQ()
            : key === "return" ?    caseRunQ
            : key === "returnIf" ?  caseReturnIf(key)
            : key === "peek" ?      casePeek(key)
            : key === "f" ?         caseFunction(key)
            :                       caseDefault(key),
    })
    return p
}

export const chain = (val, isThrowing = false, isAsync = false) =>
    createProxy({ val: ö.clone(val) }, isAsync, isThrowing)

export const chainAsync = (val, isThrowing = false) =>
    createProxy({ val: ö.clone(val) }, true, isThrowing)
