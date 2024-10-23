import {
    clamp,
    id,
    isStr,
    isArr,
    lerp,
    pipe,
    round,
    times,
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

export class Colour {
    constructor(...args) {
        ;[this.#l, this.#c, this.#h, this.#a] = args
    }

    #l
    #c
    #h
    #a

    /**
     * get/set lightness
     * @param {number | ((l:number) => number )| undefined} l
     * @returns {Colour}
     */

    lightness(l) {
        return (
            isFunc(l) ? colour(l(this.#l), this.#c, this.#h, this.#a)
            : isNum(l) ? colour(l, this.#c, this.#h, this.#a)
            : this.#l
        )
    }

    /**
     * get/set chroma
     * @param {number | ((c:number) => number )| undefined} c
     * @returns {Colour}
     */

    chroma(c) {
        return (
            isFunc(c) ? colour(this.#l, c(this.#c), this.#h, this.#a)
            : isNum(c) ? colour(this.#l, c, this.#h, this.#a)
            : this.#c
        )
    }

    /**
     * get/set hue
     * @param {number | ((h:number) => number )| undefined} h
     * @returns {Colour}
     */

    hue(h) {
        return (
            isFunc(h) ? colour(this.#l, this.#c, h(this.#h), this.#a)
            : isNum(h) ? colour(this.#l, this.#c, h, this.#a)
            : this.#h
        )
    }

    /**
     * get/set alpha
     * @param {number | ((a:number) => number )| undefined} a
     * @returns {Colour}
     */

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

    /**
     * returns an object with l, c, h, a values
     * @returns {lightness:number, chroma:number, hue:number, alpha:number}}
     */

    valueOf() {
        return {
            lightness: this.#l,
            chroma: this.#c,
            hue: this.#h,
            alpha: this.#a,
        }
    }

    /**
     * @returns {string} a css colour string in oklch()
     */

    toString() {
        let [l, c, h, a] = this
        return `oklch(${round(l * 100, 4)}% ${round(c, 4)} ${round(h, 4)} / ${round(a, 4)})`
    }

    complement() {
        let [l, c, h, a] = this
        return colour(l, c, (h + 180) % 360, a)
    }

    invert() {
        let [l, c, h, a] = this
        return colour(1 - l, c, h, a).complement()
    }

    /**
     * @param {number} amount - percentage between 0 and 1.
     */

    darken(amount = 0.1) {
        let [l, c, h, a] = this
        return colour(l - (1 - l) * amount, c, h, a)
    }

    /**
     * @param {number} amount - percentage between 0 and 1.
     */

    lighten(amount = 0.1) {
        let [l, c, h, a] = this
        return colour(l + (1 - l) * amount, c, h, a)
    }

    /**
     * @param {Colour | string | Colour[]} clr - the colour/s to build a gradient from
     * @param {string} [type] - linear, radial or conic
     * @param {number} [rotation] - in degrees
     * @param {[number]} [position] - in an array like [0.5, 0.5]
     * @param {string} [colourspace] - 'oklab' converts to oklab space for interpolation
     * @returns {string}
     */

    gradient(
        clr,
        type = 'linear',
        rotation = 0,
        position = [0.5, 0.5],
        colourspace = 'oklab',
    ) {
        let clrs =
            isArr(clr) ?
                [this, ...clr.map(v => colour(v))]
            :   [this, colour(clr)]

        clrs = clrs.join(', ')

        return (
            type == 'linear' ?
                `linear-gradient(in ${colourspace} ${rotation}deg, ${clrs})`
            : type == 'radial' ?
                `radial-gradient(in ${colourspace} farthest-corner at ${position[0] * 100}% ${position[1] * 100}%, ${clrs})`
            : type == 'conic' ?
                `conic-gradient(in ${colourspace} from ${rotation}deg at ${position[0] * 100}% ${position[1] * 100}%, ${clrs})`
            :   `${this}`
        )
    }

    /**
     *
     * @param {[Colour] | Colour} clr
     * @param {string} space 'oklab' or any for oklch
     * @param {(v:[[l,c,h,a]]) => [[l,c,h,a]]} f
     * @returns {[Colour] | Colour} if 1 item, returns unwrapped Colour
     */

    #throughSpace(clr, space, f, toOklab = space == 'oklab') {
        let input = isArr(clr) ? clr.map(v => [...v]) : [[...this], [...clr]]

        let out = f(...input.map(toOklab ? oklchToOklab : id)).map(c =>
            toOklab ? colour(...oklabToOklch(c)) : colour(...c),
        )

        return out.length == 1 ? out[0] : out
    }

    /**
     * Returns basic colour palettes
     * @param {string} [colourspace] - 'oklab' converts to oklab space for interpolation
     * @returns {Colour[]}
     */

    palette(colourspace = 'oklab') {
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

    /**
     * @param {Colour|string} colour - the color to interpolate to
     * @param {int} [steps]
     * @param {string} [colourspace] - 'oklab' converts to oklab space for interpolation
     * @param {function} [interpolator] - a function accepting a, b, t as parameters
     * @returns {Colour[]}
     */

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

    /**
     * @param {Colour|string} colour - the color to mix with
     * @param {number} [percent] - value between 0 and 1
     * @param {string} [colourspace] - 'oklab' converts to oklab space for interpolation
     * @param {function} [interpolator] - a function accepting a, b, t as parameters
     * @returns {Colour[]}
     */

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

    /**
     * @param {Colour|string} colour - the color to interpolate to
     * @param {string} [colourspace] - 'oklab' converts to oklab space for interpolation
     * @param {function} [interpolator] - a function accepting a, b, t as parameters
     * @returns {(t:number) => Colour} an interpolator taking a 't' value
     */

    getInterpolator(clr, colourspace = 'oklab', interpolator = lerp) {
        return t => this.mix(clr, t, colourspace, interpolator)
    }
}

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
    const clampChannels = ([l, c, h, a = 1]) => [
        clamp(l, 0, 1),
        clamp(c, 0, 0.4),
        clamp(h, 0, 360),
        clamp(a, 0, 1),
    ]

    return Object.freeze(
        new Colour(
            ...clampChannels(
                isStr(lightness) ?
                    /^oklch\(/.test(lightness) ?
                        getNumbers(lightness).map((v, i) =>
                            i == 0 ? v / 100 : v,
                        )
                    :   pipe(lightness, parseToRgb, normaliseRgba, rgbToOklch)
                : isColour(lightness) ? lightness
                : [lightness, chroma, hue, alpha],
            ),
        ),
    )
}

export default colour
