// // @ts-check

import { isNum, is, clamp, isObj } from '../ouml.mjs'

const defaultSettings = {
    stiffness: 0.5,
    damping: 0.5,
    mass: 1,
    precision: 0.1,
}

/**
 * springStep - Calculates step for single value.
 * @param { number } value
 * @param { number } target
 * @param { number } [prevValue]
 * @param { number } [deltaTime] - In seconds
 * @param { { stiffness?: number, damping?: number, mass?: number, precision?: number } } [settings]
 * @returns {{value: number, settled: boolean}}
 */

const springStep = (
    value,
    target,
    prevValue = value,
    deltaTime = 1 / 60,
    {
        stiffness = defaultSettings.stiffness,
        damping = defaultSettings.damping,
        mass = defaultSettings.mass,
        precision = defaultSettings.precision,
    } = {},
) => {
    let delta = target - value
    let velocity = (value - prevValue) / (deltaTime || Number.EPSILON) // no / 0
    let spring = stiffness * delta
    let damp = damping * velocity
    let acceleration = (spring - damp) * mass
    let d = (velocity + acceleration) * deltaTime

    return {
        value: value + d,
        settled: Math.abs(d) < precision && Math.abs(delta) < precision,
    }
}

const isSettled = state => Object.values(state).every(value => value.settled)
const isAllNum = input => Object.values(input).every(value => isNum(value))

const mapObj = (obj, f) => Object.fromEntries(Object.entries(obj).map(f))

const validateSettings = settings => ({
    ...defaultSettings,
    ...settings,
    ...(is(settings.stiffness) ?
        { stiffness: clamp(settings.stiffness, 0, 1) }
    :   {}),
    ...(is(settings.damping) ? { damping: clamp(settings.damping, 0, 1) } : {}),
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

    #running = false
    #isRawValue = false
    #promise
    #resolver

    #formatInput(v) {
        if ((!isObj(v) && !isNum(v)) || !isAllNum(v))
            throw new TypeError(
                'Input must be either a number, or an object with properties containing numbers',
            )

        // allow plain number as input
        if (isNum(v)) {
            this.#isRawValue = true
            v = { value: v }
        }
        return v
    }

    #reset() {
        this.#callback(
            this.#isRawValue ? this.#targetValue.value : this.#targetValue,
            this,
        )

        this.#running = false
        this.#resolver?.(this.#targetValue)
        this.#prevTime =
            this.#prevValue =
            this.#promise =
            this.#resolver =
                undefined
    }

    #animate() {
        let dt = (Date.now() - this.#prevTime) / 1000 || 1 / 60
        let state = mapObj(this.#currentValue, ([k]) => [
            k,
            springStep(
                this.#currentValue[k],
                this.#targetValue[k],
                this.#prevValue?.[k],
                dt,
                this.#settings,
            ),
        ])

        this.#prevValue = this.#currentValue
        this.#prevTime = Date.now()

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
     * @returns {Promise<string>}
     */

    
    setTarget(target) {
        this.#targetValue = this.#formatInput(target)

        if (!this.#running) {
            this.#running = true
            this.#animate()
        }

        if (!this.#promise)
            this.#promise = new Promise(resolve => (this.#resolver = resolve))

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
