// // @ts-check

import { isNum, is, clamp, isObj } from '../ouml.mjs'

const defaultSettings = {
    stiffness: 0.1,
    damping: 0.5,
    mass: 1,
    precision: 0.1,
}

/**
 * springStep - Calculates step for single value.
 * @param { number } value
 * @param { number } target
 * @param { { stiffness: number, damping: number, mass: number, precision: number } } settings
 * @param { number } [prevValue]
 * @param { number } [deltaTime] - In ratio of 1 / 60 s.
 * @returns { {value: number, settled: boolean} }
 */

const springStep = (
    value,
    target,
    { stiffness, damping, mass, precision },
    prevValue = value,
    deltaTime = 1,
) => {
    let delta = target - value
    let velocity = (value - prevValue) / (deltaTime || Number.EPSILON) // no / 0
    let spring = stiffness * delta
    let damp = damping * velocity
    let acceleration = (spring - damp) * (1 / mass)
    let d = (velocity + acceleration) * deltaTime

    return {
        value: value + d,
        settled: Math.abs(d) < precision && Math.abs(delta) < precision,
    }
}

const everyInObj = (obj, f) => Object.values(obj).every(f)
const mapObj = (obj, f) => Object.fromEntries(Object.entries(obj).map(f))

const isSettled = state => everyInObj(state, v => v.settled)
const isAllNum = input => everyInObj(input, isNum)

const baseFR = 60
const lowestFR = 15
// deltaTime as ratio of base framerate
const getDeltaTime = (now, pt) => {
    let mspt = now - pt || 1000 / baseFR
    mspt = Math.min(mspt, 1000 / lowestFR) // Cap at lowestFR
    return (mspt * baseFR) / 1000 || 1
}

const validateSettings = settings => ({
    ...defaultSettings,
    ...settings,
    ...(is(settings.stiffness) ?
        { stiffness: clamp(settings.stiffness, 0, 1) }
    :   {}),
    ...(is(settings.damping) ? { damping: clamp(settings.damping, 0, 1) } : {}),
    ...(is(settings.mass) ? { mass: clamp(settings.mass, 0.1, 1000) } : {}),
})

class Spring {
    /**
     * @param { SpringValue } current
     * @param { (v: SpringValue, s: Spring) => void } callback
     * @param { { stiffness?: number, damping?: number, mass?: number, precision?: number } } [settings]
     */

    constructor(current, callback, settings = {}) {
        this.#currentValue = this.#formatInput(current)
        this.#callback = callback
        this.#settings = validateSettings(settings)
    }

    #currentValue
    #targetValue
    #prevValue
    #prevTime
    #settings
    #callback

    #isRawValue = false
    #promise
    #resolver

    #formatInput(v) {
        if ((!isObj(v) && !isNum(v)) || !isAllNum(v))
            throw new TypeError(
                'Current and target must be either a number, or an object with properties containing numbers.',
            )

        // allow plain number as input
        if (isNum(v)) {
            this.#isRawValue = true
            return { value: v }
        }
        return v
    }

    #reset() {
        // return exact target value on last call
        this.#callback(
            this.#isRawValue ? this.#targetValue.value : this.#targetValue,
            this,
        )

        this.#resolver(this.#targetValue)

        this.#prevTime =
            this.#prevValue =
            this.#promise =
            this.#resolver =
                undefined
    }

    #animate() {
        let now = Date.now()
        let state = mapObj(this.#currentValue, ([k]) => [
            k,
            springStep(
                this.#currentValue[k],
                this.#targetValue[k],
                this.#settings,
                this.#prevValue?.[k],
                getDeltaTime(now, this.#prevTime),
            ),
        ])

        this.#prevValue = this.#currentValue
        this.#prevTime = now

        // convert state to raw values
        this.#currentValue = mapObj(state, ([k, v]) => [k, v.value])

        if (isSettled(state)) return this.#reset()

        this.#callback(
            this.#isRawValue ? this.#currentValue.value : this.#currentValue,
            this,
        )

        requestAnimationFrame(() => this.#animate())
    }

    get prevValue() {
        return { ...this.#prevValue }
    }

    get settings() {
        return { ...this.#settings }
    }
    set settings(value) {
        this.#settings = validateSettings(value)
    }

    /**
     * @param { SpringValue } target
     * @param { SpringValue } [prevValue]
     * @returns {Promise<string>}
     */

    setTarget(target, prevValue = this.#currentValue) {
        this.#targetValue = this.#formatInput(target)
        this.#prevValue = this.#formatInput(prevValue)

        if (!this.#promise) {
            this.#promise = new Promise(resolve => (this.#resolver = resolve))
            this.#animate()
        }

        return this.#promise
    }
}

/**
 * @typedef SpringValue A number or an object with properties containing numbers
 * @type {number | {}}
 */

/**
 * Returns Spring instance.
 * @param { SpringValue } current
 * @param { (v: SpringValue, spring: Spring) => void } callback
 * @param { { stiffness?: number, damping?: number, mass?: number, precision?: number } } [settings]
 * @returns {Spring}
 */

const spring = (current, callback, settings = {}) =>
    new Spring(current, callback, settings)

export default spring
