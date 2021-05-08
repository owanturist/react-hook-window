import {
  RefObject,
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react'
import throttle from 'lodash.throttle'
import debounce from 'lodash.debounce'
import type { DebouncedFunc } from 'lodash'

const DEFAULT_OVERSCAN_COUNT = 1
const DEFAULT_SCROLL_THROTTLE_MS = 16 // ~ 60fps
const IS_SCROLLING_DEBOUNCE_MS = 150

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

const cleanup = (cleanups: ReadonlyArray<VoidFunction>) => (): void => {
  for (const clean of cleanups) {
    clean()
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

const calcPosition = ({
  type,
  index,
  itemHeight,
  height,
  currentPosition
}: {
  type: ScrollPosition
  index: number
  itemHeight: number
  height: number
  currentPosition: number
}): number => {
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
  initial: Boundaries
): [Boundaries, (boundaries: Boundaries) => void] => {
  const [boundaries, setBoundaries] = useState(initial)

  return [
    Boundaries.limitOverScroll(boundaries, itemCount),
    useCallback(
      next => setBoundaries(prev => Boundaries.replace(prev, next)),
      []
    )
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
  scrollTo?: number
  scrollThrottling?: number
  onItemsRendered?(viewport: ListViewport): void
}

export interface UseFixedSizeListResult<E extends HTMLElement> {
  ref: RefObject<E>
  topOffset: number
  bottomOffset: number
  indexes: ReadonlyArray<number>
  isScrolling: boolean
  scrollTo(px: number): void
  scrollToItem(index: number, position?: ScrollPosition): void
}

export const useFixedSizeList = <E extends HTMLElement>({
  height,
  itemHeight,
  itemCount,
  overscanCount = DEFAULT_OVERSCAN_COUNT,
  scrollTo: scrollToPx,
  scrollThrottling = DEFAULT_SCROLL_THROTTLE_MS,
  onItemsRendered
}: UseFixedSizeListOptions): UseFixedSizeListResult<E> => {
  const containerRef = useRef<E>(null)
  const onScrollRef = useRef<DebouncedFunc<(scrollTop: number) => void>>()

  const [isScrolling, setIsScrolling] = useState(false)
  const [boundaries, setBoundaries] = useBoundaries(
    itemCount,
    Boundaries.calc(height, itemHeight, scrollToPx ?? 0)
  )
  const overscan = Boundaries.limit(boundaries, itemCount, overscanCount)

  const scrollTo = useCallback((px: number) => {
    const node = containerRef.current

    if (node != null && node.scrollTop !== px) {
      node.scrollTo(node.scrollLeft, px)
    }
  }, [])

  const scrollToItem = useCallback(
    (index: number, position: ScrollPosition = 'auto'): void => {
      const node = containerRef.current

      if (node != null) {
        scrollTo(
          calcPosition({
            type: position,
            index,
            itemHeight,
            height,
            currentPosition: node.scrollTop
          })
        )
      }
    },
    [scrollTo, height, itemHeight]
  )

  useEffect(() => {
    // the ref keeps onScroll callback so it don't need to (de)attach
    // the listener to node each time the props changes
    onScrollRef.current = throttle(
      (scrollTop: number) => {
        setBoundaries(Boundaries.calc(height, itemHeight, scrollTop))
      },
      scrollThrottling,
      // execute on END of interval so it always applies actual data
      { leading: false, trailing: true }
    )
  }, [setBoundaries, itemHeight, height, scrollThrottling])

  // props.onItemsRendered monitor
  useEffect(() => {
    onItemsRendered?.({
      overscanStart: overscan.start,
      overscanStop: overscan.stop,
      visibleStart: boundaries.start,
      visibleStop: boundaries.stop
    })
  }, [
    onItemsRendered,
    overscan.start,
    overscan.stop,
    boundaries.start,
    boundaries.stop
  ])

  // props.scrollTo monitor
  useEffect(() => {
    if (scrollToPx != null) {
      scrollTo(scrollToPx)
    }
  }, [scrollTo, scrollToPx])

  // props.height and props.itemHeight monitor
  useEffect(() => {
    const node = containerRef.current

    if (node == null) {
      return
    }

    setBoundaries(Boundaries.calc(height, itemHeight, node.scrollTop))
  }, [setBoundaries, itemHeight, height])

  // container scroll monitor
  useEffect(() => {
    const node = containerRef.current

    if (node == null) {
      return
    }

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

    return cleanup([
      onScrollBegin.cancel,
      onScrollEnd.cancel,
      () => onScrollRef.current?.cancel(),
      onPassiveScroll(node, onScrollBegin),
      onPassiveScroll(node, onScrollEnd),
      onPassiveScroll(node, () => onScrollRef.current?.(node.scrollTop))
    ])
  }, [])

  return {
    ref: containerRef,
    topOffset: overscan.start * itemHeight,
    bottomOffset: (itemCount - overscan.stop) * itemHeight,
    indexes: useMemo(() => {
      return range(overscan.start, overscan.stop)
    }, [overscan.start, overscan.stop]),
    isScrolling,
    scrollTo,
    scrollToItem
  }
}
