import * as ö from './ö.mjs'
ö.log(`
---
`)

ö.log(ö.toHsla('hsl(360, 10%, 90%)'))
ö.log(ö.createEnum(['a', 'b', 'c']))
ö.log(({ a: { b: { c: {} } } }.a.b.c.test = '?'))

ö.log(`
---
`)
