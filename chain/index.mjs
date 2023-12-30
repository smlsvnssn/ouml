/*
TypelessScript
Proxy som kan chaina metoder på alla typer. Pipe on speed 🤪. Closure runt ett värde, returnera this. Return som special keyword. Inspect för debugging kanske? Och f() för customfunktioner? Vilken typ man har får man hålla reda på själv 😄. Eller option på att logga värde/typ för varje steg?
Async förstås? Eller? Går det? Yepp!
*/

import * as ö from '../ö.mjs'

const lookupMethod = (key, val) => {
    if (ö.isFunc(val[key])) return (...args) => val[key](...args)
    if (ö.is(val[key])) return () => val[key]
    if (ö.isFunc(ö[key])) return (...args) => ö[key](val, ...args)

    ö.warn(
        `No method found for ${key} on type ${val.constructor.name}, skipping.`,
    )
    return () => val
}

const peek = (i, key, val) =>
    ö.log(`
Peeking into chain after step ${i}, running ${key}():
Value: ${JSON.stringify(val, null, 2)}
Type:  ${val.constructor.name}
`)

const warn = (i, key, error) =>
    ö.warn(`Chain failed at step ${i} for method ${key}, skipping:`, error)

const createProxy = (o, isAsync) => {
    const q = []

    const caseRunQ = isAsync
        ? async () => {
              for (const [i, [key, f]] of q.entries()) {
                  if (key === 'returnIf' && (await f())) break
                  if (key === 'peek') {
                      peek(i, q[i - 1][0], o.val, f)
                      continue
                  }
                  try {
                      await f(o.val)
                  } catch (error) {
                      warn(i, key, error)
                  }
              }
              return o.val
          }
        : () => {
              for (const [i, [key, f]] of q.entries()) {
                  if (key === 'returnIf' && f()) break
                  if (key === 'peek') {
                      peek(i - 1, q[i - 1][0], o.val)
                      continue
                  }
                  try {
                      f(o.val)
                  } catch (error) {
                      warn(i, key, error)
                  }
              }
              return o.val
          }

    const caseReturnIf = key => f => {
        q.push([key, isAsync ? async () => await f(o.val) : () => f(o.val)])
        return p
    }

    const caseFunction = key => f => {
        q.push([
            key,
            isAsync
                ? async () => (o.val = await f(o.val))
                : () => (o.val = f(o.val)),
        ])
        return p
    }

    const casePeek = key => () => {
        q.push([key])
        return p
    }

    const caseDefault =
        key =>
        (...args) => {
            q.push([
                key,
                isAsync
                    ? async () =>
                          (o.val = await lookupMethod(key, o.val)(...args))
                    : () => (o.val = lookupMethod(key, o.val)(...args)),
            ])
            return p
        }

    const p = new Proxy(o, {
        get: (_, key) => {
            if (key === 'value') return caseRunQ()
            if (key === 'return') return caseRunQ
            if (key === 'returnIf') return caseReturnIf(key)
            if (key === 'peek') return casePeek(key)
            if (key === 'f') return caseFunction(key)
            return caseDefault(key)
        },
    })
    return p
}

export const chain = (val, isAsync = false) =>
    createProxy({ val: ö.clone(val) }, isAsync)
export const chainAsync = val => createProxy({ val: ö.clone(val) }, true)
