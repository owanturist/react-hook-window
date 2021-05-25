import test from 'ava'

import { ListBoundaries } from '../src/list-boundaries'

test('ListBoundaries.replace', t => {
  const _0 = { start: 0, stop: 1 }
  const _1 = { start: 0, stop: 2 }
  const _2 = { start: 1, stop: 1 }

  t.is(ListBoundaries.replace(_0, { start: 0, stop: 1 }), _0)
  t.is(ListBoundaries.replace(_0, _1), _1)
  t.is(ListBoundaries.replace(_0, _2), _2)
})

test('ListBoundaries.limit', t => {
  const _0 = ListBoundaries.limit({ start: 0, stop: 0 }, 10)
  t.deepEqual(_0, { start: 0, stop: 0 })

  const _1 = ListBoundaries.limit({ start: -1, stop: 11 }, 10)
  t.deepEqual(_1, { start: 0, stop: 10 })

  const _2 = ListBoundaries.limit({ start: 3, stop: 6 }, 10, 2)
  t.deepEqual(_2, { start: 1, stop: 8 })

  const _3 = ListBoundaries.limit({ start: 1, stop: 9 }, 10, 2)
  t.deepEqual(_3, { start: 0, stop: 10 })
})

test('ListBoundaries.limitOverScroll', t => {
  const _0 = ListBoundaries.limitOverScroll({ start: 0, stop: 0 }, 10)
  t.deepEqual(_0, { start: 0, stop: 0 })

  const _1 = ListBoundaries.limitOverScroll({ start: -1, stop: 11 }, 10)
  t.deepEqual(_1, { start: 0, stop: 10 })

  const _2 = ListBoundaries.limitOverScroll({ start: 80, stop: 99 }, 70)
  t.deepEqual(_2, { start: 51, stop: 70 })

  const _3 = ListBoundaries.limitOverScroll({ start: 80, stop: 99 }, 10)
  t.deepEqual(_3, { start: 0, stop: 10 })
})
