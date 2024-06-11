import { isObj, round, warn } from 'ouml'

export const toHsla = (c, asString = false) => {
    let rgba, h, s, l, r, g, b, a

    c = c.trim()

    // Parse
    if (/^#/.test(c)) {
        // is hex
        rgba = Array.from(c)
            .slice(1) // remove #
            .flatMap(
                (v, i, a) =>
                    a.length <= 4 ? [Number('0x' + v + v)]
                    : i % 2 ?
                        [] // omitted by flatmap
                    :   [Number('0x' + v + a[i + 1])], // current + next
            )

        // fix alpha
        if (rgba.length === 4) rgba[3] / 255
    } else if (/^rgb\(|^rgba\(/.test(c)) {
        // is rgb/rgba
        rgba = c.match(/([0-9\.])+/g).map((v) => Number(v)) // Pluck the numbers

        if (/%/.test(c))
            // fix percent
            rgba = rgba.map((v, i) => (i < 3 ? Math.round((v / 100) * 255) : v))
    } else if (/^hsl\(|^hsla\(/.test(c)) {
        // is hsl/hsla
        ;[h, s, l, a] = c.match(/([0-9\.])+/g).map((v) => Number(v)) // Pluck the numbers

        a ??= 1
    } else {
        return warn("Sorry, can't parse " + c), null
    }

    // Convert
    if (rgba) {
        // add default alpha if needed
        if (rgba.length === 3)
            rgba.push(1)

            // Adapted from https://css-tricks.com/converting-color-spaces-in-javascript/
        ;[r, g, b, a] = rgba.map((v, i) => (i < 3 ? v / 255 : v))

        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin

        h =
            (round(
                (delta === 0 ? 0
                : cmax === r ? ((g - b) / delta) % 6
                : cmax === g ? (b - r) / delta + 2
                : /*cmax  === b*/ (r - g) / delta + 4) * 60,
            ) +
                360) %
            360 // prevent negatives
        l = (cmax + cmin) / 2
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

        // sanitize
        s = round(s * 100, 2)
        l = round(l * 100, 2)
        a = round(a, 2)
    }

    return asString ? hsla(h, s, l, a) : { h, s, l, a }
}

/*

toOklch = s' gonna be a monster

hex/rgba > lrgb/a (linear rgb, gamma correction removed) > oklab (cartesian) > oklch (polar)

https://github.com/Evercoder/culori/blob/main/src/lrgb/convertRgbToLrgb.js
https://github.com/Evercoder/culori/blob/main/src/oklab/convertLrgbToOklab.js
https://github.com/Evercoder/culori/blob/main/src/lch/convertLabToLch.js
https://bottosson.github.io/posts/oklab/


Optionally: use css's color-mix with shadow element. Potentially slow, browser only?
*/

export const hsla = (h, s = 70, l = 50, a = 1) => {
    if (isObj(h)) ({ h, s, l, a } = h)
    return `hsla(${h % 360}, ${s}%, ${l}%, ${a})`
}
