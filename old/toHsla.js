/**
 * ToHsla - converts a css colour to hsla
 * @param {string} c
 * @param {boolean} [asString]
 * @returns {(string | { type:string, h: number, s: number, l: number, a: number})}
 */

export const toHsla = (c, asString = false, warn = true) => {
    const getNumbers = s => s.match(/([0-9\.])+/g).map(v => Number(v))
    let rgba, h, s, l, r, g, b, alpha

    c = c.trim()

    //
    // Parse
    //

    // is hex
    if (/^#/.test(c)) {
        rgba = Array.from(c)
            .slice(1) // remove #
            .flatMap((v, i, a) =>
                a.length <= 4 ? [Number('0x' + v + v)]
                : i % 2 ? []
                : [Number('0x' + v + a[i + 1])],
            )

        // fix alpha
        if (rgba.length === 4) rgba[3] / 255
    }

    // is rgb/rgba
    else if (/^rgb\(|^rgba\(/.test(c)) {
        rgba = getNumbers(c)

        if (/%/.test(c))
            rgba = rgba.map((v, i) => (i < 3 ? Math.round((v / 100) * 255) : v))
    }

    // is hsl/hsla
    else if (/^hsl\(|^hsla\(/.test(c)) {
        ;[h, s, l, alpha] = getNumbers(c)

        alpha ??= 1
    } else {
        return warn ? (warn("Sorry, can't parse " + c), null) : null
    }

    //
    // Convert
    //

    if (rgba) {
        // add default alpha if needed
        if (rgba.length === 3) rgba.push(1)
        ;[r, g, b, alpha] = rgba.map((v, i) => (i < 3 ? v / 255 : v))

        // Adapted from https://css-tricks.com/converting-color-spaces-in-javascript/
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin

        // prettier-ignore
        h = (round(
                (delta === 0 ? 0
                : cmax === r ? ((g - b) / delta) % 6
                : cmax === g ? (b - r) / delta + 2
                : /*cmax  === b*/ (r - g) / delta + 4) * 60,
            ) + 360) % 360 // prevent negatives

        l = (cmax + cmin) / 2
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

        // sanitize
        s = round(s * 100, 2)
        l = round(l * 100, 2)
        alpha = round(alpha, 2)
    }

    let out = { type: 'hsl', h, s, l, alpha }
    return asString ? colourToStr(out) : out
}
