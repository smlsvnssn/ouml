import { isNum, is, clamp } from '../ouml.mjs'

const springStep = (
    value,
    target,
    prevValue = value,
    deltaTime = 1 / 60,
    { stiffness = 0.5, damping = 0.05, mass = 1, precision = 0.1 } = {},
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

const mapObj = (obj, f) => Object.fromEntries(Object.entries(obj).map(f))

class Spring {
    constructor(current, callback, settings = {}) {
        this.currentValues = this.#formatInput(current)
        this.callback = callback
        this.settings = this.#validateSettings(settings)
    }

    #isRawValue = false
    #prevValues
    #prevTime
    #promise
    #resolver
    running

    #validateSettings(settings) {
        if (is(settings.stiffness))
            settings.stiffness = clamp(settings.stiffness, 0, 1)
        if (is(settings.damping))
            settings.damping = clamp(settings.damping, 0, 1)

        return settings
    }

    #formatInput(v) {
        // allow plain number as input
        if (isNum(v)) {
            this.#isRawValue = true
            v = { value: v }
        }
        return v
    }

    setTarget(target) {
        this.targetValues = this.#formatInput(target)

        if (!this.running) {
            this.running = true
            this.#animate()
        }

        if (!this.#promise)
            this.#promise = new Promise(resolve => (this.#resolver = resolve))

        return this.#promise
    }

    #animate(dt) {
        let state = mapObj(this.currentValues, ([k, v]) => [
            k,
            springStep(
                this.currentValues[k],
                this.targetValues[k],
                this.#prevValues?.[k],
                dt,
                this.settings,
            ),
        ])

        this.#prevValues = this.currentValues
        this.#prevTime = Date.now()

        // convert state to raw values
        this.currentValues = mapObj(state, ([k, v]) => [k, v.value])
        this.callback(
            this.#isRawValue ? this.currentValues.value : this.currentValues,
        )

        if (isSettled(state)) {
            this.running = false
            this.#resolver?.('settled')
            this.#prevTime =
                this.#prevValues =
                this.#promise =
                this.#resolver =
                    undefined

            return
        }

        requestAnimationFrame(() =>
            this.#animate((Date.now() - this.#prevTime) / 1000 || 1 / 60),
        )
    }
}

// factory
export const spring = (current, callback, settings = {}) =>
    new Spring(current, callback, settings)
