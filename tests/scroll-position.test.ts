import test from 'ava'

import {
  calcEndPosition as calcEnd,
  calcCenterPosition as calcCenter,
  calcAutoPosition as calcAuto,
  calcSmartPosition as calcSmart
} from '../src/scroll-position'

test('calcEndPosition', t => {
  t.is(calcEnd(0, 0, 0), 0)
  t.is(calcEnd(300, 150, 100), 350, 'item > container')
  t.is(calcEnd(49, 100, 150), 0, 'container > end position')
  t.is(calcEnd(50, 100, 150), 0, 'container == end position')
  t.is(calcEnd(51, 100, 150), 1, 'container < end position')
  t.is(calcEnd(1500, 100, 150), 1450)
})

test('calcCenterPosition', t => {
  t.is(calcCenter(0, 0, 0), 0)
  t.is(calcCenter(300, 150, 100), 325, 'item > container')
  t.is(calcCenter(0, 100, 150), 0, 'container > end position')
  t.is(calcCenter(25, 100, 150), 0, 'container == end position')
  t.is(calcCenter(26, 100, 150), 1, 'container < end position')
  t.is(calcCenter(1500, 100, 150), 1475)
})

test('calcAutoPosition', t => {
  t.is(calcAuto(0, 0, 0, 0), 0)

  t.is(calcAuto(1500, 100, 150, 1500), 1500, 'visible at exact start')
  t.is(calcAuto(1500, 100, 150, 1501), 1500, 'almost visible at start')
  t.is(calcAuto(1500, 100, 150, 1499), 1499, 'visible at start')

  t.is(calcAuto(1500, 100, 150, 1450), 1450, 'visible at exact end')
  t.is(calcAuto(1500, 100, 150, 1449), 1450, 'almost visible at end')
  t.is(calcAuto(1500, 100, 150, 1451), 1451, 'visible at end')

  t.is(calcAuto(1500, 100, 150, 1650), 1500, '1 viewport from start')
  t.is(calcAuto(1500, 100, 150, 1651), 1500, '> 1 viewport from start')

  t.is(calcAuto(1500, 100, 150, 1300), 1450, '1 viewport from end')
  t.is(calcAuto(1500, 100, 150, 1299), 1450, '> 1 viewport from end')
})

test('calcSmartPosition', t => {
  t.is(calcSmart(0, 0, 0, 0), 0)
  t.is(calcSmart(1500, 100, 150, 1500), 1500, 'visible at exact start')
  t.is(calcSmart(1500, 100, 150, 1501), 1500, 'almost visible at start')
  t.is(calcSmart(1500, 100, 150, 1499), 1499, 'visible at start')

  t.is(calcSmart(1500, 100, 150, 1450), 1450, 'visible at exact end')
  t.is(calcSmart(1500, 100, 150, 1449), 1450, 'almost visible at end')
  t.is(calcSmart(1500, 100, 150, 1451), 1451, 'visible at end')

  t.is(calcSmart(1500, 100, 150, 1650), 1500, '1 viewport from start')
  t.is(calcSmart(1500, 100, 150, 1651), 1475, '> 1 viewport from start')

  t.is(calcSmart(1500, 100, 150, 1300), 1450, '1 viewport from end')
  t.is(calcSmart(1500, 100, 150, 1299), 1475, '> 1 viewport from end')
})
