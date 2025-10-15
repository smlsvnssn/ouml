import { normalise, pipe, warn } from '../ouml.mjs'

export const getNumbers = s => s.match(/([0-9\.])+/g).map(v => Number(v))

export const parseToRgb = c => {
    c = c.trim()

    // is hex
    if (/^#/.test(c)) {
        let rgba = Array.from(c)
            .slice(1) // remove #
            .flatMap((v, i, a) =>
                a.length <= 4 ? [Number('0x' + v + v)]
                : i % 2 ? []
                : [Number('0x' + v + a[i + 1])],
            )

        // fix alpha
        if (rgba.length === 4) rgba[3] /= 255

        return rgba
    }

    // is rgb/rgba
    if (/^rgb\(|^rgba\(/.test(c)) {
        if (/%/.test(c))
            return getNumbers(c).map((v, i) =>
                i < 3 ? Math.round((v / 100) * 255) : v,
            )
        return getNumbers(c)
    }

    // is hsl/hsla
    if (/^hsl\(|^hsla\(/.test(c)) {
        let [h, s, l, alpha] = getNumbers(c)

            return [...hslToRgb([h, s, l]), alpha]
    }

    return warn("Colour says: Sorry, can't parse " + c), [0, 0, 0]
}

export const normaliseRgba = ([r, g, b, a]) => [
    r / 255,
    g / 255,
    b / 255,
    a ?? 1,
]

// taken from https://github.com/color-js/color.js/blob/main/src/spaces/oklch.js

const multiplyMatrices = (A, B) => [
    A[0] * B[0] + A[1] * B[1] + A[2] * B[2],
    A[3] * B[0] + A[4] * B[1] + A[5] * B[2],
    A[6] * B[0] + A[7] * B[1] + A[8] * B[2],
]

const rgbToSrgbLinear = rgb =>
    rgb.map(c =>
        Math.abs(c) <= 0.04045 ?
            c / 12.92
        :   (c < 0 ? -1 : 1) * ((Math.abs(c) + 0.055) / 1.055) ** 2.4,
    )

const srgbLinearToXyz = rgb =>
    multiplyMatrices(
        [
            0.41239079926595934, 0.357584339383878, 0.1804807884018343,
            0.21263900587151027, 0.715168678767756, 0.07219231536073371,
            0.01933081871559182, 0.11919477979462598, 0.9505321522496607,
        ],
        rgb,
    )

const xyzToOklab = xyz => {
    const LMS = multiplyMatrices(
        [
            0.819022437996703, 0.3619062600528904, -0.1288737815209879,
            0.0329836539323885, 0.9292868615863434, 0.0361446663506424,
            0.0481771893596242, 0.2642395317527308, 0.6335478284694309,
        ],
        xyz,
    )
    const LMSg = LMS.map(val => Math.cbrt(val))
    return multiplyMatrices(
        [
            0.210454268309314, 0.7936177747023054, -0.0040720430116193,
            1.9779985324311684, -2.4285922420485799, 0.450593709617411,
            0.0259040424655478, 0.7827717124575296, -0.8086757549230774,
        ],
        LMSg,
    )
}

export const oklchToOklab = ([l, c, h, alpha]) => [
    l,
    c * Math.cos((h * Math.PI) / 180),
    c * Math.sin((h * Math.PI) / 180),
    alpha,
]
export const oklabToOklch = ([l, a, b, alpha]) => [
    l,
    Math.hypot(a, b),
    ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360,
    alpha,
]

export const rgbToOklch = ([r, g, b, a]) =>
    pipe(
        [r, g, b],
        rgbToSrgbLinear,
        srgbLinearToXyz,
        xyzToOklab,
        v => [...v, a],
        oklabToOklch,
    )

const hslToRgb = ([h, s, l]) => {
    s /= 100
    l /= 100

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2

    let [r, g, b] =
        0 <= h && h < 60 ? [c, x, 0]
        : 60 <= h && h < 120 ? [x, c, 0]
        : 120 <= h && h < 180 ? [0, c, x]
        : 180 <= h && h < 240 ? [0, x, c]
        : 240 <= h && h < 300 ? [x, 0, c]
        : 300 <= h && h < 360 ? [c, 0, x]
        : 0

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return [r, g, b]
}
