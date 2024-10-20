import { clamp, id, is, isStr, lerp, log, pipe, round, times } from '../ö.mjs'
import {
    parseToRgb,
    rgbToOklch,
    oklchToOklab,
    oklabToOklch,
} from './colourConversion.mjs'

/**
 * A colour in oklch.
 */

export default class Colour {
    /**
     *
     * @param { number | string | Colour } lightness - A lightness value between 0 and 1, or a string representing a colour in hex/rgb/rgba/hsl/hsla format, or a Colour.
     * @param {number} [chroma] - value between 0 and 0.3ish
     * @param {number} [hue] - value between 0 and 360
     * @param {number} [alpha] - value between 0 and 1
     */

    constructor(lightness = 0.7, chroma = 0.15, hue = 30, alpha = 1) {
        if (isStr(lightness)) {
            pipe(
                lightness,
                parseToRgb,
                ([r, g, b, a]) =>
                    rgbToOklch([r / 255, g / 255, b / 255, a ?? 1]),
                v => this.#set(...v),
            )
        } else if (lightness instanceof Colour) this.#set(...lightness)
        else this.#set(lightness, chroma, hue, alpha)
    }

    #MAX = { l: 1, c: 0.4, h: 360, a: 1 }

    #set(l, c, h, a) {
        this.#l = clamp(l, 0, this.#MAX.l)
        this.#c = clamp(c, 0, this.#MAX.c)
        this.#h = clamp(h, 0, this.#MAX.h)
        this.#a = clamp(a, 0, this.#MAX.a)
    }

    #l
    #c
    #h
    #a

    lightness(l) {
        return is(l) ?
                Colour.of(clamp(l, 0, this.#MAX.l), this.#c, this.#h, this.#a)
            :   this.#l
    }
    chroma(c) {
        return is(c) ?
                Colour.of(this.#l, clamp(c, 0, this.#MAX.c), this.#h, this.#a)
            :   this.#c
    }
    hue(h) {
        return is(h) ?
                Colour.of(this.#l, this.#c, clamp(h, 0, this.#MAX.h), this.#a)
            :   this.#h
    }
    alpha(a) {
        return is(a) ?
                Colour.of(this.#l, this.#c, this.#h, clamp(a, 0, this.#MAX.a))
            :   this.#a
    }

    *[Symbol.iterator]() {
        yield this.#l
        yield this.#c
        yield this.#h
        yield this.#a
    }

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
        return `oklch(${round(this.#l * 100, 4)}% ${round(this.#c, 4)} ${round(this.#h, 4)} / ${round(this.#a, 4)})`
    }

    complement() {
        let [l, c, h, a] = this
        return Colour.of(l, c, (h + 180) % 360, a)
    }

    invert() {
        let [l, c, h, a] = this.complement()
        return Colour.of(1 - l, c, h, a)
    }

    /**
     * @param {number} amount - percentage between 0 and 1.
     */
    darken(amount) {
        let [l, c, h, a] = this
        return Colour.of(l * amount, c, h, a)
    }

    /**
     * @param {number} amount - percentage between 0 and 1.
     */
    lighten(amount) {
        let [l, c, h, a] = this
        return Colour.of(l + (1 - l) * amount, c, h, a)
    }

    palette() {
        /* TODO: Returns basic colour palettes, with a few options.
           Triad, monochrome, analogous, complementary, shades ( 50, 100, 200... 900, 950 )
        */
    }

    #convertColourspace(colour, type, f, toOklab = type == 'oklab') {
        let [c1, c2] = [[...this], [...colour]].map(toOklab ? oklchToOklab : id)

        let out = f(c1, c2).map(c =>
            toOklab ? Colour.of(...oklabToOklch(c)) : Colour.of(...c),
        )

        return out.length == 1 ? out[0] : out
    }

    /**
     * @param {Colour} colour - the color to interpolate to
     * @param {int} [steps]
     * @param {string} [colourspace] - 'oklab' converts to oklab space for interpolation
     * @param {function} [interpolator] - a function accepting a, b, t as parameters
     * @returns {Colour[]}
     */

    steps(colour, steps = 1, colourspace = 'oklab', interpolator = lerp) {
        return this.#convertColourspace(colour, colourspace, (c1, c2) =>
            times(steps + 2, i =>
                c1.map((v, ii) =>
                    interpolator(v, c2[ii], (1 / (steps + 1)) * i),
                ),
            ),
        )
    }

    /**
     * @param {Colour} colour - the color to interpolate to
     * @param {string} [colourspace] - 'oklab' converts to oklab space for interpolation
     * @param {function} [interpolator] - a function accepting a, b, t as parameters
     * @returns {function} an interpolator taking a 't' value
     */

    getInterpolator(colour, colourspace = 'oklab', interpolator = lerp) {
        return t =>
            this.#convertColourspace(colour, colourspace, (c1, c2) => [
                c1.map((v, i) => interpolator(v, c2[i], t)),
            ])
    }

    /**
     * @param {Colour} colour - the color to mix with
     * @param {number} [percent] - value between 0 and 1
     * @param {string} [colourspace] - 'oklab' converts to oklab space for interpolation
     * @param {function} [interpolator] - a function accepting a, b, t as parameters
     * @returns {Colour[]}
     */

    mix(colour, percent = 0.5, colourspace = 'oklab', interpolator = lerp) {
        return this.#convertColourspace(colour, colourspace, (c1, c2) => [
            c1.map((v, i) => interpolator(v, c2[i], percent)),
        ])
    }

    /**
     * @param  {...any} args - same signature as Colour constructor
     * @returns {Colour}
     */

    static of(...args) {
        return new Colour(...args)
    }
}
