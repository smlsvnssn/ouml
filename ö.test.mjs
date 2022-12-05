import { describe, expect, it } from 'vitest'
import * as ö from 'ö.mjs'

describe('ö.grid( width, height )', () => {
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

describe('pipe async', () => {
	it('should return 42 with async calls', async () => {
		const result = await ö.pipeAsync(
			1,
			async x => await (x * 6),
			async x => {
				await ö.wait(1000)
				return x ** 2
			},
			async x => await (x + 6),
			ö.log,
		)
		expect(result).toBe(42)
	})

	it('should return 42 with sync calls', async () => {
		const result = await ö.pipeAsync(
			1,
			x => x * 6,
			x => x ** 2,
			x => x + 6,
			ö.log,
		)
		expect(result).toBe(42)
	})
})
