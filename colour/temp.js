/**
 * ColourToStr - converts a a Colour object to a valid css string.
 * @param { Colour } clrObj
 * @returns { string }
 */

export const colourToStr = clrObj => {
    let v = Object.values(clrObj)
    return v[0] === 'hsl' ?
            `${v[0]}(${v[1]} ${v[2]}% ${v[3]}% / ${v[4] ?? 1})`
        :   `${v[0]}(${v[1]} ${v[2]} ${v[3]} / ${v[4] ?? 1})`
}

let clrEl

const mountClrEl = () => {
    const e = createElement('<span id=ö_color-mix>')
    e.style.display = 'none'
    globalThis.document.body.appendChild(e)
    return e
}

/**
 * ColourMix - mixes valid css colours or Colour objects.
 * @param { string | Colour } clr1
 * @param { string | Colour } clr2
 * @param { number } [percent]
 * @param { string } [colourspace]
 * @param { boolean } [asString]
 * @returns { string | Colour }
 */

export const colourMix = (
    clr1,
    clr2,
    percent = 50,
    colourspace = 'oklab',
    asString = false,
) => {
    const toStr = c => (isStr(c) ? c : colourToStr(c))
    ;[clr1, clr2] = [toStr(clr1), toStr(clr2)]

    clrEl ??= mountClrEl()
    clrEl.style.color = `color-mix(in ${colourspace}, ${clr1} ${percent}%, ${clr2} ${100 - percent}%)`

    let out = globalThis.getComputedStyle(clrEl).color

    return asString ? out : strToColour(out)
}

export const toOklch = (clr, asString = false) =>
    colourMix(clr, clr, 100, 'oklch', asString)

export const darken = (clr, percent, asString = false) =>
    colourMix('#000', clr, percent, 'oklab', asString)

export const lighten = (clr, percent, asString = false) =>
    colourMix('#fff', clr, percent, 'oklab', asString)


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

/**
 * StrToColour - converts a valid css colour to a Colour object.
 * @param { string } clrStr
 * @returns { null | Colour }
 */

export const strToColour = clrStr => {
    const colourspaces = {
        oklch: ['l', 'c', 'h', 'alpha'],
        lch: ['l', 'c', 'h', 'alpha'],
        oklab: ['l', 'a', 'b', 'alpha'],
        lab: ['l', 'a', 'b', 'alpha'],
    }

    // if toHsla can do it first try, let it
    let c = toHsla(clrStr, false, false)
    if (!isNull(c)) return c

    let clrArr = clrStr.match(/([a-z0-9\.\-])+/g)

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

    // Warn and return null if unsupported
    if (!colourspaces[clrArr[0]])
        return warn("Sorry, can't parse " + clrStr), null

    // Convert to appropriate colourspace
    const clrObj = clrArr.reduce((acc, v, i, a) => {
        if (i === 0) {
            acc.type = v
            return acc
        }
        acc[colourspaces[a[0]][i - 1]] = +v
        return acc
    }, {})

    // Add default alpha
    clrObj.alpha ??= 1

    return clrObj
}