//
// Custom events
//
/* 
Usage:
<element use:clickoutside on:clickoutside={callback}></element>
*/

import { data, between } from '../ö.mjs'

//
// resize
//
let resizeObs

const sizeChange = (entries) => {
    for (const entry of entries)
        entry.target.dispatchEvent(
            new CustomEvent('resize', { detail: { entry } }),
        )
}

const observeResize = (element) => {
    resizeObs ??= new ResizeObserver(sizeChange)
    resizeObs.observe(element)
}

const unobserveResize = (element) => {
    resizeObs.unobserve(element)
}

/**
 * resize
 * @param {Element} node 
 * @returns {{destroy: function}}
 */

export const resize = (node) => {
    observeResize(node)

    return {
        destroy() {
            unobserveResize(node)
        },
    }
}

//
// enterview, exitview
//
let enteredview, exitedview

const viewChange = (entries) => {
    for (const entry of entries)
        entry.target.dispatchEvent(
            new Event(entry.isIntersecting ? 'enterview' : 'exitview'),
        )
}

const observeView = (eventType) => (element) => {
    if (eventType === 'enterview') {
        enteredview ??= new IntersectionObserver(viewChange)
        enteredview.observe(element)
    } else {
        exitedview ??= new IntersectionObserver(viewChange)
        exitedview.observe(element)
    }
}

const unobserveView = (eventType) => (element) => {
    if (eventType === 'enterview') enteredview.unobserve(element)
    else exitedview.unobserve(element)
}

/**
 * enterview
 * @param {Element} node 
 * @returns {{destroy: function}}
 */

export const enterview = (node) => {
    observeView('enterview')(node)

    return {
        destroy() {
            unobserveView('enterview')(node)
        },
    }
}

/**
 * exitview
 * @param {Element} node 
 * @returns {{destroy: function}}
 */

export const exitview = (node) => {
    observeView('exitview')(node)

    return {
        destroy() {
            unobserveView('exitview')(node)
        },
    }
}

//
// sticktotop, sticktobottom, inspired by https://css-tricks.com/an-explanation-of-how-the-intersection-observer-watches/
//
let stickToTop, stickToBottom

const stickyChange = (eventType) => (entries) => {
    for (const entry of entries)
        entry.target.dispatchEvent(
            new CustomEvent(eventType, {
                detail: { sticky: entry.isIntersecting ? true : false },
            }),
        )
}

const stickyOptions = (eventType) => ({
    root: document,
    rootMargin:
        eventType === 'sticktotop' ? '0px 0px -100% 0px' : '-100% 0px 0px 0px',
    threshold: 0,
})

const observeSticky = (eventType) => (element) => {
    if (eventType === 'sticktotop') {
        stickToTop ??= new IntersectionObserver(
            stickyChange(eventType),
            stickyOptions(eventType),
        )
        stickToTop.observe(element)
    } else {
        stickToBottom ??= new IntersectionObserver(
            stickyChange(eventType),
            stickyOptions(eventType),
        )
        stickToBottom.observe(element)
    }
}

const unobserveSticky = (eventType) => (element) => {
    if (eventType === 'sticktotop') stickToTop.unobserve(element)
    else stickToBottom.unobserve(element)
}

/**
 * sticktotop
 * @param {Element} node 
 * @returns {{destroy: function}}
 */

export const sticktotop = (node) => {
	observeSticky('sticktotop')(node)
	
    return {
        destroy() {
            unobserveSticky('sticktotop')(node)
        },
    }
}

/**
 * sticktobottom
 * @param {Element} node 
 * @returns {{destroy: function}}
 */

export const sticktobottom = (node) => {
	observeSticky('sticktobottom')(node)
	
    return {
        destroy() {
            unobserveSticky('sticktobottom')(node)
        },
    }
}

//
// clickoutside
//
const clickOutsideListeners = new Set()

const clickOutside = (e) => {
    for (const element of clickOutsideListeners) {
        if (!element.contains(e.target))
            element.dispatchEvent(new Event('clickoutside'))
    }
}

const observeClickOutside = (element) => {
    clickOutsideListeners.size ||
        document.addEventListener('click', clickOutside)
    clickOutsideListeners.add(element)
}

const unobserveClickOutside = (element) => {
    clickOutsideListeners.delete(element)
    clickOutsideListeners.size ||
        document.removeEventListener('click', clickOutside)
}

/**
 * clickoutside
 * @param {Element} node 
 * @returns {{destroy: function}}
 */

export const clickoutside = (node) => {
	observeClickOutside(node)
	
    return {
        destroy() {
            unobserveClickOutside(node)
        },
    }
}

//
// swipe, based on https://github.com/scriptex/touchsweep/blob/master/src/touchsweep.js
//
// TODO: Rewrite to not trigger on touchend, but whenever threshold is reached in whichever direction. Enable threshold as argument
const swipeThreshold = 30

const onTouchStart = (element) => (e) =>
    // save start coords
    data(element, 'ce_onSwipeStart', [
        e.changedTouches[0].screenX,
        e.changedTouches[0].screenY,
	])
	
const onTouchEnd = (element, eventType) => (e) => {
    let [startX, startY] = data(element, 'ce_onSwipeStart'),
        [endX, endY] = [
            e.changedTouches[0].screenX,
            e.changedTouches[0].screenY,
        ],
        π = Math.PI,
        θ = Math.atan2(endY - startY, endX - startX),
        r = Math.hypot(endX - startX, endY - startY),
        event =
            r > swipeThreshold ?
                between(θ, -π * 0.25, π * 0.25) ? 'swiperight'
                : between(θ, π * 0.25, π * 0.75) ? 'swipedown'
                : between(θ, -π * 0.75, -π * 0.25) ? 'swipeup'
                : 'swipeleft'
            :   null

    if (event === eventType) element.dispatchEvent(new Event(event))
}

const observeSwipe = (eventType) => (element) => {
    // closure for reference to element
	let listeners = [onTouchStart(element), onTouchEnd(element, eventType)]
	
    // save reference to listeners
	data(element, 'ce_listeners', listeners)
	
    element.addEventListener('touchstart', listeners[0])
    element.addEventListener('touchend', listeners[1])
}

const unobserveSwipe = (eventType) => (element) => {
	let listeners = data(element, 'ce_listeners')
	
    element.removeEventListener('touchstart', listeners[0])
    element.removeEventListener('touchend', listeners[1])
}

/**
 * swipe
 * @param {Element} node 
 * @returns {{destroy: function}}
 */

export const swipe = (node) => {
    observeSwipe('swipeleft')(node)
    observeSwipe('swiperight')(node)
    observeSwipe('swipeup')(node)
	observeSwipe('swipedown')(node)
	
    return {
        destroy() {
            unobserveSwipe('swipeleft')(node)
            unobserveSwipe('swiperight')(node)
            unobserveSwipe('swipeup')(node)
            unobserveSwipe('swipedown')(node)
        },
    }
}
