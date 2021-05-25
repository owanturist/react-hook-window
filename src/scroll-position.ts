import { positive } from './helpers'

/**
 * Defines scroll position:
 *
 * - `auto` scroll as little as possible to ensure the item is visible.
 *   If the item is already visible, it won't scroll at all.
 *
 * - `smart` If the item is already visible, don't scroll at all.
 *   If it is less than one viewport away, scroll as little as possible
 *   so that it becomes visible. If it is more than one viewport away,
 *   scroll so that it is centered within the list.
 *
 * - `center` center align the item within the list.
 *
 * - `end` align the item to the end of the list
 *   (the bottom for vertical lists or the right for horizontal lists).
 *
 * - `start` align the item to the beginning of the list
 *   (the top for vertical lists or the left for horizontal lists).
 */
export type ScrollPosition = 'auto' | 'smart' | 'center' | 'end' | 'start'

export const calcEndPosition = (
  startPosition: number,
  itemSize: number,
  containerSize: number
): number => {
  return positive(startPosition + itemSize - containerSize)
}

export const calcCenterPosition = (
  startPosition: number,
  itemSize: number,
  containerSize: number
): number => {
  return positive(startPosition + itemSize / 2 - containerSize / 2)
}

const calcShortestPosition = (
  startPosition: number,
  endPosition: number,
  currentPosition: number
): number => {
  if (currentPosition > startPosition) {
    return startPosition
  }

  if (currentPosition < endPosition) {
    return endPosition
  }

  return currentPosition
}

export const calcSmartPosition = (
  startPosition: number,
  itemSize: number,
  containerSize: number,
  currentPosition: number
): number => {
  const endPosition = calcEndPosition(startPosition, itemSize, containerSize)

  if (
    currentPosition - startPosition > containerSize ||
    endPosition - currentPosition > containerSize
  ) {
    return calcCenterPosition(startPosition, itemSize, containerSize)
  }

  return calcShortestPosition(startPosition, endPosition, currentPosition)
}

export const calcAutoPosition = (
  startPosition: number,
  itemSize: number,
  containerSize: number,
  currentPosition: number
): number => {
  const endPosition = calcEndPosition(startPosition, itemSize, containerSize)

  return calcShortestPosition(startPosition, endPosition, currentPosition)
}

export const calcScrollPosition = (
  type: ScrollPosition,
  startPosition: number,
  itemSize: number,
  containerSize: number,
  currentPosition: number
): number => {
  if (type === 'start') {
    return startPosition
  }

  if (type === 'end') {
    return calcEndPosition(startPosition, itemSize, containerSize)
  }

  if (type === 'center') {
    return calcCenterPosition(startPosition, itemSize, containerSize)
  }

  if (type === 'smart') {
    return calcSmartPosition(
      startPosition,
      itemSize,
      containerSize,
      currentPosition
    )
  }

  return calcAutoPosition(
    startPosition,
    itemSize,
    containerSize,
    currentPosition
  )
}
