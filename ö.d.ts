declare module "ouml" {
    export function grid(width: number, height?: number): IterableIterator<{}>
    export function range(
        start: number,
        end?: number,
        step?: number,
    ): IterableIterator<number>
    export function times(
        times: number,
        f?: (i: number) => any,
        ...rest: any[]
    ): any[]

    export function rangeArray(
        start: number,
        end?: number,
        step?: number,
    ): number[]
    export function map(arr: Iterable<any>, f: string | Function): any[]
    export function unique(arr: Iterable<any>): any[]
    export function shuffle(arr: Iterable<any>): any[]
    export function sample(arr: Iterable<any>, samples?: number): any | any[]
    export function sum(arr: Iterable<number>): number
    export function mean(arr: Iterable<number>): number
    export function median(arr: Iterable<number>): number
    export function max(arr: Iterable<number>): number
    export function min(arr: Iterable<number>): number

    export function groupBy(
        arr: Iterable<any>,
        prop: string | Function,
    ): [any[]]
    export function findDeep(
        arr: any[],
        val: Function | any,
        subArrayProp: string,
        prop?: string,
    ): any
    export function filterDeep(
        arr: any[],
        val: Function | any,
        subArrayProp: string,
        prop?: string,
    ): any[]

    export function intersect(a: Iterable<any>, b: Iterable<any>): any[]
    export function subtract(a: Iterable<any>, b: Iterable<any>): any[]
    export function exclude(a: Iterable<any>, b: Iterable<any>): any[]
    export function union(a: Iterable<any>, b: Iterable<any>): any[]
    export function isSubset(a: Iterable<any>, b: Iterable<any>): boolean

    export function createElement(
        html: string,
        isSvg?: boolean,
    ): HTMLElement | SVGElement
    export function parseDOMStringMap(o: DOMStringMap): {}
    export function data(
        element: [] | {},
        key: {} | string,
        value: any,
    ): {} | any
    export function deepest(element: Element, selector?: string): any

    export function isEqual(a: any, b: any, deep?: boolean): Element
    export function clone(
        v: any,
        deep?: boolean,
        immutable?: boolean,
        preservePrototype?: boolean,
    ): any
    export function immutable(v: any, deep?: boolean): any
    export function pipe(v: any, ...funcs: Function[]): any
    export function memoise(
        f: Function,
        keymaker?: Function,
    ): (...args: any[]) => any
    export function memoize(
        f: Function,
        keymaker?: Function,
    ): (...args: any[]) => any
    export function createEnum(...v: string[] | string): {}

    export function random(min?: number, max?: number, float?: boolean): number
    export function randomNormal(mean?: number, sigma?: number): number
    export function round(n: number, precision?: number): number
    export function nthRoot(x: number, n: number): number
    export function factorial(n: number): number
    export function nChooseK(n: number, k: number): number
    export function lerp(a: number, b: number, t: number): number
    export function smoothstep(a: number, b: number, t: number): number
    export function easeIn(a: number, b: number, t: number): number
    export function easeOut(a: number, b: number, t: number): number
    export function clamp(n: number, min: number, max: number): number
    export function between(n: number, min: number, max: number): boolean
    export function normalize(
        n: number,
        min: number,
        max: number,
        doClamp?: boolean,
    ): number
    export function normalise(
        n: number,
        min: number,
        max: number,
        doClamp?: boolean,
    ): number
    export function toPolar(x: number, y: number): { r: number; theta: number }
    export function toCartesian(
        r: number,
        theta: number,
    ): { x: number; y: number }

    export function prettyNumber(
        n: number,
        locale?: string | number,
        precision?: number,
    ): string
    export function wrapFirstWords(
        s: string,
        numWords?: number,
        startWrap?: string,
        endWrap?: string,
        startAtChar?: number,
    ): string
    export function toCamelCase(s: string): string
    export function toKebabCase(s: string): string
    export function capitalise(s: string): string
    export function capitalize(s: string): string
    export function randomChars(numChars?: number): string
    export function stripTags(s: string): string
    export function when(bool: Boolean, v: any, f?: any): any

    export function toHsla(
        c: string,
        asString?: boolean,
    ):
        | string
        | {
              h: number
              s: number
              l: number
              a: number
          }
    export function hsla(
        h: number | { h: number; s: number; l: number; a: number },
        s?: number,
        l?: number,
        a?: number,
    ): string

    export function wait(
        t?: number,
        f?: Function,
        resetPrevCall?: boolean,
    ): Promise<void>
    export function nextFrame(f?: Function): Promise<void>
    export function waitFrames(
        n?: number,
        f?: Function,
        everyFrame?: boolean,
    ): Promise<void>
    export function waitFor(
        selector: string,
        event: string,
        f?: Function,
    ): Promise<void>
    export function load(
        url: string,
        isJSON?: boolean,
        errorMessage?: string,
        settings?: {},
    ): Promise<{} | string>

    export function isBool(v: any): boolean
    export function isNum(v: any): boolean
    export function isInt(v: any): boolean
    export function isBigInt(v: any): boolean
    export function isStr(v: any): boolean
    export function isSym(v: any): boolean
    export function isFunc(v: any): boolean
    export function isnt(v: any): boolean
    export function is(v: any): boolean
    export function isNull(v: any): boolean
    export function isArr(v: any): boolean
    export function isDate(v: any): boolean
    export function isMap(v: any): boolean
    export function isSet(v: any): boolean
    export function isRegex(v: any): boolean
    export function isObj(v: any): boolean
    export function isIterable(v: any): boolean

    export function getLocal(item: string): {} | undefined
    export function setLocal(item: string, v: any): any
    export function getCss(prop: string, selector?: string): string | undefined
    export function setCss(prop: string, v: string, selector?: string): string

    export function throttle(
        f: Function,
        t?: number,
        debounce?: boolean,
        immediately?: boolean,
    ): (...args: any[]) => void
    export function debounce(
        f: Function,
        t?: number,
        immediately?: boolean,
    ): (...args: any[]) => void
    export function onAnimationFrame(f: Function): (...args: any[]) => void

    export function verbose(v: boolean | undefined, t?: boolean): boolean
    export function error(e: any, ...r: any[]): any
    export function warn(msg: any, ...r: any[]): any
    export function log(...msg: any[]): any
    export function time(f?: Function | string, label?: string): any | undefined
    export function timeEnd(label?: string): undefined
    export function message(s: string): string
    export function toString(): string
    export function rorövovarorsospoproråkoketot(s: string): string
}
