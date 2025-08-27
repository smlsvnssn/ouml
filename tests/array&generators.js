import { describe, expect, it } from 'vitest'
import * as ö from '../ouml.mjs'

describe('ö.grid', () => {
    it('should yield objects with {x, y} values', () => {
        const result = ö.grid(1, 1).next().value

        expect(result).toMatchObject({ x: 0, y: 0 })
    })

    it('should be iterable', () => {
        const result = ö.grid(1, 1)[Symbol.iterator]

        expect(result).toEqual(expect.any(Function))
    })

    it('should yield a*b values', () => {
        const a = 10,
            b = 10,
            result = [...ö.grid(a, b)].length

        expect(result).toBe(a * b)
    })

    it('should use width as height if height is omitted', () => {
        const a = 10,
            result = [...ö.grid(a)].length

        expect(result).toBe(a ** 2)
    })

    it('should not work with negative values', () => {
        const a = -10,
            b = 10,
            result = [...ö.grid(a, b)].length

        expect(result).not.toBe(a * b)
    })
})

describe('ö.range', () => {
    it('should yield numbers in sequence up to but not including "end"', () => {
        let iterator = ö.range(2)
        let result = [iterator.next().value]
        result.push(iterator.next().value)
        result.push(iterator.next().value)

        expect(result).toMatchObject([0, 1, undefined])
    })

    it('should be able to count backwards', () => {
        let result = Array.from(ö.range(-3))

        expect(result).toMatchObject([0, -1, -2])
    })

    it('should increment in steps', () => {
        let result = Array.from(ö.range(0, 1, 0.33))

        expect(result).toMatchObject([0, 0.33, 0.66, 0.99])
    })

    it('should do number coercion', () => {
        let result = Array.from(ö.range(false, true, '0.33'))

        expect(result).toMatchObject([0, 0.33, 0.66, 0.99])
    })
})

describe('ö.times', () => {
    it('should call a function "times" times and return an array with results', () => {
        let result = ö.times(2, i => i)

        expect(result).toMatchObject([0, 1])
    })

    it('should handle rest arguments', () => {
        let result = ö.times(2, (i, factor) => i * factor, 2)

        expect(result).toMatchObject([0, 2])
    })

    it('should handle negative input gracefully', () => {
        let result = ö.times(-2, (i, factor) => i * factor, 2)

        expect(result).toMatchObject([0, 2])
    })

    it('should handle 0 as input gracefully', () => {
        let result = ö.times(0, (i, factor) => i * factor, 2)

        expect(result).toMatchObject([])
    })
})

describe('ö.map', () => {
    let s = Symbol()
    let testArr = [
        { a: 0, [s]: 's' },
        { a: 1, [s]: 's' },
        { a: 2, [s]: 's' },
    ]
    it('should return prop values from an array of objects given a string arg', () => {
        let result = ö.map(testArr, 'a')

        expect(result).toMatchObject([0, 1, 2])
    })

    it('should return prop values from an array of objects given a symbol arg', () => {
        let result = ö.map(testArr, s)

        expect(result).toMatchObject(['s', 's', 's'])
    })

    it('should return prop values from a map of objects given a string arg', () => {
        let result = ö.map(
            new Map([
                [1, { a: 0 }],
                [3, { a: 1 }],
            ]),
            'a',
        )

        expect(result).toMatchObject(
            new Map([
                [1, 0],
                [3, 1],
            ]),
        )
    })

    it('should return undefined if not given an iterable or an object', () => {
        expect(ö.map(null)).toBe(undefined)
        expect(ö.map(/0/)).toBe(undefined)
        expect(ö.map(1)).toBe(undefined)
        expect(ö.map(v => v)).toBe(undefined)
    })

    it('should map over Map', () => {
        let result = ö.map(
            new Map([
                [1, 2],
                [3, 4],
            ]),
            v => [v[0], v[1] ** 2],
        )

        expect(result).toMatchObject(
            new Map([
                [1, 4],
                [3, 16],
            ]),
        )
    })

    it('should map over String', () => {
        let result = ö.map('burk', v => v + ' ')

        expect(result).toEqual('b u r k ')
    })

    it('should map over Set', () => {
        let result = ö.map(new Set([1, 2, 3]), v => v + 1)

        expect(result).toMatchObject(new Set([2, 3, 4]))
    })

    it('should map over any object', () => {
        let result = ö.map({ a: 1, b: 2 }, ([key, v]) => [key, v + 1])

        expect(result).toStrictEqual({ a: 2, b: 3 })
    })

    it('should get a property from an object', () => {
        let result = ö.map({ a: 1, b: 2 }, 'a')

        expect(result).toStrictEqual(1)
    })
})

describe('ö.unique', () => {
    it('should return an array with unique items', () => {
        let result = ö.unique([1, 1, 1, 2])

        expect(result).toMatchObject([1, 2])
    })

    it('should handle any iterable', () => {
        let result = ö.unique('001122')

        expect(result).toMatchObject(['0', '1', '2'])
    })
})

describe('ö.shuffle', () => {
    it('should return a shuffled arr', () => {
        let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        let result = ö.shuffle(arr)

        expect(result).not.toEqual(arr)
        expect(result.sort()).toEqual(arr.sort())
    })

    it('should handle any iterable', () => {
        let result = ö.shuffle('001122')

        expect(result.length).toBe(6)
    })
})

describe('ö.sample', () => {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
    it('should return one item if "samples" is one', () => {
        let result = ö.sample(arr)

        expect(result).toBeTypeOf('number')
    })

    it('should return array of "samples" length if "samples" is more than one', () => {
        let result = ö.sample(arr, 3)

        expect(result).toHaveLength(3)
    })

    it('should handle an empty array', () => {
        let result = ö.sample([], 1)

        expect(result).toEqual(undefined)
    })

    it('should handle any iterable', () => {
        let result = ö.sample('000000')

        expect(result).toBe('0')

        result = ö.sample('000000', 2)

        expect(result).toEqual(['0', '0'])
    })
})

describe('ö.rotate', () => {
    let arr = [0, 1, 2, 3, 4]
    it('should rotate array one step to the left by default', () => {
        let result = ö.rotate(arr)

        expect(result).toEqual([1, 2, 3, 4, 0])
    })

    it('should rotate array n steps to the left', () => {
        let result = ö.rotate(arr, 3)

        expect(result).toEqual([3, 4, 0, 1, 2])
    })

    it('should handle a "steps" larger than arr.length', () => {
        let result = ö.rotate(arr, 10)

        expect(result).toEqual([0, 1, 2, 3, 4])
    })

    it('should handle a "steps" larger than arr.length', () => {
        let result = ö.rotate(arr, 11)

        expect(result).toEqual([1, 2, 3, 4, 0])
    })

    it('should handle negative "steps" as right rotation', () => {
        let result = ö.rotate(arr, -1)

        expect(result).toEqual([4, 0, 1, 2, 3])
    })

    it('should handle an empty array', () => {
        let result = ö.rotate([], 1)

        expect(result).toEqual([])
    })

    it('should handle any iterable', () => {
        let result = ö.rotate('123')

        expect(result).toEqual(['2', '3', '1'])
    })
})

describe('ö.chunk', () => {
    it('should return an array of length 4, with chunks of 3', () => {
        let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        let result = ö.chunk(arr, 3)

        expect(result.length).toBe(4)
        expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [0]])
    })

    it('should handle a chunk size larger than the array length', () => {
        let arr = [1, 2]
        let result = ö.chunk(arr, 5)

        expect(result).toHaveLength(1)
        expect(result).toEqual([[1, 2]])
    })

    it('should handle a an empty array', () => {
        let arr = []
        let result = ö.chunk(arr, 5)

        expect(result).toHaveLength(0)
        expect(result).toEqual([])
    })

    it('should handle any iterable', () => {
        let result = ö.chunk('001122', 2)

        expect(result.length).toBe(3)
        expect(result).toEqual([
            ['0', '0'],
            ['1', '1'],
            ['2', '2'],
        ])
    })
})

describe('ö.split, ö.take, ö.drop', () => {
    it('should return an array of two arrays, split by index', () => {
        let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        let result = ö.split(arr, 5)

        expect(result.length).toBe(2)
        expect(result).toEqual([
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 0],
        ])
    })

    it('should return an array of two arrays, split by predicate', () => {
        let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        let result = ö.split(arr, v => v <= 5)

        expect(result.length).toBe(2)
        expect(result).toEqual([
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 0],
        ])
    })

    it('should take and drop as expected', () => {
        let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        let result = ö.split(arr, 5)

        expect(result[0]).toEqual(ö.take(arr, 5))
        expect(result[1]).toEqual(ö.drop(arr, 5))

        let predicate = v => v <= 5
        result = ö.split(arr, predicate)

        expect(result[0]).toEqual(ö.take(arr, predicate))
        expect(result[1]).toEqual(ö.drop(arr, predicate))
    })

    it('should return an array of two arrays, split by predicate', () => {
        let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        let result = ö.split(arr, v => v <= 5)

        expect(result.length).toBe(2)
        expect(result).toEqual([
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 0],
        ])
    })

    it('should handle a index larger than the array length', () => {
        let arr = [1, 2]
        let result = ö.split(arr, 5)

        expect(result).toHaveLength(2)
        expect(result).toEqual([[1, 2], []])
    })

    it('should handle an index of 0', () => {
        let arr = [1, 2]
        let result = ö.split(arr, 0)

        expect(result).toHaveLength(2)
        expect(result).toEqual([[], [1, 2]])
    })

    it('should handle a an empty array', () => {
        let arr = []
        let result = ö.split(arr, 5)

        expect(result).toHaveLength(2)
        expect(result).toEqual([[], []])
    })

    it('should handle any iterable', () => {
        let result = ö.split('001122', 2)

        expect(result.length).toBe(2)
        expect(result).toEqual([
            ['0', '0'],
            ['1', '1', '2', '2'],
        ])
    })
})

describe('ö.partition', () => {
    it('should return a partitioned array', () => {
        let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        let predicate = v => v % 2 == 0
        let result = ö.partition(arr, predicate)

        expect(result.length).toBe(2)
        expect(result).toEqual([
            [2, 4, 6, 8, 0],
            [1, 3, 5, 7, 9],
        ])
    })

    it('should handle a predicate only returning true', () => {
        let arr = [1, 2]
        let predicate = v => v < 3

        let result = ö.partition(arr, predicate)

        expect(result).toHaveLength(2)
        expect(result).toEqual([[1, 2], []])
    })

    it('should handle a predicate only returning false', () => {
        let arr = [1, 2]
        let predicate = v => v > 3

        let result = ö.partition(arr, predicate)

        expect(result).toHaveLength(2)
        expect(result).toEqual([[], [1, 2]])
    })

    it('should handle a an empty array', () => {
        let arr = []
        let result = ö.partition(arr, v => !v)

        expect(result).toHaveLength(2)
        expect(result).toEqual([[], []])
    })

    it('should handle any iterable', () => {
        let result = ö.partition('001122', v => v % 2)

        expect(result.length).toBe(2)
        expect(result).toEqual([
            ['1', '1'],
            ['0', '0', '2', '2'],
        ])
    })
})

let arr = [0, 1, 2, 3]
let str = '012345'
let set = new Set(arr)

describe('ö.zip', () => {
    it('should return a zipped array given iterables, with length matching shortest iterable', () => {
        expect(ö.zip(arr, str, set)).toEqual([
            [0, '0', 0],
            [1, '1', 1],
            [2, '2', 2],
            [3, '3', 3],
        ])

        expect(ö.zip([1, 2, 3], 'abc')).toEqual([
            [1, 'a'],
            [2, 'b'],
            [3, 'c'],
        ])
    })

    it('should return a "zipped" array given one iterable', () => {
        expect(ö.zip(str)).toEqual([['0'], ['1'], ['2'], ['3'], ['4'], ['5']])
    })

    it('should handle empty input without errors', () => {
        expect(ö.zip()).toEqual([])
        expect(ö.zip([])).toEqual([])
    })
})

describe('ö.unzip', () => {
    it('should return an unzipped array given an array of tuples, with length matching shortest tuple', () => {
        expect(ö.unzip(ö.zip(arr, str, set))).toEqual([
            [0, 1, 2, 3],
            ['0', '1', '2', '3'],
            [0, 1, 2, 3],
        ])

        let unevenTuples = [
            [0, '0', 0],
            [1, '1', 1],
            [2, '2'],
        ]

        expect(ö.unzip(unevenTuples)).toEqual([
            [0, 1, 2],
            ['0', '1', '2'],
        ])
    })

    it('should return an "unzipped" array given tuple of one', () => {
        expect(ö.unzip([[0], [1]])).toEqual([[0, 1]])
    })

    it('should handle empty input without errors', () => {
        expect(ö.unzip()).toEqual([])
        expect(ö.unzip([])).toEqual([])
    })
})

let iterableOfNumbers = '1234'
describe('ö.sum', () => {
    it('should sum an iterable', () =>
        expect(ö.sum(iterableOfNumbers)).toBe(10))
})

describe('ö.mean', () => {
    it('should return the mean of an iterable', () =>
        expect(ö.mean(iterableOfNumbers)).toBe(2.5))
})

describe('ö.product', () => {
    it('should return the product of an iterable', () =>
        expect(ö.product(iterableOfNumbers)).toBe(24))

    it('should handle large numbers', () =>
        expect(ö.product(ö.rangeArray(1, 25))).toBe(6.204484017332394e23))
    expect(ö.product(ö.rangeArray(1, 171))).toBe(ö.factorial(170))
})

describe('ö.geometricMean', () => {
    it('should return the geometric mean of an iterable', () =>
        expect(ö.geometricMean(iterableOfNumbers)).toBe(2.2133638394006434))

    it('should handle large numbers', () => {
        expect(ö.geometricMean(ö.rangeArray(1, 171))).not.toBe(Infinity)

        expect(ö.geometricMean(ö.rangeArray(1, 171))).toBeCloseTo(63.835)
    })
})

describe('ö.median', () => {
    it('should return the median of an iterable of even length', () =>
        expect(ö.median(iterableOfNumbers)).toBe(2.5))

    it('should return the median of an iterable of uneven length', () =>
        expect(ö.median('123')).toBe(2))
})

describe('ö.max', () => {
    it('should return biggest value in an iterable', () =>
        expect(ö.max(iterableOfNumbers)).toBe(4))
})

describe('ö.min', () => {
    it('should return smallest value in an iterable', () =>
        expect(ö.min(iterableOfNumbers)).toBe(1))
})

describe('ö.covariance', () => {
    it('should return covariance of a and b', () => {
        expect(ö.covariance('12345', '12345')).toBe(2)
        expect(ö.covariance('12345', '54321')).toBe(-2)
        expect(ö.covariance('00000', '99999')).toBe(0)
        expect(ö.covariance('00', '0')).toBe(NaN)
    })
})

describe('ö.variance', () => {
    it('should return variance of a', () => {
        expect(ö.variance('12345')).toBe(2)
        expect(ö.variance('54321')).toBe(2)
        expect(ö.variance([-5, -4, -3, -2, -1])).toBe(2)
        expect(ö.variance([-10, 10])).toBe(100)
        expect(ö.variance('00000')).toBe(0)
    })
})

describe('ö.standardDeviation', () => {
    it('should return standardDeviation of a', () => {
        expect(ö.standardDeviation('12345')).toBe(Math.sqrt(2))
        expect(ö.standardDeviation([-10, 10])).toBe(10)
        expect(ö.standardDeviation('00000')).toBe(0)
    })
})

describe('ö.correlation', () => {
    it('should return correlation of a and b', () => {
        expect(
            ö.correlation(
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 5, 6, 7, 8, 9],
            ),
        ).toBeCloseTo(1)
        expect(ö.correlation([1, 2, 3], [1, 8, 27])).toBeCloseTo(0.966)
        expect(ö.correlation([-1, -2, -3], [1, 2, 3])).toBeCloseTo(-1)
        expect(ö.correlation([2, 2, 2], [1, 2, 3])).toBeCloseTo(0)
    })
})

describe('ö.groupBy', () => {
    it('should group an array of objects by the value of "prop"', () => {
        let m = [{ a: 1 }, { a: 1 }, { a: 2 }]

        expect(ö.groupBy(m, 'a')).toMatchObject(
            new Map([
                [1, [{ a: 1 }, { a: 1 }]],
                [2, [{ a: 2 }]],
            ]),
        )

        expect(ö.groupBy(m, 'a', true)).toMatchObject({
            1: [{ a: 1 }, { a: 1 }],
            2: [{ a: 2 }],
        })
    })

    it('should handle any iterable', () => {
        let result = ö.groupBy('001122', v => v)

        expect(result).toEqual(
            new Map([
                ['0', ['0', '0']],
                ['1', ['1', '1']],
                ['2', ['2', '2']],
            ]),
        )
    })
})

describe('ö.mapToTree', () => {
    let flat = [
        { id: '1' },
        { id: '1.1', parent: '1' },
        { id: '1.1.1', parent: '1.1' },
        { id: '1.2', parent: '1' },
        { id: '2' },
        { id: '2.2', parent: '2' },
    ]

    let expected = [
        {
            id: '1',
            children: [
                {
                    id: '1.1',
                    parent: '1',
                    children: [
                        {
                            id: '1.1.1',
                            parent: '1.1',
                        },
                    ],
                },
                {
                    id: '1.2',
                    parent: '1',
                },
            ],
        },
        {
            id: '2',
            children: [
                {
                    id: '2.2',
                    parent: '2',
                },
            ],
        },
    ]

    it('should create a tree given a function returning [id, parentId]', () => {
        let result = ö.mapToTree(flat, child => [
            child.id,
            child.id.split('.').slice(0, -1).join('.') || null,
        ])

        expect(result).toMatchObject(expected)
    })

    it('should create a tree given props for id & parentId', () => {
        let result = ö.mapToTree(flat, 'id', 'parent')

        expect(result).toMatchObject(expected)
    })
})

let deepArr = [
    {
        a: 1,
        b: [{ a: 1 }, { a: 2 }],
    },
    { a: 0 },
    { a: 0, b: [{ a: 2 }] },
    {
        a: 1,
        b: [{ a: 1 }, { a: 1, b: [{ a: 1 }, { a: 0 }] }],
    },
]

describe('ö.reduceDeep', () => {
    it('should return a result from nested props given a reducer', () => {
        const reducer = (acc, v, i) => acc + v.a

        expect(ö.reduceDeep(deepArr, reducer, 'b', 0)).toBe(10)
    })
})

describe('ö.mapDeep', () => {
    it('should map over nested members given a mapping function', () => {
        const mapper = v => v.a

        expect(ö.mapDeep(deepArr, mapper, 'b', true)).toHaveLength(11)
        expect(ö.sum(ö.mapDeep(deepArr, mapper, 'b', true))).toBe(10)
    })

    it('should preserve structure of tree if given an arr of objects with flatten == false (identity)', () => {
        const mapper = ö.id

        expect(ö.mapDeep(deepArr, mapper, 'b')).toMatchObject(deepArr)
    })

    it('should return prop values given a string', () => {
        expect(ö.mapDeep(deepArr, 'a', 'b', true)).toHaveLength(11)
        expect(ö.sum(ö.mapDeep(deepArr, 'a', 'b', true))).toBe(10)
    })
})

describe('ö.filterDeep', () => {
    it('should find nested members given a filter function', () => {
        const filter = v => v.a == 2

        let result = ö.filterDeep(deepArr, filter, 'b', false)

        expect(result).toHaveLength(2)
        expect(ö.sum(result.map(v => v.a))).toBe(4)
    })

    it('should find nested members given a value and a prop', () => {
        let result = ö.filterDeep(deepArr, 2, 'b', 'a')

        expect(result).toHaveLength(2)
        expect(ö.sum(result.map(v => v.a))).toBe(4)
    })

    it('should find children that match and keep their parents when flatten == false', () => {
        let result = ö.filterDeep(deepArr, 2, 'b', 'a', false)

        expect(result).toHaveLength(2)
        expect(ö.sum(ö.mapDeep(result, v => v.a, 'b', true))).toBe(5)
    })

    it('should return an empty array with no match', () => {
        let result = ö.filterDeep(deepArr, 3, 'b', 'a')

        expect(result).toHaveLength(0)

        result = ö.filterDeep(deepArr, 3, 'b', 'a', false)

        expect(result).toHaveLength(0)
    })
})

describe('ö.findDeep', () => {
    it('should find first match given a filter function', () => {
        const filter = v => v.a == 2

        let result = ö.findDeep(deepArr, filter, 'b')

        expect(result).toBe(deepArr[0].b[1])
    })

    it('should find first match given a value and a prop', () => {
        let result = ö.findDeep(deepArr, 2, 'b', 'a')

        expect(result).toBe(deepArr[0].b[1])
    })

    it('should return undefined with no match', () => {
        let result = ö.findDeep(deepArr, 3, 'b', 'a')

        expect(result).toBe(undefined)
    })
})

describe('Set ops', () => {
    let setA = 'ABCD',
        setB = 'CDEF'

    it('should return the intersection of a & b', () =>
        expect(ö.intersect(setA, setB)).toStrictEqual(['C', 'D']))

    it('should return the difference of a & b', () =>
        expect(ö.subtract(setA, setB)).toStrictEqual(['A', 'B']))

    it('should return the symmetric difference of a & b', () =>
        expect(ö.exclude(setA, setB)).toStrictEqual(['A', 'B', 'E', 'F']))

    it('should return the union of a & b', () =>
        expect(ö.union(setA, setB)).toStrictEqual([
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
        ]))

    it('should return false for set checks', () => {
        expect(ö.isSubset(setA, setB)).toBe(false)
        expect(ö.isSuperset(setA, setB)).toBe(false)
        expect(ö.isDisjoint(setA, setB)).toBe(false)
    })

    it('should return true for set checks', () => {
        expect(ö.isSubset('AB', 'ABC')).toBe(true)
        expect(ö.isSuperset('ABC', 'AB')).toBe(true)
        expect(ö.isDisjoint('AB', 'CD')).toBe(true)
    })
})
