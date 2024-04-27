/* 
TODO:
Environment methods, ie isMobile, isTouchscreen, isHiResScreen, isDesktop, isServer etc
Extend lerp to accept any-dimensional numbers, and optional easing functions (https://github.com/AndrewRayCode/easing-utils)
db? Server part for secrets and relay?

multiply and convolve for arrays

√ include .observable in ö?
√ rewrite övents as svelte actions?
(√ kinda) partition as separate modules?

Beziers?
Cubic, Quadratic

Rework colour functions to include oklch and new css features (browser only? Use create element hack?)

√ Replace ö.clone with structuredClone? 
	TODO: include option to bypass prototype cloning (i.e. fast option)
https://developer.mozilla.org/en-US/docs/Web/API/structuredClone

*/

// based on https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
const hash = (str, seed = 0) => {
    const shift = (a, b) =>
        (Math.imul(a ^ (a >>> 16), 2246822507) ^
            Math.imul(b ^ (b >>> 13), 3266489909)) >>>
        0

    const format = (n) => n.toString(36).padStart(7, "0")

    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed

    for (let ch of str) {
        ch = ch.charCodeAt(0)
        h1 = Math.imul(h1 ^ ch, 2654435761)
        h2 = Math.imul(h2 ^ ch, 1597334677)
    }

    h1 = shift(h1, h2)
    h2 = shift(h2, h1)

    return format(h2) + format(h1)
}

import * as ö from "ouml"

ö.time(() => {
    let s =
        "jkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb bvffbbfbvfvbfvbfbfbvfbvfbvfbvfbvfbvhfbvbfdbfdbdfbdfbdbdbfdsfbdsbfdsbdsfdffbvbfvbfbvfhbvbfhvbfjkfjfjfjfjfjfjfjfjvjgfnjvfbjvfb "
    ö.times(100, () => {
        ö.log(hash(s))
        s = s.slice(1)
    })
})
