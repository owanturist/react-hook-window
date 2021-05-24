import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import throttle from 'lodash.throttle'
import debounce from 'lodash.debounce'

import { usePermanent } from './use-permanent'

const DEFAULT_OVERSCAN_COUNT = 1
const DEFAULT_SCROLL_THROTTLE_MS = 16 // ~ 60fps
const IS_SCROLLING_DEBOUNCE_MS = 150

const noop = (): void => {
  // do nothing
}

const clamp = (min: number, max: number, value: number): number => {
  return Math.max(min, Math.min(value, max))
}

const range = (from: number, to: number): ReadonlyArray<number> => {
  const N = Math.max(0, to - from)
  const acc = new Array<number>(N)

  for (let index = 0; index < N; index++) {
    acc[index] = index + from
  }

  return acc
}

const onPassiveScroll = (
  node: HTMLElement,
  listener: () => void
): VoidFunction => {
  node.addEventListener('scroll', listener, { passive: true })

  return () => {
    node.removeEventListener('scroll', listener)
  }
}

// P O S I T I O N

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

const calcPosition = (
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

const calcInitialScroll = (
  options: number | { index: number; position?: ScrollPosition },
  viewport: ListViewport,
  containerSize: number
): number => {
  if (typeof options === 'number') {
    return options
  }

  return calcPosition(
    options.position ?? 'auto',
    viewport,
    options.index,
    containerSize,
    0
  )
}

// B O U N D A R I E S

abstract class Boundaries {
  public abstract readonly start: number
  public abstract readonly stop: number

  public static replace(prev: Boundaries, next: Boundaries): Boundaries {
    if (prev.start === next.start && prev.stop === next.stop) {
      return prev
    }

    return next
  }

  // checks if scroll position is much further than current boundaries
  // and if so assume accurate boundaries based on previous distance
  public static limitOverScroll(
    boundaries: Boundaries,
    itemCount: number
  ): Boundaries {
    if (boundaries.start > itemCount && boundaries.stop > itemCount) {
      const start = itemCount - (boundaries.stop - boundaries.start)

      return {
        start: Math.max(0, start),
        stop: itemCount
      }
    }

    return Boundaries.limit(boundaries, itemCount)
  }

  public static limit(
    { start, stop }: Boundaries,
    itemCount: number,
    overscanCount = 0
  ): Boundaries {
    return {
      start: clamp(0, start - overscanCount, itemCount),
      stop: clamp(start, stop + overscanCount, itemCount)
    }
  }
}

const useBoundaries = (
  itemCount: number,
  init: () => Boundaries
): [Boundaries, (boundaries: Boundaries) => void] => {
  const [boundaries, setBoundaries] = useState(init)

  return [
    Boundaries.limitOverScroll(boundaries, itemCount),
    usePermanent(() => (next: Boundaries) => {
      setBoundaries(prev => Boundaries.replace(prev, next))
    })
  ]
}

// V I R T U A L   W I N D O W

interface ListViewport {
  getSpaceBefore(index: number): number
  getSpaceAfter(index: number): number
  getItemSize(index: number): number
  calcBoundaries(containerSize: number, scrollStart: number): Boundaries
}

class FixedSizeListViewport implements ListViewport {
  public constructor(
    private readonly itemSize: number,
    private readonly itemCount: number
  ) {}

  public getSpaceBefore(index: number): number {
    return this.itemSize * index
  }

  public getSpaceAfter(index: number): number {
    return this.itemSize * Math.max(0, this.itemCount - index)
  }

  public getItemSize(): number {
    return this.itemSize
  }

  public calcBoundaries(
    containerSize: number,
    scrollStart: number
  ): Boundaries {
    const start = Math.floor(scrollStart / this.itemSize)
    const stop = Math.ceil((scrollStart + containerSize) / this.itemSize)

    return { start, stop }
  }
}

// M A I N

export type ScrollPosition = 'auto' | 'smart' | 'center' | 'end' | 'start'

export interface ListRenderedRange {
  overscanStart: number
  overscanStop: number
  visibleStart: number
  visibleStop: number
}

export interface UseFixedSizeListOptions {
  height: number
  itemHeight: number
  itemCount: number
  overscanCount?: number
  initialScroll?: number | { index: number; position?: ScrollPosition }
  scrollThrottling?: number
  onItemsRendered?(renderedRange: ListRenderedRange): void
}

export interface UseFixedSizeListResult<E extends HTMLElement> {
  topOffset: number
  bottomOffset: number
  indexes: ReadonlyArray<number>
  isScrolling: boolean
  setRef(node: E): void
  scrollTo(px: number): void
  scrollToItem(index: number, position?: ScrollPosition): void
}

export const useFixedSizeList = <E extends HTMLElement>({
  height,
  itemHeight,
  itemCount,
  overscanCount = DEFAULT_OVERSCAN_COUNT,
  initialScroll = 0,
  scrollThrottling = DEFAULT_SCROLL_THROTTLE_MS,
  onItemsRendered
}: UseFixedSizeListOptions): UseFixedSizeListResult<E> => {
  // it wants to keep track when a container gets changed
  const [container, setContainer] = useState<E>()
  const onScrollRef = useRef<(scrollTop: number) => void>(noop)
  const onScrollingRef = useRef<() => void>(noop)

  const viewport = useMemo(
    () => new FixedSizeListViewport(itemHeight, itemCount),
    [itemHeight, itemCount]
  )

  const [isScrolling, setIsScrolling] = useState(false)
  const [boundaries, setBoundaries] = useBoundaries(itemCount, () => {
    return viewport.calcBoundaries(
      height,
      calcInitialScroll(initialScroll, viewport, height)
    )
  })
  const { start, stop } = Boundaries.limit(boundaries, itemCount, overscanCount)

  // props.onItemsRendered monitor
  useEffect(() => {
    if (container != null) {
      onItemsRendered?.({
        overscanStart: start,
        overscanStop: stop,
        visibleStart: boundaries.start,
        visibleStop: boundaries.stop
      })
    }
  }, [
    container,
    onItemsRendered,
    start,
    stop,
    boundaries.start,
    boundaries.stop
  ])

  // set initial scroll
  useEffect(() => {
    container?.scrollTo(
      container.scrollLeft,
      calcInitialScroll(initialScroll, viewport, height)
    )
    // it does not want to watch the values' changes on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container])

  // props.height and props.itemHeight monitor
  useEffect(() => {
    if (container != null) {
      setBoundaries(viewport.calcBoundaries(height, container.scrollTop))
    }
  }, [setBoundaries, container, viewport, height])

  // define onScrolling handler
  useEffect(() => {
    const onScrollBegin = debounce(
      () => setIsScrolling(true),
      IS_SCROLLING_DEBOUNCE_MS,
      { leading: true, trailing: false }
    )

    const onScrollEnd = debounce(
      () => setIsScrolling(false),
      IS_SCROLLING_DEBOUNCE_MS,
      { leading: false, trailing: true }
    )

    // the ref keeps onScrolling callback so it never needs to reattach the listener
    onScrollingRef.current = () => {
      onScrollBegin()
      onScrollEnd()
    }

    return () => {
      onScrollBegin.cancel()
      onScrollEnd.cancel()
    }
  }, [])

  // define onScroll handler
  useEffect(() => {
    const onScroll = throttle(
      (scrollTop: number) => {
        setBoundaries(viewport.calcBoundaries(height, scrollTop))
      },
      scrollThrottling,
      // execute on END of interval so it always applies actual boundaries
      { leading: false, trailing: true }
    )

    // the ref keeps onScroll callback so it doesn't need to reattach
    // the listener to node each time the props changes
    onScrollRef.current = onScroll

    return onScroll.cancel
  }, [setBoundaries, viewport, height, scrollThrottling])

  // container scroll monitor
  useEffect(() => {
    if (container == null) {
      return
    }

    return onPassiveScroll(container, () => {
      onScrollingRef.current()
      onScrollRef.current(container.scrollTop)
    })
  }, [container])

  return {
    isScrolling,
    setRef: setContainer,
    topOffset: viewport.getSpaceBefore(start),
    bottomOffset: viewport.getSpaceAfter(stop),

    indexes: useMemo(() => range(start, stop), [start, stop]),

    scrollTo: useCallback(
      (px: number) => container?.scrollTo(container.scrollLeft, px),
      [container]
    ),

    scrollToItem: useCallback(
      (index: number, position: ScrollPosition = 'auto'): void => {
        container?.scrollTo(
          container.scrollLeft,
          calcPosition(position, viewport, index, height, container.scrollTop)
        )
      },
      [container, height, viewport]
    )
  }
}

// I N F I N I T E   L O A D E R

const calcUnloadedRanges = (
  isLoaded: (index: number) => boolean,
  overscanStart: number,
  overscanStop: number
): ReadonlyArray<[number, number]> => {
  const ranges = new Array<[number, number]>(0)

  for (let index = overscanStart; index < overscanStop; index++) {
    // skip loaded
    while (isLoaded(index)) {
      if (++index >= overscanStop) {
        return ranges
      }
    }

    const start = index

    // skip unloaded
    while (!isLoaded(index)) {
      if (++index >= overscanStop) {
        ranges.push([start, overscanStop])

        return ranges
      }
    }

    ranges.push([start, index])
  }

  return ranges
}

export interface InfiniteLoaderRenderedRange {
  overscanStart: number
  overscanStop: number
}

export interface UseInfiniteLoaderOptions {
  isItemLoaded(index: number): boolean
  loadMoreItems(startIndex: number, stopIndex: number): void
}

export interface UseInfiniteLoaderResult {
  onItemsRendered(renderedRange: InfiniteLoaderRenderedRange): void
}

export const useInfiniteLoader = ({
  isItemLoaded,
  loadMoreItems
}: UseInfiniteLoaderOptions): UseInfiniteLoaderResult => {
  const onItemsRendered = useCallback(
    ({ overscanStart, overscanStop }: InfiniteLoaderRenderedRange) => {
      const ranges = calcUnloadedRanges(
        isItemLoaded,
        overscanStart,
        overscanStop
      )

      for (const [start, stop] of ranges) {
        loadMoreItems(start, stop)
      }
    },
    [isItemLoaded, loadMoreItems]
  )

  return { onItemsRendered }
}
