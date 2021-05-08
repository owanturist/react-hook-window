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

abstract class Boundaries {
  public abstract readonly start: number
  public abstract readonly stop: number

  public static of(start: number, stop: number): Boundaries {
    return { start, stop }
  }

  public static calc(
    itemHeight: number,
    scrollTop: number,
    height: number
  ): Boundaries {
    const start = Math.floor(scrollTop / itemHeight)
    const stop = Math.floor((scrollTop + height) / itemHeight)

    return Boundaries.of(start, stop)
  }

  public static replace(prev: Boundaries, next: Boundaries): Boundaries {
    if (
      prev === next ||
      (prev.start === next.start && prev.stop === next.stop)
    ) {
      return prev
    }

    return next
  }

  public static limit(
    start: number,
    stop: number,
    itemCount: number,
    overscanCount = 0
  ): Boundaries {
    return Boundaries.of(
      clamp(0, start - overscanCount, itemCount),
      clamp(start, stop + overscanCount, itemCount)
    )
  }
}

const useBoundaries = ({
  initial,
  itemCount,
  overscanCount
}: {
  initial: Boundaries
  itemCount: number
  overscanCount: number
}): [ListViewport, Boundaries, (boundaries: Boundaries) => void] => {
  const lastItemIndex = Math.max(0, itemCount - 1)
  const [boundaries, setBoundaries] = useState(initial)

  const visible = useMemo(() => {
    // checks if scroll position is much further than current boundaries
    // and if so assume accurate boundaries based on previous distance
    if (boundaries.start > itemCount && boundaries.stop > itemCount) {
      const start = itemCount - (boundaries.stop - boundaries.start)

      return Boundaries.of(Math.max(0, start), itemCount)
    }

    return Boundaries.limit(boundaries.start, boundaries.stop, itemCount)
  }, [boundaries.start, boundaries.stop, itemCount])

  const overscan = useMemo(() => {
    return Boundaries.limit(
      visible.start,
      visible.stop,
      itemCount,
      overscanCount
    )
  }, [visible.start, visible.stop, itemCount, overscanCount])

  const visibleIndex = Boundaries.limit(
    visible.start,
    visible.stop,
    lastItemIndex
  )
  const overscanIndex = Boundaries.limit(
    visible.start,
    visible.stop,
    lastItemIndex
  )
  const viewport = useMemo(
    () => ({
      overscanStartIndex: overscanIndex.start,
      overscanStopIndex: overscanIndex.stop,
      visibleStartIndex: visibleIndex.start,
      visibleStopIndex: visibleIndex.stop
    }),
    [
      overscanIndex.start,
      overscanIndex.stop,
      visibleIndex.start,
      visibleIndex.stop
    ]
  )

  return [
    viewport,
    overscan,
    useCallback(
      next => setBoundaries(prev => Boundaries.replace(prev, next)),
      []
    )
  ]
}

export interface ListViewport {
  overscanStartIndex: number
  overscanStopIndex: number
  visibleStartIndex: number
  visibleStopIndex: number
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
  scrollToItem(index: number): void
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
  const [viewport, { start, stop }, setBoundaries] = useBoundaries({
    initial: Boundaries.calc(itemHeight, scrollToPx ?? 0, height),
    itemCount,
    overscanCount
  })

  const scrollTo = useCallback((px: number) => {
    const node = containerRef.current

    if (node != null && node.scrollTop !== px) {
      node.scrollTo(node.scrollLeft, px)
    }
  }, [])

  const scrollToItem = useCallback(
    (index: number): void => scrollTo(itemHeight * index),
    [scrollTo, itemHeight]
  )

  useEffect(() => {
    // the ref keeps onScroll callback so it don't need to (de)attach
    // the listener to node each time the props changes
    onScrollRef.current = throttle(
      (scrollTop: number) => {
        setBoundaries(Boundaries.calc(itemHeight, scrollTop, height))
      },
      scrollThrottling,
      // execute on END of interval so it always applies actual data
      { leading: false, trailing: true }
    )
  }, [setBoundaries, itemHeight, height, scrollThrottling])

  // props.onItemsRendered monitor
  useEffect(() => onItemsRendered?.(viewport), [onItemsRendered, viewport])

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

    setBoundaries(Boundaries.calc(itemHeight, node.scrollTop, height))
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
    topOffset: start * itemHeight,
    bottomOffset: (itemCount - stop) * itemHeight,
    indexes: useMemo(() => range(start, stop), [start, stop]),
    isScrolling,
    scrollTo,
    scrollToItem
  }
}
