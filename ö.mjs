/* 
TODO:
Environment methods, ie isMobile, isTouchscreen, isHiResScreen, isDesktop, isServer etc
Extend lerp to accept any-dimensional numberss, and optional easing functions (https://github.com/AndrewRayCode/easing-utils)
db? Server part for secrets and relay?

*/
// generators
export const grid = function* (width, height) {
	height ??= width
	let x = 0
	do {
		yield { x: x % width, y: Math.floor(x / width) }
	} while (++x < width * height)
}

export const range = function* (start, end, step = 1) {
	[start, end, step] = (isnt(end)) ? [0, +start, +step] : [+start, +end, +step]
	const count = (start < end)
		? () => (start += step) < end
		: () => (start -= step) > end
	do { yield start } while (count() !== false)
}

// iterators
export const times = (times, f = i => i, ...rest) => {
	const a = []
	for (let i of range(Math.abs(times))) a.push(f(i, ...rest))
	return a
}

// arr
export const rangeArray = (start, end, step = 1) => {
	let arr = [], i = 0
	for (const n of range(start, end, step)) arr[i++] = n
	return arr
}

export const unique = arr => [...new Set(arr)]

export const shuffle = arr => {
	// no mutation, array coercion
	const a = Array.from(arr)
	// classic loop for performance reasons
	for (let i = a.length - 1; i > 0; i--) {
		const j = random(i + 1);
		[a[i], a[j]] = [a[j], a[i]]
	}
	return a
}

export const sample = (arr, samples = 1) => {
	// no mutation, array coercion
	const a = Array.from(arr),
		s = []
	for (const i of range(samples > a.length ? a.length : samples > 0 ? samples : 1))
		s.push(a.splice(random(a.length), 1)[0])
	return samples === 1 ? s[0] : s
}

// thx https://hackernoon.com/3-javascript-performance-mistakes-you-should-stop-doing-ebf84b9de951
//sum = arr => arr.reduce( (a, v) => a + Number(v) , 0); < 10xslower
export const sum = arr => {
	arr = Array.from(arr)
	let a = 0
	for (let i = 0; i < arr.length; i++) a += Number(arr[i])
	return a
}

export const mean = arr => sum(arr) / arr.length

export const median = arr => {
	// no mutation
	const a = Array.from(arr).sort((a, b) => Number(a) - Number(b)),
		m = Math.floor(arr.length / 2)
	return (m % 2) ? (Number(a[m - 1]) + Number(a[m])) / 2 : Number(a[m])
}

export const max = arr => Math.max(...arr)

export const min = arr => Math.min(...arr)

export const groupBy = (arr, prop) => arr.reduce((m, x) =>
	m.set(x[prop], [...m.get(x[prop]) || [], x]),
	new Map()
)

// SET OPS
export const intersect = (a, b) => Array.from(a).filter(v => Array.from(b).includes(v))

export const subtract = (a, b) => Array.from(a).filter(v => !Array.from(b).includes(v))

export const exclude = (a, b) => {
	[a, b] = [Array.from(a), Array.from(b)]
	return a.filter(v => !b.includes(v))
		.concat(b.filter(v => !a.includes(v)))
}

export const union = (a, b) => [...new Set([...Array.from(a), ...Array.from(b)])]

export const isSubset = (a, b) => {
	[a, b] = [Array.from(a), Array.from(b)]
	return a.length <= b.length && a.every(v => b.includes(v))
}

// DOM
export const createElement = (html, isSvg = false) => {
	const template = document.createElement('template')
	if (isSvg) {
		template.innerHTML = `<svg>${ html.trim() }</svg>`
		return template.content.firstChild.firstChild
	}
	template.innerHTML = html.trim()
	return template.content.firstChild
}

export const parseDOMStringMap = o => {
	// convert from DOMStringMap to object
	o = { ...o }
	for (const key in o)
		// parse what's parseable
		try { o[key] = JSON.parse(o[key]) } catch (e) { };
	return o
}

// global data storage
const d = new WeakMap()

export const data = (element, key, value) => {
	const thisData = d.has(element) ? d.get(element) : parseDOMStringMap(element.dataset)
	if (is(value) || isObj(key))
		d.set(element, Object.assign(thisData, isObj(key) ? key : { [key]: value }))
	return isStr(key) ? thisData[key] : thisData
}

// Finds deepestElement in element matching selector. Potential performance hog for deep DOM structures.
export const deepest = (element, selector = '*') =>
	Array.from(element.querySelectorAll(selector))
		.reduce(
			(deepest, el) => {
				let depth = 0
				for (e = el; e !== element; depth++, e = e.parentNode);
				return depth > deepest.depth ? { depth: depth, deepestElement: el } : deepest
			},
			// accumulator
			{ depth: 0, deepestElement: element }
		)
		.deepestElement

// logical

// Based on https://www.30secondsofcode.org/js/s/equals
// Checks own enumerable properties only.
// Does not work for ArrayBuffers because Symbols. Solvable with Object.getOwnPropertySymbols(obj)? Good enough?
export const isEqual = (a, b, deep = true) =>
	a === b ? true :																				// are strictly equal?
		a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() :						// are same date?
			a instanceof Function && b instanceof Function ? '' + a === '' + b :					// are lexically same functions? (Closures not compared)
				!a || !b || (typeof a !== 'object' && typeof b !== 'object') ? a === b :			// are nullish?
					Object.getPrototypeOf(a) !== Object.getPrototypeOf(b) ? false :					// have same prototype?
						Object.keys(a).length !== Object.keys(b).length ? false :					// have same length ? (Iterables)
							Object.keys(a).every(k => deep ? isEqual(a[k], b[k]) : a[k] === b[k])	// have same properties and values? (Recursively if deep)

// clone
export const clone = (v, deep = true) => {
	const isDeep = v => deep ? clone(v) : v
	// no cloning of functions, too gory
	if (typeof v !== 'object' || isNull(v)) return v
	// catch arraylike
	if ('map' in v && isFunc(v.map)) return v.map(i => isDeep(i))
	if (isMap(v)) return new Map(isDeep(Array.from(v)))
	if (isSet(v)) return new Set(isDeep(Array.from(v)))
	if (isDate(v)) {
		const d = new Date()
		d.setTime(v.getTime())
		return d
	}
	// todo: Handling of instantiation and prototype (Possible)?
	//const o = Object.create(Object.getPrototypeOf(v));
	const o = {}
	for (const key in v)
		if (v.hasOwnProperty(key))
			o[key] = isDeep(v[key])
	return o
}

export const pipe = (v, ...funcs) => funcs.reduce((x, f) => f(x), v)

export const memoise = (f, keymaker) => {
	const cache = new Map()
	return (...args) => {
		const key = keymaker ? keymaker(...args)
			: args.length > 1 ? args.join('-') : args[0]

		if (cache.has(key)) return cache.get(key)
		const result = f(...args)
		cache.set(key, result)
		return result
	}
}

// thx https://masteringjs.io/tutorials/fundamentals/enum
export const createEnum = (v) => {
	const enu = {}
	for (const val of v) enu[val] = val
	return Object.freeze(enu)
}

// Untested 
// pipeAsync = async (v, ...funcs) => await funcs.reduce( async (x, f) => await f(x), v);

// mathy
export const random = (min, max, float = false) => {
	// max can be omitted
	float = isBool(max) ? max : float;
	[min, max] = isnt(max) || isBool(max)
		// with no parameters, defaults to 0 or 1
		? isnt(min) ? [0, 2] : [0, +min]
		: [+min, +max]
	return float ? Math.random() * (max - min) + min : Math.floor(Math.random() * (max - min)) + min
}

export const randomNormal = (mean = 0, sigma = 1) => {
	const samples = 6
	let sum = 0, i = 0
	for (i; i < samples; i++) sum += Math.random()
	return (sigma * 8.35 * (sum - samples / 2)) / samples + mean
	// ^ hand made spread constant :-) 
}

export const round = (n, precision = 0) => Math.round(n * 10 ** precision + Number.EPSILON) / 10 ** precision

export const nthRoot = (x, n) => x ** (1 / Math.abs(n))

export const factorial = n => n <= 1 ? 1 : n * factorial(n - 1)
export const nChooseK = (n, k) => {
	if (k < 0 || k > n) return 0
	if (k === 0 || k === n) return 1
	if (k === 1 || k === n - 1) return n

	let res = n
	for (let i = 2; i <= k; i++) {
		res *= (n - i + 1) / i
	}

	return Math.round(res)
}
export const lerp = (a, b, t) => (1 - t) * a + t * b

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

export const between = (n, min, max) => n >= min && n < max

export const normalize = (n, min, max, clamp = true) => {
	n = (n - min) / ((max - min) + Number.EPSILON) // Prevent / by 0
	return clamp ? clamp(n, 0, 1) : n
}

// string
export const prettyNumber = (n, locale = 'sv-SE', precision = 2) => {
	// lacale can be omitted
	[locale, precision] = isNum(locale) ? ['sv-SE', locale] : [locale, precision]
	return Number.isNaN(n) ? '-' : round(n, precision).toLocaleString(locale)
}

export const wrapFirstWords = (s, numWords = 3, startWrap = '<span>', endWrap = '</span>', startAtChar = 0) =>
	s.slice(0, startAtChar)
	+ s.slice(startAtChar)
		.replace(
			new RegExp('([\\s]*[a-zA-ZåäöÅÄÖøØ0-9\'’"\-]+){0,' + (numWords) + '}\\S?'),
			startWrap + '$&' + endWrap
		)

export const toCamelCase = s => s.match(/^\-\-/) ? s // is css var, so leave it alone
	: s.replace(/([-_\s])([a-zA-Z0-9])/g, (m, _, c, o) => o ? c.toUpperCase() : c)

// thx https://gist.github.com/nblackburn/875e6ff75bc8ce171c758bf75f304707
export const toKebabCase = s => s.match(/^\-\-/) ? s // is css var, so leave it alone
	: s.replace(/\s/g, '-').replace(/([a-z0-9])([A-Z0-9])/g, '$1-$2').toLowerCase()

export const randomChars = () => (Math.random() * 2 ** 64).toString(36).substring(0, 10)

// Colours
export const toHsla = (c, asString = false) => {
	let rgba, h, s, l, r, g, b, a

	c = c.trim()

	// Parse
	if (/^#/.test(c)) {
		// is hex
		rgba = Array.from(c)
			.slice(1) // remove #
			.flatMap((v, i, a) =>
				a.length <= 4 // if shorthand
					? [Number('0x' + v + v)]
					: i % 2 // if longform
						? [] // omitted by flatmap
						: [Number('0x' + v + a[i + 1])] // current + next
			)
		// fix alpha
		if (rgba.length === 4) rgba[3] / 255

	} else if (/^rgb\(|^rgba\(/.test(c)) {
		// is rgb/rgba
		rgba = c.match(/([0-9\.])+/g).map(v => Number(v)) // Pluck the numbers
		if (/%/.test(c)) // fix percent
			rgba = rgba.map((v, i) => (i < 3) ? Math.round(v / 100 * 255) : v)

	} else if (/^hsl\(|^hsla\(/.test(c)) {
		// is hsl/hsla
		[h, s, l, a] = c.match(/([0-9\.])+/g).map(v => Number(v)) // Pluck the numbers
		a ??= 1

	} else { return (warn('Sorry, can\'t parse ' + c), null) }

	if (rgba) {
		// convert

		// add default alpha if needed
		if (rgba.length === 3) { rgba.push(1) }
		// Adapted from https://css-tricks.com/converting-color-spaces-in-javascript/
		[r, g, b, a] = rgba.map((v, i) => (i < 3) ? v / 255 : v)
		let
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin

		h = (round(
			(delta === 0 ? 0 :
				cmax === r ? ((g - b) / delta) % 6 :
					cmax === g ? (b - r) / delta + 2 :
					/*cmax  === b*/	(r - g) / delta + 4)
			* 60) + 360) % 360 // prevent negatives
		l = (cmax + cmin) / 2
		s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

		// sanitize
		s = round(s * 100, 2)
		l = round(l * 100, 2)
		a = round(a, 2)
	}

	return asString ? hsla(h, s, l, a) : { h: h, s: s, l: l, a: a }
}

export const hsla = (h, s = 70, l = 50, a = 1) => {
	if (isObj(h)) ({ h, s, l, a } = h)
	return `hsla(${ (h % 360) }, ${ s }%, ${ l }%, ${ a })`
}

// async
let timeout, rejectPrev // wow! Closure just works!

export const wait = async (t = 1, f, resetPrevCall = false) => {
	// callback is optional
	resetPrevCall = isBool(f) ? f : resetPrevCall
	if (resetPrevCall && rejectPrev) {
		clearTimeout(timeout)
		rejectPrev()
	}
	try {
		await new Promise((resolve, reject) => {
			timeout = setTimeout(resolve, t)
			rejectPrev = reject
		})
		if (isFunc(f)) await f()
	} catch (e) { }
}

export const nextFrame = async f => {
	return new Promise(resolve => requestAnimationFrame(async () => {
		if (isFunc(f)) await f()
		resolve()
	}))
}

export const waitFrames = async (n = 1, f, everyFrame = false) => {
	while (n-- > 0) await nextFrame(everyFrame ? f : null)
	if (isFunc(f) && !everyFrame) await f()
}

export const waitFor = async (selector, event, f) => {
	return new Promise(resolve => {
		document.querySelector(selector).addEventListener(event, async e => {
			if (isFunc(f)) await f(e)
			resolve()
		}, { once: true })
	})
}

// JSON or text
export const load = async (url, isJSON = true) => {
	try {
		const response = await fetch(url)
		return await isJSON ? response.json() : response.text()
	} catch (e) { error(e) }
}

// basic type checking
const istype = t => v => typeof v === t
const isof = t => v => v instanceof t

export const isBool = istype('boolean')
export const isNum = istype('number')
export const isInt = v => Number.isInteger(v)
export const isBigInt = istype('bigint')
export const isStr = istype('string')
export const isSym = istype('symbol')
export const isFunc = istype('function')
export const isnt = v => v === undefined
export const is = v => v !== undefined
export const isNull = v => v === null
export const isArr = v => Array.isArray(v)
export const isDate = isof(Date)
export const isMap = isof(Map)
export const isSet = isof(Set)
export const isRegex = isof(RegExp)

export const isObj = v => typeof v === 'object' && v !== null
	&& !isArr(v) && !isDate(v) && !isMap(v) && !isSet(v) && !isRegex(v)

export const isIterable = v => v != null && typeof (v)[Symbol.iterator] === 'function'


// throttle, debounce, onAnimationFrame

export const throttle = (f, t = 50, debounce = false, immediately = false) => {
	let timeout, lastRan, running = false
	return function () {
		const context = this, args = arguments
		if (!lastRan || (debounce && !running)) {
			// first run or debounce rerun
			if (!debounce || immediately) f.apply(context, args)
			lastRan = Date.now()
		} else {
			clearTimeout(timeout)
			timeout = setTimeout(() => {
				if (Date.now() - lastRan >= t) {
					f.apply(context, args)
					lastRan = Date.now()
					running = false
				}
			},
				debounce ? t : t - (Date.now() - lastRan)
			)
		}
		running = true
	}
}

export const debounce = (f, t = 50, immediately = false) => throttle(f, t, true, immediately)

export const onAnimationFrame = f => {
	let timeout
	return function () {
		const context = this, args = arguments
		cancelAnimationFrame(timeout)
		timeout = requestAnimationFrame(() => f.apply(context, args))
	}
}

// util & environment

// export const q = document.querySelector.bind(document);
// export const qa = document.querySelectorAll.bind(document);

export const getLocal = item => {
	const i = localStorage.getItem(item)
	return i && JSON.parse(i)
}

export const setLocal = (item, v) => (localStorage.setItem(item, JSON.stringify(v)), v)

export const getCss = (prop, selector = ':root') => document.querySelector(selector).style.getPropertyValue(prop)

export const setCss = (prop, v, selector = ':root') => (document.querySelector(selector).style.setProperty(prop, v), v)

// verbose errors
let isVerbose = true, isThrowing = false

export const verbose = (v, t = false) => isnt(v) ? isVerbose : (isThrowing = !!t, isVerbose = !!v)

export const error = (e, ...r) => {
	if (isVerbose) {
		if (isThrowing) throw new Error(e)
		else console.error(message(e), ...r)
	}
	return r ? [e, ...r] : e
}

export const warn = (msg, ...r) => isVerbose && !console.warn(message(msg), ...r) && r ? [msg, ...r] : msg

export const log = (...msg) => isVerbose && !console.log(...msg) && msg.length === 1 ? msg[0] : msg

export const message = s => `ö🍳uery says: ${ s }\n`

// stuff		
export const toString = () => `Hello ö🍳uery!`

export const rorövovarorsospoproråkoketot = s => (s || '').replace(/[bcdfghjklmnpqrstvwxyz]/gi, m => m + 'o' + m.toLowerCase())
