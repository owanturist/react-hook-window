import { ListViewport } from './list-viewport'

export type ScrollPosition = 'auto' | 'smart' | 'center' | 'end' | 'start'

const calcEndPosition = (
  viewport: ListViewport,
  index: number,
  containerSize: number
): number => {
  return (
    viewport.getSpaceBefore(index) + viewport.getItemSize(index) - containerSize
  )
}

const calcCenterPosition = (
  viewport: ListViewport,
  index: number,
  containerSize: number
): number => {
  return (
    viewport.getSpaceBefore(index) +
    viewport.getItemSize(index) / 2 -
    containerSize / 2
  )
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

const calcSmartPosition = (
  viewport: ListViewport,
  index: number,
  containerSize: number,
  currentPosition: number
): number => {
  const startPosition = viewport.getSpaceBefore(index)
  const endPosition = calcEndPosition(viewport, index, containerSize)

  if (
    currentPosition - startPosition > containerSize ||
    endPosition - currentPosition > containerSize
  ) {
    return calcCenterPosition(viewport, index, containerSize)
  }

  return calcShortestPosition(startPosition, endPosition, currentPosition)
}

const calcAutoPosition = (
  viewport: ListViewport,
  index: number,
  containerSize: number,
  currentPosition: number
): number => {
  const startPosition = viewport.getSpaceBefore(index)
  const endPosition = calcEndPosition(viewport, index, containerSize)

  return calcShortestPosition(startPosition, endPosition, currentPosition)
}

export const calcScrollPosition = (
  type: ScrollPosition,
  viewport: ListViewport,
  index: number,
  containerSize: number,
  currentPosition: number
): number => {
  if (type === 'start') {
    return viewport.getSpaceBefore(index)
  }

  if (type === 'end') {
    return calcEndPosition(viewport, index, containerSize)
  }

  if (type === 'center') {
    return calcCenterPosition(viewport, index, containerSize)
  }

  if (type === 'smart') {
    return calcSmartPosition(viewport, index, containerSize, currentPosition)
  }

  return calcAutoPosition(viewport, index, containerSize, currentPosition)
}
