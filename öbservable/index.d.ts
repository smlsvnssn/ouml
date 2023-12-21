interface Observable extends Proxy {
	value?: any
}

export function observable(
	v: any,
	deep?: boolean,
	extendable?: boolean,
	wrapPrimitive?: boolean,
): Observable

export function isObservable(obj: any): boolean

export function observe(
	getter: Function | Observable,
	callback: Function,
	deep?: boolean,
): {
	update: Function
	pause: Function
	unpause: Function
	stop: Function
}
