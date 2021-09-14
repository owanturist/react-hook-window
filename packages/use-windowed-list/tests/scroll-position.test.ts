import {
  calcEndPosition as calcEnd,
  calcCenterPosition as calcCenter,
  calcAutoPosition as calcAuto,
  calcSmartPosition as calcSmart
} from '../src/scroll-position'

test('calcEndPosition', () => {
  expect(calcEnd(0, 0, 0)).toBe(0)
  expect(calcEnd(300, 150, 100)).toBe(350) // item > container
  expect(calcEnd(49, 100, 150)).toBe(0) // container > end position
  expect(calcEnd(50, 100, 150)).toBe(0) // container == end position
  expect(calcEnd(51, 100, 150)).toBe(1) // container < end position
  expect(calcEnd(1500, 100, 150)).toBe(1450)
})

test('calcCenterPosition', () => {
  expect(calcCenter(0, 0, 0)).toBe(0)
  expect(calcCenter(300, 150, 100)).toBe(325) // item > container
  expect(calcCenter(0, 100, 150)).toBe(0) // container > end position
  expect(calcCenter(25, 100, 150)).toBe(0) // container == end position
  expect(calcCenter(26, 100, 150)).toBe(1) // container < end position
  expect(calcCenter(1500, 100, 150)).toBe(1475)
})

test('calcAutoPosition', () => {
  expect(calcAuto(0, 0, 0, 0)).toBe(0)

  expect(calcAuto(1500, 100, 150, 1500)).toBe(1500) // visible at exact start
  expect(calcAuto(1500, 100, 150, 1501)).toBe(1500) // almost visible at start
  expect(calcAuto(1500, 100, 150, 1499)).toBe(1499) // visible at start

  expect(calcAuto(1500, 100, 150, 1450)).toBe(1450) // visible at exact end
  expect(calcAuto(1500, 100, 150, 1449)).toBe(1450) // almost visible at end
  expect(calcAuto(1500, 100, 150, 1451)).toBe(1451) // visible at end

  expect(calcAuto(1500, 100, 150, 1650)).toBe(1500) // 1 viewport from start
  expect(calcAuto(1500, 100, 150, 1651)).toBe(1500) // > 1 viewport from start

  expect(calcAuto(1500, 100, 150, 1300)).toBe(1450) // 1 viewport from end
  expect(calcAuto(1500, 100, 150, 1299)).toBe(1450) // > 1 viewport from end

  expect(calcAuto(50, 200, 150, 49)).toBe(50) // scroll a to start for big item to become visible
  expect(calcAuto(50, 200, 150, 50)).toBe(50) // big item is already visible from beginning
  expect(calcAuto(50, 200, 150, 60)).toBe(60) // big item is already visible in middle
  expect(calcAuto(50, 200, 150, 75)).toBe(75) // big item is already visible in the end
  expect(calcAuto(50, 200, 150, 100)).toBe(100) // big item is already visible in the end
  expect(calcAuto(50, 200, 150, 101)).toBe(100) // scroll a to end for big item to become visible
})

test('calcSmartPosition', () => {
  expect(calcSmart(0, 0, 0, 0)).toBe(0)
  expect(calcSmart(1500, 100, 150, 1500)).toBe(1500) // visible at exact start
  expect(calcSmart(1500, 100, 150, 1501)).toBe(1500) // almost visible at start
  expect(calcSmart(1500, 100, 150, 1499)).toBe(1499) // visible at start

  expect(calcSmart(1500, 100, 150, 1450)).toBe(1450) // visible at exact end
  expect(calcSmart(1500, 100, 150, 1449)).toBe(1450) // almost visible at end
  expect(calcSmart(1500, 100, 150, 1451)).toBe(1451) // visible at end

  expect(calcSmart(1500, 100, 150, 1650)).toBe(1500) // 1 viewport from start
  expect(calcSmart(1500, 100, 150, 1651)).toBe(1475) // > 1 viewport from start

  expect(calcSmart(1500, 100, 150, 1300)).toBe(1450) // 1 viewport from end
  expect(calcSmart(1500, 100, 150, 1299)).toBe(1475) // > 1 viewport from end

  // expect(calcSmart(0, 200, 150, 0)).toBe(0) // big item is already visible from beginning
  // expect(calcSmart(0, 200, 150, 10)).toBe(10) // big item is already visible in middle
  // expect(calcSmart(0, 200, 150, 50)).toBe(50) // big item is already visible in the end
})
