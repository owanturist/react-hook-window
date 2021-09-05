import { positive } from './helpers'

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
