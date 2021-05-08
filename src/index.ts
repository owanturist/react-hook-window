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
    boundaries: Boundaries,
    itemCount: number,
    overscanCount = 0
  ): Boundaries {
    const start = clamp(0, boundaries.start - overscanCount, itemCount)
    const stop = clamp(start, boundaries.stop + overscanCount, itemCount)

    if (start === boundaries.start && stop === boundaries.stop) {
      return boundaries
    }

    return Boundaries.of(start, stop)
  }

  public static toIndexes({ start, stop }: Boundaries): ReadonlyArray<number> {
    const N = Math.max(0, stop - start)
    const acc = new Array<number>(N)

    for (let index = 0; index < N; index++) {
      acc[index] = index + start
    }

    return acc
  }
}

const useReplaceBoundaries = ({ start, stop }: Boundaries): Boundaries => {
  return useMemo(() => Boundaries.of(start, stop), [start, stop])
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

  const visible = useReplaceBoundaries(
    useMemo(() => {
      // checks if scroll position is much further than current boundaries
      // and if so assume accurate boundaries based on previous distance
      if (boundaries.start > itemCount && boundaries.stop > itemCount) {
        const start = itemCount - (boundaries.stop - boundaries.start)

        return Boundaries.of(Math.max(0, start), itemCount)
      }

      return Boundaries.limit(boundaries, itemCount)
    }, [boundaries, itemCount])
  )

  const overscan = useReplaceBoundaries(
    useMemo(() => {
      return Boundaries.limit(visible, itemCount, overscanCount)
    }, [visible, itemCount, overscanCount])
  )

  const visibleIndex = useReplaceBoundaries(
    Boundaries.limit(visible, lastItemIndex)
  )
  const overscanIndex = useReplaceBoundaries(
    Boundaries.limit(overscan, lastItemIndex)
  )
  const viewport = useMemo(
    () => ({
      overscanStartIndex: overscanIndex.start,
      overscanStopIndex: overscanIndex.stop,
      visibleStartIndex: visibleIndex.start,
      visibleStopIndex: visibleIndex.stop
    }),
    [overscanIndex, visibleIndex]
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
  const [viewport, boundaries, setBoundaries] = useBoundaries({
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
    topOffset: boundaries.start * itemHeight,
    bottomOffset: (itemCount - boundaries.stop) * itemHeight,
    indexes: useMemo(() => Boundaries.toIndexes(boundaries), [boundaries]),
    isScrolling,
    scrollTo,
    scrollToItem
  }
}
