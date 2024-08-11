/**
 * Set operations
 */

/**
 * Intersect - Intersection, returns elements that are members of both `a` and `b`.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const intersect = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return [...A].filter(v => B.has(v))
}

/**
 * Subtract - Difference, returns members of `a` but not members of `b`, i.e. subtracts `b` from `a`.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const subtract = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return [...A].filter(v => !B.has(v))
}

/**
 * Exclude - Symmetric difference, returns elements that are members of `a` or `b`, but not both.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const exclude = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return [...[...A].filter(v => !B.has(v)), ...[...B].filter(v => !A.has(v))]
}

/**
 * Union - Returns (unique) members of both `a` and `b`.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {Array}
 */

export const union = (a, b) => [...new Set([...a, ...b])]

/**
 * IsSubset - Returns `true` if `a` is a subset of `b`.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */

export const isSubset = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return A.size <= B.size && [...A].every(v => B.has(v))
}

/**
 * IsSuperset - Returns `true` if `a` is a superset of `b`.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */

export const isSuperset = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return A.size >= B.size && [...B].every(v => A.has(v))
}

/**
 * IsDisjoint - Returns `true` if `a` and `b` share no members.
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */

export const isDisjoint = (a, b) => {
    let [A, B] = [new Set(a), new Set(b)]
    return [...A].every(v => !B.has(v))
}
