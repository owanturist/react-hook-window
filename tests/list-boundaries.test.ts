import { ListBoundaries } from '../src/list-boundaries'

test('ListBoundaries.replace', () => {
  const _0 = { start: 0, stop: 1 }
  const _1 = { start: 0, stop: 2 }
  const _2 = { start: 1, stop: 1 }

  expect(ListBoundaries.replace(_0, { start: 0, stop: 1 })).toBe(_0)
  expect(ListBoundaries.replace(_0, _1)).toBe(_1)
  expect(ListBoundaries.replace(_0, _2)).toBe(_2)
})

test('ListBoundaries.limit', () => {
  const _0 = ListBoundaries.limit({ start: 0, stop: 0 }, 10)
  expect(_0).toEqual({ start: 0, stop: 0 })

  const _1 = ListBoundaries.limit({ start: -1, stop: 11 }, 10)
  expect(_1).toEqual({ start: 0, stop: 10 })

  const _2 = ListBoundaries.limit({ start: 3, stop: 6 }, 10, 2)
  expect(_2).toEqual({ start: 1, stop: 8 })

  const _3 = ListBoundaries.limit({ start: 1, stop: 9 }, 10, 2)
  expect(_3).toEqual({ start: 0, stop: 10 })
})

test('ListBoundaries.limitOverScroll', () => {
  const _0 = ListBoundaries.limitOverScroll({ start: 0, stop: 0 }, 10)
  expect(_0).toEqual({ start: 0, stop: 0 })

  const _1 = ListBoundaries.limitOverScroll({ start: -1, stop: 11 }, 10)
  expect(_1).toEqual({ start: 0, stop: 10 })

  const _2 = ListBoundaries.limitOverScroll({ start: 80, stop: 99 }, 70)
  expect(_2).toEqual({ start: 51, stop: 70 })

  const _3 = ListBoundaries.limitOverScroll({ start: 80, stop: 99 }, 10)
  expect(_3).toEqual({ start: 0, stop: 10 })
})
