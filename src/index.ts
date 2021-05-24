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

const calcStartPosition = (index: number, itemHeight: number): number => {
  return itemHeight * index
}

const calcEndPosition = (
  index: number,
  itemHeight: number,
  height: number
): number => {
  return calcStartPosition(index, itemHeight) + itemHeight - height
}

const calcCenterPosition = (
  index: number,
  itemHeight: number,
  height: number
): number => {
  return calcStartPosition(index, itemHeight) + itemHeight / 2 - height / 2
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
  index: number,
  itemHeight: number,
  height: number,
  currentPosition: number
): number => {
  const startPosition = calcStartPosition(index, itemHeight)
  const endPosition = calcEndPosition(index, itemHeight, height)

  if (
    currentPosition - startPosition > height ||
    endPosition - currentPosition > height
  ) {
    return calcCenterPosition(index, itemHeight, height)
  }

  return calcShortestPosition(startPosition, endPosition, currentPosition)
}

const calcAutoPosition = (
  index: number,
  itemHeight: number,
  height: number,
  currentPosition: number
): number => {
  const startPosition = calcStartPosition(index, itemHeight)
  const endPosition = calcEndPosition(index, itemHeight, height)

  return calcShortestPosition(startPosition, endPosition, currentPosition)
}

const calcPosition = (
  type: ScrollPosition,
  index: number,
  itemHeight: number,
  height: number,
  currentPosition: number
): number => {
  if (type === 'start') {
    return calcStartPosition(index, itemHeight)
  }

  if (type === 'end') {
    return calcEndPosition(index, itemHeight, height)
  }

  if (type === 'center') {
    return calcCenterPosition(index, itemHeight, height)
  }

  if (type === 'smart') {
    return calcSmartPosition(index, itemHeight, height, currentPosition)
  }

  return calcAutoPosition(index, itemHeight, height, currentPosition)
}

const calcInitialScroll = (
  options: number | { index: number; position?: ScrollPosition },
  itemHeight: number,
  height: number
): number => {
  if (typeof options === 'number') {
    return options
  }

  return calcPosition(
    options.position ?? 'auto',
    options.index,
    itemHeight,
    height,
    0
  )
}

abstract class Boundaries {
  public abstract readonly start: number
  public abstract readonly stop: number

  public static calc(
    height: number,
    itemHeight: number,
    scrollTop: number
  ): Boundaries {
    const start = Math.floor(scrollTop / itemHeight)
    const stop = Math.ceil((scrollTop + height) / itemHeight)

    return { start, stop }
  }

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

export type ScrollPosition = 'auto' | 'smart' | 'center' | 'end' | 'start'

export interface ListViewport {
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
  onItemsRendered?(viewport: ListViewport): void
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

  const [isScrolling, setIsScrolling] = useState(false)
  const [boundaries, setBoundaries] = useBoundaries(itemCount, () => {
    return Boundaries.calc(
      height,
      itemHeight,
      calcInitialScroll(initialScroll, itemHeight, height)
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
      calcInitialScroll(initialScroll, itemHeight, height)
    )
    // it does not want to watch the values' changes on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container])

  // props.height and props.itemHeight monitor
  useEffect(() => {
    if (container != null) {
      setBoundaries(Boundaries.calc(height, itemHeight, container.scrollTop))
    }
  }, [setBoundaries, container, itemHeight, height])

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
        setBoundaries(Boundaries.calc(height, itemHeight, scrollTop))
      },
      scrollThrottling,
      // execute on END of interval so it always applies actual data
      { leading: false, trailing: true }
    )

    // the ref keeps onScroll callback so it doesn't need to reattach
    // the listener to node each time the props changes
    onScrollRef.current = onScroll

    return onScroll.cancel
  }, [setBoundaries, itemHeight, height, scrollThrottling])

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
    topOffset: start * itemHeight,
    bottomOffset: (itemCount - stop) * itemHeight,

    indexes: useMemo(() => range(start, stop), [start, stop]),

    scrollTo: useCallback(
      (px: number) => container?.scrollTo(container.scrollLeft, px),
      [container]
    ),

    scrollToItem: useCallback(
      (index: number, position: ScrollPosition = 'auto'): void => {
        container?.scrollTo(
          container.scrollLeft,
          calcPosition(position, index, itemHeight, height, container.scrollTop)
        )
      },
      [container, height, itemHeight]
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

export interface InfiniteLoaderViewport {
  overscanStart: number
  overscanStop: number
}

export interface UseInfiniteLoaderOptions {
  isItemLoaded(index: number): boolean
  loadMoreItems(startIndex: number, stopIndex: number): void
}

export interface UseInfiniteLoaderResult {
  onItemsRendered(viewport: InfiniteLoaderViewport): void
}

export const useInfiniteLoader = ({
  isItemLoaded,
  loadMoreItems
}: UseInfiniteLoaderOptions): UseInfiniteLoaderResult => {
  const onItemsRendered = useCallback(
    ({ overscanStart, overscanStop }: InfiniteLoaderViewport) => {
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
