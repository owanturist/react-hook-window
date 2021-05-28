import test from 'ava'

import { initListViewport } from '../src/list-viewport'

test('FixedSizeListViewport#getSpaceBefore', t => {
  const _0 = initListViewport(0, 0)
  t.is(_0.getSpaceBefore(0), 0)
  t.is(_0.getSpaceBefore(10), 0)

  const _1 = initListViewport(10, 30)
  t.is(_1.getSpaceBefore(0), 0)
  t.is(_1.getSpaceBefore(10), 100)
  t.is(_1.getSpaceBefore(20), 200)
  t.is(_1.getSpaceBefore(29), 290)
})

test('FixedSizeListViewport#getSpaceAfter', t => {
  const _0 = initListViewport(0, 0)
  t.is(_0.getSpaceAfter(0), 0)
  t.is(_0.getSpaceAfter(10), 0)

  const _1 = initListViewport(10, 30)
  t.is(_1.getSpaceAfter(0), 290)
  t.is(_1.getSpaceAfter(10), 190)
  t.is(_1.getSpaceAfter(20), 90)
  t.is(_1.getSpaceAfter(29), 0)
  t.is(_1.getSpaceAfter(30), 0)
})

test('FixedSizeListViewport#getItemSize', t => {
  const _0 = initListViewport(0, 0)
  t.is(_0.getItemSize(0), 0)
  t.is(_0.getItemSize(10), 0)

  const _1 = initListViewport(10, 30)
  t.is(_1.getItemSize(0), 10)
  t.is(_1.getItemSize(10), 10)
  t.is(_1.getItemSize(20), 10)
  t.is(_1.getItemSize(29), 10)
  t.is(_1.getItemSize(30), 10)
})

test('FixedSizeListViewport#calcBoundaries', t => {
  const _0 = initListViewport(0, 0)
  t.deepEqual(_0.calcBoundaries(0, 0), { start: 0, stop: 0 })

  const _1 = initListViewport(10, 30)
  t.deepEqual(_1.calcBoundaries(0, 0), { start: 0, stop: 0 })
  t.deepEqual(_1.calcBoundaries(85, 0), { start: 0, stop: 9 })
  t.deepEqual(_1.calcBoundaries(85, 5), { start: 0, stop: 9 })
  t.deepEqual(_1.calcBoundaries(85, 6), { start: 0, stop: 10 })

  t.deepEqual(_1.calcBoundaries(400, 0), { start: 0, stop: 30 })
})

const sizes = [20, 30, 10, 50, 40, 30, 10, 90, 20]

test('VariableSizeListViewport#getSpaceBefore', t => {
  const _0 = initListViewport(() => 0, 0)
  t.is(_0.getSpaceBefore(0), 0)
  t.is(_0.getSpaceBefore(4), 0)

  const _1 = initListViewport(i => sizes[i], sizes.length)
  t.is(_1.getSpaceBefore(0), 0)
  t.is(_1.getSpaceBefore(1), 20)
  t.is(_1.getSpaceBefore(2), 50)
  t.is(_1.getSpaceBefore(3), 60)
  t.is(_1.getSpaceBefore(4), 110)
  t.is(_1.getSpaceBefore(5), 150)
  t.is(_1.getSpaceBefore(6), 180)
  t.is(_1.getSpaceBefore(7), 190)
  t.is(_1.getSpaceBefore(8), 280)
  t.is(_1.getSpaceBefore(9), 280)
})

test('VariableSizeListViewport#getSpaceAfter', t => {
  const _0 = initListViewport(() => 0, 0)
  t.is(_0.getSpaceAfter(0), 0)
  t.is(_0.getSpaceAfter(4), 0)

  const _1 = initListViewport(i => sizes[i], sizes.length)
  t.is(_1.getSpaceAfter(0), 280)
  t.is(_1.getSpaceAfter(1), 250)
  t.is(_1.getSpaceAfter(2), 240)
  t.is(_1.getSpaceAfter(3), 190)
  t.is(_1.getSpaceAfter(4), 150)
  t.is(_1.getSpaceAfter(5), 120)
  t.is(_1.getSpaceAfter(6), 110)
  t.is(_1.getSpaceAfter(7), 20)
  t.is(_1.getSpaceAfter(8), 0)
  t.is(_1.getSpaceAfter(9), 0)
})

test('VariableSizeListViewport#getItemSize', t => {
  const _0 = initListViewport(() => 0, 0)
  t.is(_0.getSpaceAfter(0), 0)
  t.is(_0.getSpaceAfter(4), 0)

  const _1 = initListViewport(i => sizes[i], sizes.length)
  t.is(_1.getItemSize(0), 20)
  t.is(_1.getItemSize(1), 30)
  t.is(_1.getItemSize(2), 10)
  t.is(_1.getItemSize(3), 50)
  t.is(_1.getItemSize(4), 40)
  t.is(_1.getItemSize(5), 30)
  t.is(_1.getItemSize(6), 10)
  t.is(_1.getItemSize(7), 90)
  t.is(_1.getItemSize(8), 20)
  t.is(_1.getItemSize(9), 0)
})

test('VariableSizeListViewport#calcBoundaries', t => {
  const _0 = initListViewport(() => 0, 0)
  t.deepEqual(_0.calcBoundaries(0, 0), { start: 0, stop: 0 })

  const _1 = initListViewport(i => sizes[i], sizes.length)
  t.deepEqual(_1.calcBoundaries(0, 0), { start: 0, stop: 0 })
  t.deepEqual(_1.calcBoundaries(60, 0), { start: 0, stop: 3 })
  t.deepEqual(_1.calcBoundaries(60, 1), { start: 0, stop: 4 })
  t.deepEqual(_1.calcBoundaries(60, 20), { start: 1, stop: 4 })
  t.deepEqual(_1.calcBoundaries(90, 20), { start: 1, stop: 4 })
  t.deepEqual(_1.calcBoundaries(90, 50), { start: 2, stop: 5 })
  t.deepEqual(_1.calcBoundaries(900, 0), { start: 0, stop: 9 })
  t.deepEqual(_1.calcBoundaries(900, 30), { start: 1, stop: 9 })
  t.deepEqual(_1.calcBoundaries(900, 151), { start: 5, stop: 9 })

  const _2 = initListViewport(() => 30, 1)
  t.deepEqual(_2.calcBoundaries(0, 0), { start: 0, stop: 0 })
  t.deepEqual(_2.calcBoundaries(0, 20), { start: 0, stop: 1 })
  t.deepEqual(_2.calcBoundaries(20, 40), { start: 0, stop: 1 })
})
