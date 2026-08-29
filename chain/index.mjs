/*
TypelessScript™
*/

import * as ö from '../ouml.mjs'

const getParent = (v, path) =>
    path.slice(0, -1).reduce((acc, key) => acc?.[key], v)

const lookup = (path, v, isThrowing) => {
    let parent = getParent(v, path)
    let key = path.at(-1)

    // methods in v?
    if (ö.isFunc(parent?.[key])) return (...args) => parent[key](...args)

    // props in v? (get/set)
    if (parent && Object.hasOwn(parent, key))
        return val => (ö.is(val) ? ((parent[key] = val), val) : parent[key])

    // methods in ö?
    if (path.length == 1 && ö.isFunc(ö[path.at(0)]))
        return (...args) => ö[path.at(0)](v, ...args)

    // methods in global objects?
    let globalPath = getParent(globalThis, path)

    if (ö.isFunc(globalPath?.[key]))
        return (...args) => globalPath[key](v, ...args)

    let errorMsg = `No method or property found for ${path.join('.')} on type ${
        parent?.constructor.name
    }, and no method for ${path.join('.')} found in ö or in global scope.`

    if (isThrowing) throw new Error(errorMsg)

    ö.warn(`${errorMsg} Skipping.`) // todo: Change skipping behaviour? Stoopid? Better to throw by default?

    // on warn, just return value
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

// Todo: Enable dot syntax for global objects, with arbitrary depth.
// Hypothesis: Use a different mode for lookup if key matches a global object, but is called without args. Might lead to ambiguity, may require lookahead.

export const chain = (initial, isThrowing = false, isAsync = false) => {
    let v = ö.clone(initial)
    let q = []

    const caseRunQueue =
        isAsync ?
            async () => {
                for (let [i, { key, f, catcher }] of q.entries()) {
                    if (key === 'peek') {
                        peek(i, q[i - 1].key, v)
                        continue
                    }
                    try {
                        if (key === 'returnIf')
                            if (await f(v)) break
                            else continue

                        v = await f(v)
                    } catch (error) {
                        if (key === 'try') v = await catcher(v, error)
                        else warn(i, key, error, isThrowing)
                    }
                }

                return v
            }
        :   () => {
                for (let [i, { key, f, catcher }] of q.entries()) {
                    if (key === 'peek') {
                        peek(i, q[i - 1].key, v)
                        continue
                    }
                    try {
                        if (key === 'returnIf')
                            if (f(v)) break
                            else continue

                        v = f(v)
                    } catch (error) {
                        if (key === 'try') v = catcher(v, error)
                        else warn(i, key, error, isThrowing)
                    }
                }

                return v
            }

    const caseInternal =
        key =>
        (f, catcher = v => v) =>
            queue(key, f, catcher)

    const caseEnd = () => initial => {
        v = ö.clone(initial)
        return caseRunQueue()
    }

    const caseFunction = f => queue(f.name || 'anonymous', f)

    // enables pathfinding with dot syntax, using a second proxy for "lookahead"
    const caseDefault = (key, path = [key]) =>
        new Proxy(() => {}, {
            get: (_, key) => caseDefault(_, (path.push(key), path)),
            apply: (_, __, args) =>
                queue(path.join('.'), v =>
                    lookup(path, v, isThrowing)(...args),
                ),
        })

    let p = new Proxy(() => {}, {
        // prettier-ignore
        get: (_, key) =>
             key.match(/returnIf|try|peek/) ?     caseInternal(key)
           : key === "value" ?                    caseRunQueue()
           : key === "return" ?                   caseRunQueue
           : key === "end" ?                      caseEnd
           : key === "f" ?                        caseFunction
           :                                      caseDefault(key),

        apply: (_, __, args) =>
            args.length ? caseFunction(...args) : caseRunQueue(),
    })

    const queue = (key, f, catcher) => (q.push({ key, f, catcher }), p)

    return p
}

export default chain

/**
 * ChainAsync
 * @param {*} v
 * @param {boolean} [isThrowing]
 * @returns {Proxy}
 */

export const chainAsync = (v, isThrowing = false) => chain(v, isThrowing, true)
