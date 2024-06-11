export const multiplyMatrices = (A, B) => [
    A[0] * B[0] + A[1] * B[1] + A[2] * B[2],
    A[3] * B[0] + A[4] * B[1] + A[5] * B[2],
    A[6] * B[0] + A[7] * B[1] + A[8] * B[2],
]

export const oklch2oklab = ([l, c, h]) => [
    l,
    isNaN(h) ? 0 : c * Math.cos((h * Math.PI) / 180),
    isNaN(h) ? 0 : c * Math.sin((h * Math.PI) / 180),
]
export const oklab2oklch = ([l, a, b]) => [
    l,
    Math.sqrt(a ** 2 + b ** 2),
    Math.abs(a) < 0.0002 && Math.abs(b) < 0.0002 ?
        NaN
    :   ((((Math.atan2(b, a) * 180) / Math.PI) % 360) + 360) % 360,
]

export const rgb2srgbLinear = (rgb) =>
    rgb.map((c) =>
        Math.abs(c) <= 0.04045 ?
            c / 12.92
        :   (c < 0 ? -1 : 1) * ((Math.abs(c) + 0.055) / 1.055) ** 2.4,
    )
export const srgbLinear2rgb = (rgb) =>
    rgb.map((c) =>
        Math.abs(c) > 0.0031308 ?
            (c < 0 ? -1 : 1) * (1.055 * Math.abs(c) ** (1 / 2.4) - 0.055)
        :   12.92 * c,
    )

export const oklab2xyz = (lab) => {
    const LMSg = multiplyMatrices(
        [
            1, 0.3963377773761749, 0.2158037573099136, 1, -0.1055613458156586,
            -0.0638541728258133, 1, -0.0894841775298119, -1.2914855480194092,
        ],
        lab,
    )
    const LMS = LMSg.map((val) => val ** 3)
    return multiplyMatrices(
        [
            1.2268798758459243, -0.5578149944602171, 0.2813910456659647,
            -0.0405757452148008, 1.112286803280317, -0.0717110580655164,
            -0.0763729366746601, -0.4214933324022432, 1.5869240198367816,
        ],
        LMS,
    )
}
export const xyz2oklab = (xyz) => {
    const LMS = multiplyMatrices(
        [
            0.819022437996703, 0.3619062600528904, -0.1288737815209879,
            0.0329836539323885, 0.9292868615863434, 0.0361446663506424,
            0.0481771893596242, 0.2642395317527308, 0.6335478284694309,
        ],
        xyz,
    )
    const LMSg = LMS.map((val) => Math.cbrt(val))
    return multiplyMatrices(
        [
            0.210454268309314, 0.7936177747023054, -0.0040720430116193,
            1.9779985324311684, -2.4285922420485799, 0.450593709617411,
            0.0259040424655478, 0.7827717124575296, -0.8086757549230774,
        ],
        LMSg,
    )
}
export const xyz2rgbLinear = (xyz) => {
    return multiplyMatrices(
        [
            3.2409699419045226, -1.537383177570094, -0.4986107602930034,
            -0.9692436362808796, 1.8759675015077202, 0.04155505740717559,
            0.05563007969699366, -0.20397695888897652, 1.0569715142428786,
        ],
        xyz,
    )
}
export const rgbLinear2xyz = (rgb) => {
    return multiplyMatrices(
        [
            0.41239079926595934, 0.357584339383878, 0.1804807884018343,
            0.21263900587151027, 0.715168678767756, 0.07219231536073371,
            0.01933081871559182, 0.11919477979462598, 0.9505321522496607,
        ],
        rgb,
    )
}

//export const oklch2rgb = (lch) =>
//   srgbLinear2rgb(xyz2rgbLinear(oklab2xyz(oklch2oklab(lch))))
export const rgb2oklch = (rgb) =>
    oklab2oklch(xyz2oklab(rgbLinear2xyz(rgb2srgbLinear(rgb))))

// taken from https://github.com/color-js/color.js/blob/main/src/spaces/oklch.js
// be aware, that oklch2rgb might return values out of bounds. I believe you should clamp them?
// also for gray colors, hue would be NaN

console.log(rgb2oklch([255, 255, 254]))

import { createElement, toHsla, hsla } from '../ö.mjs'

// from https://codepen.io/smlsvnssn/pen/dyQaQvp?editors=0011
let clrEl

const colorspaces = {
    oklch: ['l', 'c', 'h', 'a'],
    lch: ['l', 'c', 'h', 'a'],
    oklab: ['l', 'a', 'b', 'a'],
    lab: ['l', 'a', 'b', 'a'],
}

const mountClrEl = () => {
    const e = createElement('<span id=ö_color-mix>')
    e.style.display = 'none'
    document.body.appendChild(e)
    return e
}

const clrToObj = (clr) => {
    const clrArr = clr.match(/([a-z0-9\.\-])+/g)

    // Throw all srgb variants into hsl conversion
    if (clrArr[0] === 'color')
        return {
            type: 'hsl',
            ...toHsla(
                `rgb(${clrArr[2] * 255} ${clrArr[3] * 255} ${clrArr[4] * 255} / ${
                    clrArr[5] || 1
                })`,
            ),
        }

    const clrObj = clrArr.reduce((acc, v, i, a) => {
        if (i === 0) {
            acc.type = v
            return acc
        }
        acc[colorspaces[a[0]][i - 1]] = +v
        return acc
    }, {})

    // Add default alpha
    clrObj.a ??= 1

    return clrObj
}

const objToClr = (clrObj) => {
    const v = Object.values(clrObj)
    if (v[0] === 'hsl')
        return `${v[0]}(${v[1]} ${v[2]}% ${v[3]}% / ${v[4] || 1})`
    return `${v[0]}(${v[1]} ${v[2]} ${v[3]} / ${v[4] || 1})`
}

const colorMix = (
    clr1,
    clr2,
    percent1 = 50,
    percent2 = 50,
    colorspace = 'oklab',
    asString = false,
) => {
    clrEl ??= mountClrEl()
    clrEl.style.color = `color-mix(in ${colorspace}, ${clr1} ${percent1}%, ${clr2} ${percent2}%)`
    return asString ?
            getComputedStyle(clrEl).color
        :   clrToObj(getComputedStyle(clrEl).color)
}

const toOklch = (clr) => colorMix(clr, clr, 100, 100, 'oklch')
const toOklab = (clr) => colorMix(clr, clr, 100, 100, 'oklab')

toOklch()
