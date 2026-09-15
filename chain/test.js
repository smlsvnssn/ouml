import * as ö from '../ouml.mjs'
import chain, { _, chainAsync } from './index.mjs'
let o = { my: { deep: { path: 11 } } }
ö.time(
    () =>
        ö.times(100000, () =>
            chain(o)
                .my.deep.path()
                .Array()
                .keys()
                .map(v => v ** v)
                .sum()
                .toString()
                .length()(),
        ),
    'chain',
)

ö.time(
    () =>
        ö.times(
            100000,
            () =>
                ö
                    .sum(
                        Array(o.my.deep.path)
                            .keys()
                            .map(v => v ** v),
                    )
                    .toString().length,
        ),
    'vanilla',
)
