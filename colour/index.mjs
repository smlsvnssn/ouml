import {
    clamp,
    id,
    isStr,
    isArr,
    lerp,
    log,
    pipe,
    round,
    times,
    time,
    isFunc,
    isNum,
} from '../ö.mjs'
import {
    parseToRgb,
    normaliseRgba,
    rgbToOklch,
    oklchToOklab,
    oklabToOklch,
    getNumbers,
} from './colourConversion.mjs'

/**
 * @typedef {Object} Colour
 * @prop {(l:number|undefined) => Colour} lightness - get/set lightness
 * @prop {(c:number|undefined) => Colour} chroma - get/set chroma
 * @prop {(h:number|undefined) => Colour} hue - get/set hue
 * @prop {(a:number|undefined) => Colour} alpha - get/set alpha
 * @prop {() => {lightness:number, chroma:number, hue:number, alpha:number}} valueOf
 *  - returns an object with l, c, h, a values
 * @prop {() => string} toString
 *  - returns a css colour string in oklch()
 * @prop {() => Colour} complement
 * @prop {() => Colour} invert
 * @prop {(amount:number) => Colour} darken - Amount is a percentage between 0 and 1.
 * @prop {(amount:number) => Colour} lighten - Amount is a percentage between 0 and 1.
 * @prop {(todo) => Colour[]} palette
 * @prop {(clr:Colour|string, steps?:number, colourspace?:string, interpolator?:function) => Colour[]} steps
 * @prop {(clr:Colour|string, percent?:number, colourspace?:string, interpolator?:function) => Colour} mix
 * @prop {(clr:Colour|string, colourspace?:string, interpolator?:function) => function} getInterpolator
 */

export class Colour {
    constructor(l, c, h, a) {
        this.#l = l
        this.#c = c
        this.#h = h
        this.#a = a
    }

    #l
    #c
    #h
    #a

    lightness(l) {
        return (
            isFunc(l) ? colour(l(this.#l), this.#c, this.#h, this.#a)
            : isNum(l) ? colour(l, this.#c, this.#h, this.#a)
            : this.#l
        )
    }
    chroma(c) {
        return (
            isFunc(c) ? colour(this.#l, c(this.#c), this.#h, this.#a)
            : isNum(c) ? colour(this.#l, c, this.#h, this.#a)
            : this.#c
        )
    }
    hue(h) {
        return (
            isFunc(h) ? colour(this.#l, this.#c, h(this.#h), this.#a)
            : isNum(h) ? colour(this.#l, this.#c, h, this.#a)
            : this.#h
        )
    }
    alpha(a) {
        return (
            isFunc(a) ? colour(this.#l, this.#c, this.#h, a(this.#a))
            : isNum(a) ? colour(this.#l, this.#c, this.#h, a)
            : this.#a
        )
    }

    *[Symbol.iterator]() {
        for (let v of [this.#l, this.#c, this.#h, this.#a]) yield v
    }

    valueOf() {
        return {
            lightness: this.#l,
            chroma: this.#c,
            hue: this.#h,
            alpha: this.#a,
        }
    }

    toString() {
        return `oklch(${round(this.#l * 100, 4)}% ${round(this.#c, 4)} ${round(this.#h, 4)} / ${round(this.#a, 4)})`
    }

    complement() {
        let [l, c, h, a] = this
        return colour(l, c, (h + 180) % 360, a)
    }

    invert() {
        let [l, c, h, a] = this
        return colour(1 - l, c, h, a).complement()
    }

    darken(amount = 0.1) {
        let [l, c, h, a] = this
        return colour(l - (1 - l) * amount, c, h, a)
    }

    lighten(amount = 0.1) {
        let [l, c, h, a] = this
        return colour(l + (1 - l) * amount, c, h, a)
    }

    palette(colourspace = 'oklab') {
        /* TODO: Returns basic colour palettes, with a few options.
           Triad, monochrome, analogous, complementary, shades ( 50, 100, 200... 900, 950 )
        */
        const STEPS = 11,
            half = (STEPS - 1) / 2

        return this.#throughSpace(
            [
                colour(0.97, this.#c / 3, this.#h, this.#a),
                colour(0.5, this.#c, this.#h, this.#a),
                colour(0.03, this.#c / 3, this.#h, this.#a),
            ],
            colourspace,
            (start, mid, end) => [
                ...times(half, i =>
                    start.map((v, channel) =>
                        lerp(v, mid[channel], (1 / half) * i),
                    ),
                ),
                mid,
                ...times(half, i =>
                    mid.map((v, channel) =>
                        lerp(v, end[channel], (1 / half) * (i + 1)),
                    ),
                ),
            ],
        )
    }

    #throughSpace(clr, space, f, toOklab = space == 'oklab') {
        let input = isArr(clr) ? clr.map(v => [...v]) : [[...this], [...clr]]

        let out = f(...input.map(toOklab ? oklchToOklab : id)).map(c =>
            toOklab ? colour(...oklabToOklch(c)) : colour(...c),
        )

        return out.length == 1 ? out[0] : out
    }

    steps(clr, steps = 1, colourspace = 'oklab', interpolator = lerp) {
        return this.#throughSpace(
            isStr(clr) ? colour(clr) : clr,
            colourspace,
            (start, end) =>
                times(steps + 2, i =>
                    start.map((v, channel) =>
                        interpolator(v, end[channel], (1 / (steps + 1)) * i),
                    ),
                ),
        )
    }

    getInterpolator(clr, colourspace = 'oklab', interpolator = lerp) {
        let c1 = colour(...this)
        return t => c1.mix(clr, t, colourspace, interpolator)
    }

    mix(clr, percent = 0.5, colourspace = 'oklab', interpolator = lerp) {
        return this.#throughSpace(
            isStr(clr) ? colour(clr) : clr,
            colourspace,
            (start, end) => [
                start.map((v, channel) =>
                    interpolator(v, end[channel], percent),
                ),
            ],
        )
    }
}

const proto = new Colour()

export const isColour = v => v instanceof Colour

/**
 * Returns a Colour in oklch.
 * @param { number | string | Colour } lightness
 * - A lightness value between 0 and 1, or a string representing a colour in hex/rgb/rgba/hsl/hsla format, or a Colour.
 * @param {number} [chroma] - value between 0 and 0.3ish
 * @param {number} [hue] - value between 0 and 360
 * @param {number} [alpha] - value between 0 and 1
 * @returns {Colour}
 */

const colour = (lightness = 0.7, chroma = 0.15, hue = 30, alpha = 1) => {
    let l, c, h, a

    const set = ([_l, _c, _h, _a = 1]) => {
        l = clamp(_l, 0, 1)
        c = clamp(_c, 0, 0.4)
        h = clamp(_h, 0, 360)
        a = clamp(_a, 0, 1)
    }

    set(
        isStr(lightness) ?
            /^oklch\(/.test(lightness) ?
                getNumbers(lightness).map((v, i) => (i == 0 ? v / 100 : v))
            :   pipe(lightness, parseToRgb, normaliseRgba, rgbToOklch)
        : isColour(lightness) ? lightness
        : [lightness, chroma, hue, alpha],
    )

    return Object.freeze(new Colour(l, c, h, a))
}

export default colour

// snabbare om o definieras utanför. Skriva om till klass?
time(() => times(10000, () => colour()))

log(colour('#ff0').toString())
