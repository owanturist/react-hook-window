import { calcUnloadedRanges } from '../src/calc-unloaded-ranges'

test('ranges are empty for invalid overscan indexes', () => {
  expect(calcUnloadedRanges(() => true, 10, 0)).toEqual([])
})

test('ranges are empty for overscan indexes', () => {
  expect(calcUnloadedRanges(() => true, 0, 0)).toEqual([])
})

test('ranges are empty when all items are loaded', () => {
  expect(calcUnloadedRanges(() => false, 0, 10)).toEqual([])
})

test('single range when all items are unloaded', () => {
  expect(calcUnloadedRanges(() => true, 0, 1)).toEqual([[0, 1]])
  expect(calcUnloadedRanges(() => true, 0, 10)).toEqual([[0, 10]])
})

test('load a single item', () => {
  expect(calcUnloadedRanges(i => i === 0, 0, 10)).toEqual([[0, 1]])
  expect(calcUnloadedRanges(i => i === 3, 0, 10)).toEqual([[3, 4]])
  expect(calcUnloadedRanges(i => i === 6, 0, 10)).toEqual([[6, 7]])
  expect(calcUnloadedRanges(i => i === 9, 0, 10)).toEqual([[9, 10]])
})

test('load chunks', () => {
  const loaded = new Set<number>()
  const shouldLoad = (i: number): boolean => !loaded.has(i)

  expect(calcUnloadedRanges(shouldLoad, 0, 10)).toEqual([[0, 10]])

  loaded.add(2).add(3)
  expect(calcUnloadedRanges(shouldLoad, 0, 10)).toEqual([
    [0, 2],
    [4, 10]
  ])

  loaded.add(5).add(8)
  expect(calcUnloadedRanges(shouldLoad, 0, 10)).toEqual([
    [0, 2],
    [4, 5],
    [6, 8],
    [9, 10]
  ])

  loaded.add(4)
  expect(calcUnloadedRanges(shouldLoad, 0, 10)).toEqual([
    [0, 2],
    [6, 8],
    [9, 10]
  ])

  loaded.add(0).add(1)
  expect(calcUnloadedRanges(shouldLoad, 0, 10)).toEqual([
    [6, 8],
    [9, 10]
  ])

  loaded.add(9)
  expect(calcUnloadedRanges(shouldLoad, 0, 10)).toEqual([[6, 8]])

  loaded.add(6).add(7)
  expect(calcUnloadedRanges(shouldLoad, 0, 10)).toEqual([])

  expect(loaded.size).toBe(10)
})
