import { initListViewport } from '../src/list-viewport'

test('FixedSizeListViewport#getSpaceBefore', () => {
  const _0 = initListViewport(0, 0)
  expect(_0.getSpaceBefore(0)).toBe(0)
  expect(_0.getSpaceBefore(10)).toBe(0)

  const _1 = initListViewport(10, 30)
  expect(_1.getSpaceBefore(0)).toBe(0)
  expect(_1.getSpaceBefore(10)).toBe(100)
  expect(_1.getSpaceBefore(20)).toBe(200)
  expect(_1.getSpaceBefore(29)).toBe(290)
})

test('FixedSizeListViewport#getSpaceAfter', () => {
  const _0 = initListViewport(0, 0)
  expect(_0.getSpaceAfter(0)).toBe(0)
  expect(_0.getSpaceAfter(10)).toBe(0)

  const _1 = initListViewport(10, 30)
  expect(_1.getSpaceAfter(0)).toBe(290)
  expect(_1.getSpaceAfter(10)).toBe(190)
  expect(_1.getSpaceAfter(20)).toBe(90)
  expect(_1.getSpaceAfter(29)).toBe(0)
  expect(_1.getSpaceAfter(30)).toBe(0)
})

test('FixedSizeListViewport#getItemSize', () => {
  const _0 = initListViewport(0, 0)
  expect(_0.getItemSize(0)).toBe(0)
  expect(_0.getItemSize(10)).toBe(0)

  const _1 = initListViewport(10, 30)
  expect(_1.getItemSize(0)).toBe(10)
  expect(_1.getItemSize(10)).toBe(10)
  expect(_1.getItemSize(20)).toBe(10)
  expect(_1.getItemSize(29)).toBe(10)
  expect(_1.getItemSize(30)).toBe(10)
})

test('FixedSizeListViewport#calcBoundaries', () => {
  const _0 = initListViewport(0, 0)
  expect(_0.calcBoundaries(0, 0)).toEqual({ start: 0, stop: 0 })

  const _1 = initListViewport(10, 30)
  expect(_1.calcBoundaries(0, 0)).toEqual({ start: 0, stop: 0 })
  expect(_1.calcBoundaries(85, 0)).toEqual({ start: 0, stop: 9 })
  expect(_1.calcBoundaries(85, 5)).toEqual({ start: 0, stop: 9 })
  expect(_1.calcBoundaries(85, 6)).toEqual({ start: 0, stop: 10 })

  expect(_1.calcBoundaries(400, 0)).toEqual({ start: 0, stop: 30 })
})

const sizes = [20, 30, 10, 50, 40, 30, 10, 90, 20]

test('VariableSizeListViewport#getSpaceBefore', () => {
  const _0 = initListViewport(() => 0, 0)
  expect(_0.getSpaceBefore(0)).toBe(0)
  expect(_0.getSpaceBefore(4)).toBe(0)

  const _1 = initListViewport(i => sizes[i], sizes.length)
  expect(_1.getSpaceBefore(0)).toBe(0)
  expect(_1.getSpaceBefore(1)).toBe(20)
  expect(_1.getSpaceBefore(2)).toBe(50)
  expect(_1.getSpaceBefore(3)).toBe(60)
  expect(_1.getSpaceBefore(4)).toBe(110)
  expect(_1.getSpaceBefore(5)).toBe(150)
  expect(_1.getSpaceBefore(6)).toBe(180)
  expect(_1.getSpaceBefore(7)).toBe(190)
  expect(_1.getSpaceBefore(8)).toBe(280)
  expect(_1.getSpaceBefore(9)).toBe(280)
})

test('VariableSizeListViewport#getSpaceAfter', () => {
  const _0 = initListViewport(() => 0, 0)
  expect(_0.getSpaceAfter(0)).toBe(0)
  expect(_0.getSpaceAfter(4)).toBe(0)

  const _1 = initListViewport(i => sizes[i], sizes.length)
  expect(_1.getSpaceAfter(0)).toBe(280)
  expect(_1.getSpaceAfter(1)).toBe(250)
  expect(_1.getSpaceAfter(2)).toBe(240)
  expect(_1.getSpaceAfter(3)).toBe(190)
  expect(_1.getSpaceAfter(4)).toBe(150)
  expect(_1.getSpaceAfter(5)).toBe(120)
  expect(_1.getSpaceAfter(6)).toBe(110)
  expect(_1.getSpaceAfter(7)).toBe(20)
  expect(_1.getSpaceAfter(8)).toBe(0)
  expect(_1.getSpaceAfter(9)).toBe(0)
})

test('VariableSizeListViewport#getItemSize', () => {
  const _0 = initListViewport(() => 0, 0)
  expect(_0.getSpaceAfter(0)).toBe(0)
  expect(_0.getSpaceAfter(4)).toBe(0)

  const _1 = initListViewport(i => sizes[i], sizes.length)
  expect(_1.getItemSize(0)).toBe(20)
  expect(_1.getItemSize(1)).toBe(30)
  expect(_1.getItemSize(2)).toBe(10)
  expect(_1.getItemSize(3)).toBe(50)
  expect(_1.getItemSize(4)).toBe(40)
  expect(_1.getItemSize(5)).toBe(30)
  expect(_1.getItemSize(6)).toBe(10)
  expect(_1.getItemSize(7)).toBe(90)
  expect(_1.getItemSize(8)).toBe(20)
  expect(_1.getItemSize(9)).toBe(0)
})

test('VariableSizeListViewport#calcBoundaries', () => {
  const _0 = initListViewport(() => 0, 0)
  expect(_0.calcBoundaries(0, 0)).toEqual({ start: 0, stop: 0 })

  const _1 = initListViewport(i => sizes[i], sizes.length)
  expect(_1.calcBoundaries(0, 0)).toEqual({ start: 0, stop: 0 })
  expect(_1.calcBoundaries(60, 0)).toEqual({ start: 0, stop: 3 })
  expect(_1.calcBoundaries(60, 1)).toEqual({ start: 0, stop: 4 })
  expect(_1.calcBoundaries(60, 20)).toEqual({ start: 1, stop: 4 })
  expect(_1.calcBoundaries(90, 20)).toEqual({ start: 1, stop: 4 })
  expect(_1.calcBoundaries(90, 50)).toEqual({ start: 2, stop: 5 })
  expect(_1.calcBoundaries(900, 0)).toEqual({ start: 0, stop: 9 })
  expect(_1.calcBoundaries(900, 30)).toEqual({ start: 1, stop: 9 })
  expect(_1.calcBoundaries(900, 151)).toEqual({ start: 5, stop: 9 })
})
