import * as ö from '../ö.mjs'
import { chain, chainAsync } from '../chain/index.mjs'
import jsdom from 'jsdom'

const { JSDOM } = jsdom
globalThis.window = new JSDOM(`...`).window
globalThis.document = window.document

chain(10)
    .times(v => v + 1)
    .log()()

ö.log(ö.times(10, v => v + 1))

let a = [0]
a[0] = a

ö.clone_test(a, true, false, true)