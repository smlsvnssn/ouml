import { clamp, range, is, isArr, isStr, attempt } from '../ouml.mjs'

class Bits {
    /**
     * @param {bigint} b
     */

    constructor(b) {
        this.#b = b
    }

    #b

    /**
     * @param {number} index
     * @param {boolean} asBool
     */

    get(index, asBool = false) {
        index = BigInt(index)
        let v = (this.#b & (1n << index)) >> index

        return asBool ? Boolean(v) : Number(v)
    }

    /**
     * @param {number} index
     * @param {number} value
     * @returns {Bits}
     */

    // thx https://lucasfcosta.com/2018/12/25/bitwise-operations.html

    set(index, value = 1) {
        if (!value) return this.clear(index)
        this.#b = this.#b | (1n << BigInt(index))
        return this
    }

    /**
     * @param {number} index
     * @returns {Bits}
     */

    flip(index) {
        this.#b = this.#b ^ (1n << BigInt(index))
        return this
    }

    /**
     * @param {number} index
     * @returns {Bits}
     */

    clear(index) {
        this.#b = this.#b & ~(1n << BigInt(index))
        return this
    }

    /**
     * @param {number} [start]
     * @param {number} [end]
     * @returns {Bits}
     */

    slice(start, end) {
        return bits(...this.range(start, end))
    }

    /**
     * @param {number} [start = 0]
     * @param {number} [end]
     */

    *range(start = 0, end) {
        let l = this.length
        start = clamp(start, 0, l)
        end = is(end) ? clamp(end, start, end) : l

        for (let i of range(start, end)) yield this.get(i)
    }

    *[Symbol.iterator]() {
        yield* this.range()
    }

    get length() {
        let i = (this.#b.toString(16).length - 1) * 4
        return i + 32 - Math.clz32(Number(this.#b >> BigInt(i)))

        // https://stackoverflow.com/questions/54758130/how-to-obtain-the-amount-of-bits-of-a-bigint
    }

    valueOf() {
        return this.#b
    }

    toString() {
        return this.#b.toString(2)
    }
}

/**
 * @param {string} s
 */

const parseStr = s => (/[^01]/.test(s) ? strangeBits() : parseInt(s, 2))

const strangeBits = () => {
    throw new TypeError('ö.bits says: Strange bits! Check your input.')
}

export const isBits = v => v instanceof Bits

/**
 * Returns Bits.
 * Takes array, string, args array, number, bigint or Bits
 * @param { number | bigint | string | any[] | Bits } value
 * @param { ...* } args
 * @returns {Bits}
 */

export const bits = (value = 0n, ...args) => {
    let v = args.length ? [value, ...args] : value

    v = attempt(
        () =>
            BigInt(
                isStr(v) ? parseStr(v)
                : isArr(v) ?
                    parseInt(v.map(v => Number(Boolean(v))).join(''), 2)
                :   v,
            ),
        strangeBits,
    )

    return Object.freeze(new Bits(v))
}

export default bits
