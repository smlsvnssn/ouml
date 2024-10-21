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
    easeOut,
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

export function Colour() {}

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

    const throughSpace = (clr, type, f, toOklab = type == 'oklab') => {
        let [c1, c2] =
            isArr(clr) ? [[...clr[0]], [...clr[1]]] : [[l, c, h, a], [...clr]]

        ;[c1, c2] = [c1, c2].map(toOklab ? oklchToOklab : id)

        let out = f(c1, c2).map(c =>
            toOklab ? colour(...oklabToOklch(c)) : colour(...c),
        )

        return out.length == 1 ? out[0] : out
    }

    // if (isStr(lightness)) {
    //     if (/^oklch\(/.test(lightness))
    //         set(getNumbers(lightness).map((v, i) => (i == 0 ? v / 100 : v)))
    //     else pipe(lightness, parseToRgb, normaliseRgba, rgbToOklch, set)
    // } else if (isColour(lightness)) set(lightness)
    // else set([lightness, chroma, hue, alpha])

    set(
        isStr(lightness) ?
            /^oklch\(/.test(lightness) ?
                getNumbers(lightness).map((v, i) => (i == 0 ? v / 100 : v))
            :   pipe(lightness, parseToRgb, normaliseRgba, rgbToOklch)
        : isColour(lightness) ? lightness
        : [lightness, chroma, hue, alpha],
    )

    let o = {
        lightness: _l =>
            isFunc(_l) ? colour(_l(l), c, h, a)
            : isNum(_l) ? colour(_l, c, h, a)
            : l,

        chroma: _c =>
            isFunc(_c) ? colour(l, _c(c), h, a)
            : isNum(_c) ? colour(l, _c, h, a)
            : c,

        hue: _h =>
            isFunc(_h) ? colour(l, c, _h(h), a)
            : isNum(_h) ? colour(l, c, _h, a)
            : h,

        alpha: _a =>
            isFunc(_a) ? colour(l, c, h, _a(a))
            : isNum(_a) ? colour(l, c, h, _a)
            : a,

        [Symbol.iterator]: function* () {
            for (let v of [l, c, h, a]) yield v
        },

        valueOf: () => ({
            lightness: l,
            chroma: c,
            hue: h,
            alpha: a,
        }),

        toString: () =>
            `oklch(${round(l * 100, 4)}% ${round(c, 4)} ${round(h, 4)} / ${round(a, 4)})`,

        complement: () => colour(l, c, (h + 180) % 360, a),

        invert: () => colour(1 - l, c, h, a).complement(),

        darken: (amount = 0.1) => colour(l - (1 - l) * amount, c, h, a),

        lighten: (amount = 0.1) => colour(l + (1 - l) * amount, c, h, a),

        palette: (colourspace = 'oklab', interpolator = lerp) => {
            /* TODO: Returns basic colour palettes, with a few options.
           Triad, monochrome, analogous, complementary, shades ( 50, 100, 200... 900, 950 )
        */
            log(c, h, a)

            return throughSpace(
                [colour(0.97, c / 3, h, a), colour(0.03, c, h, a)],
                colourspace,
                (c1, c2) =>
                    times(11, i =>
                        c1.map((v, ii) =>
                            ii == 1 ?
                                easeOut(v, c2[ii], (1 / 10) * i)
                            :   lerp(v, c2[ii], (1 / 10) * i),
                        ),
                    ),
            )
        },

        steps: (clr, steps = 1, colourspace = 'oklab', interpolator = lerp) =>
            throughSpace(
                isStr(clr) ? colour(clr) : clr,
                colourspace,
                (c1, c2) =>
                    times(steps + 2, i =>
                        c1.map((v, ii) =>
                            interpolator(v, c2[ii], (1 / (steps + 1)) * i),
                        ),
                    ),
            ),

        mix: (clr, percent = 0.5, colourspace = 'oklab', interpolator = lerp) =>
            throughSpace(
                isStr(clr) ? colour(clr) : clr,
                colourspace,
                (c1, c2) => [c1.map((v, i) => interpolator(v, c2[i], percent))],
            ),

        getInterpolator: (clr, colourspace = 'oklab', interpolator = lerp) => {
            let c1 = colour(l, c, h, a)
            return t => c1.mix(clr, t, colourspace, interpolator)
        },
    }

    Object.setPrototypeOf(o, proto)
    return Object.freeze(o)
}

export default colour

//time(() => times(10000, () => colour()))
