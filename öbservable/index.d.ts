// Simons försök:
/* declare const observableSymbol: unique symbol

export function observable<T>(
	v: T,
		deep?: boolean,
	extendable?: boolean,
	wrapPrimitive?: boolean,
): T extends boolean | string | number | null | undefined | bigint 
	? { value: T; [observableSymbol]: boolean }
	: T extends Array ? any[] & [[observableSymbol]: boolean] : T & { [observableSymbol]: boolean } */

interface Observable extends Proxy<T> {
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
