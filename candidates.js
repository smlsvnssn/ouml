/* 
TODO:
Environment methods, ie isMobile, isTouchscreen, isHiResScreen, isDesktop, isServer etc
Extend lerp to accept any-dimensional numbers, and optional easing functions (https://github.com/AndrewRayCode/easing-utils)
db? Server part for secrets and relay?

multiply and convolve for arrays

√ include .observable in ö?
√ rewrite övents as svelte actions?
(√ kinda) partition as separate modules?

Beziers?
Cubic, Quadratic

*/

/*
TypelessScript
Proxy som kan chaina metoder på alla typer. Pipe on speed 🤪. Closure runt ett värde, returnera this. Return som special keyword. Inspect för debugging kanske? Och f() för customfunktioner? Vilken typ man har får man hålla reda på själv 😄. Eller option på att logga värde/typ för varje steg?
Async förstås? Eller? Går det? Yepp!

const val = await chain('http://some.url')
.load()
.groupBy('stuff')
.return()

const val = chain(5)
.f( v => Array(v).keys())
.map(v => v**v)
.sum() // accepts ö methods (or any method in scope?)
.toString()
.log()
.length()
.return()
*/

// TODO: Fix error handling for async methods. Should break chain instead of skipping?

import * as ö from './ö.mjs'

const lookupMethod = (key, val) => {
	if (ö.isFunc(val[key])) return (...args) => val[key](...args)
	if (ö.is(val[key])) return () => val[key]
	if (ö.isFunc(ö[key])) return (...args) => ö[key](val, ...args)

	ö.warn(
		`No method found for ${key} on type ${val.constructor.name}, skipping.`,
	)
	return () => val
}

const peek = val =>
	ö.log(`
Peeking into chain:
Value: ${JSON.stringify(val, null, 2)}
Type:  ${val.constructor.name}
`)

const warn = (i, key, error) =>
	ö.warn(`Chain failed at step ${i} for method ${key}, skipping:`, error)

const createProxy = (o, isAsync) => {
	const q = []

	const runQ = isAsync
		? async () => {
				for (const [i, [key, f]] of q.entries()) {
					if (key === 'returnIf' && (await f())) break
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
					try {
						f(o.val)
					} catch (error) {
						warn(i, key, error)
					}
				}
				return o.val
		  }

	const p = new Proxy(o, {
		get: (_, key) => {
			if (key === 'value') return runQ()
			if (key === 'return') return runQ
			if (key === 'returnIf')
				return f => {
					q.push([
						key,
						isAsync ? async () => await f(o.val) : () => f(o.val),
					])
					return p
				}
			if (key === 'peek')
				return () => {
					q.push([key, () => peek(o.val)])
					return p
				}
			if (key === 'f')
				return f => {
					q.push([
						key,
						isAsync
							? async () => (o.val = await f(o.val))
							: () => (o.val = f(o.val)),
					])
					return p
				}
			// default
			return (...args) => {
				q.push([
					key,
					isAsync
						? async () =>
								(o.val = await lookupMethod(
									key,
									o.val,
								)(...args))
						: () => (o.val = lookupMethod(key, o.val)(...args)),
				])
				return p
			}
		},
	})
	return p
}

export const chain = (val, isAsync = false) =>
	createProxy({ val: ö.clone(val) }, isAsync)
export const chainAsync = val => createProxy({ val: ö.clone(val) }, true)
