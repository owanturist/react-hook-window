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

const DEFAULT_OVERSCAN_COUNT = 1
const DEFAULT_THROTTLE_MS = 16 // ~ 60fps
const IS_SCROLLING_DEBOUNCE_MS = 150

const clamp = (min: number, max: number, value: number): number => {
  return Math.max(min, Math.min(value, max))
}

abstract class Boundaries {
  public abstract readonly start: number
  public abstract readonly stop: number

  public static initial: Boundaries = { start: 0, stop: 0 }

  public static calcStart(itemHeight: number, scrollTop: number): number {
    return Math.floor(scrollTop / itemHeight)
  }

  public static calc(itemHeight: number, node: HTMLElement): Boundaries {
    const start = Boundaries.calcStart(itemHeight, node.scrollTop)
    const stop = start + Math.ceil(node.clientHeight / itemHeight)

    return { start, stop }
  }

  public static overscan(
    overscanCount: number,
    itemCount: number,
    boundaries: Boundaries
  ): Boundaries {
    const start = clamp(0, boundaries.start - overscanCount, itemCount)

    return {
      start,
      stop: clamp(start, boundaries.stop + overscanCount, itemCount)
    }
  }

  public static indexes({ start, stop }: Boundaries): Array<number> {
    const N = stop - start
    const acc = new Array<number>(N)

    for (let index = 0; index < N; index++) {
      acc[index] = index + start
    }

    return acc
  }
}

const useIsScrolling = <E extends HTMLElement>(ref: RefObject<E>): boolean => {
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    const node = ref.current

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

    node.addEventListener('scroll', onScrollBegin)
    node.addEventListener('scroll', onScrollEnd)

    return () => {
      onScrollBegin.cancel()
      onScrollEnd.cancel()
      node.removeEventListener('scroll', onScrollBegin)
      node.removeEventListener('scroll', onScrollEnd)
    }
  }, [ref])

  return isScrolling
}

export interface UseFixedSizeListOptions {
  itemHeight: number
  itemCount: number
  overscanCount?: number
  scrollTo?: number
  scrollThrottling?: number
  resizeThrottling?: number
}

export interface UseFixedSizeListResult<E extends HTMLElement> {
  ref: RefObject<E>
  topOffset: number
  bottomOffset: number
  indexes: Array<number>
  isScrolling: boolean
  scrollTo(px: number): void
  scrollToItem(index: number): void
}

export const useFixedSizeList = <E extends HTMLElement>({
  itemHeight,
  itemCount,
  overscanCount = DEFAULT_OVERSCAN_COUNT,
  scrollTo: scrollTop,
  scrollThrottling = DEFAULT_THROTTLE_MS,
  resizeThrottling = DEFAULT_THROTTLE_MS
}: UseFixedSizeListOptions): UseFixedSizeListResult<E> => {
  const containerRef = useRef<E>(null)

  const isScrolling = useIsScrolling(containerRef)
  const [boundaries, setBoundaries] = useState(Boundaries.initial)

  const overscanned = useMemo(
    () => Boundaries.overscan(overscanCount, itemCount, boundaries),
    [overscanCount, itemCount, boundaries]
  )

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

  // props.scrollTo monitor
  useEffect(() => {
    if (scrollTop != null) {
      scrollTo(scrollTop)
    }
  }, [scrollTo, scrollTop])

  // props.itemHeight monitor
  useEffect(() => {
    const node = containerRef.current

    if (node == null) {
      return
    }

    setBoundaries(Boundaries.calc(itemHeight, node))
  }, [itemHeight])

  // container scroll monitor
  useEffect(() => {
    const node = containerRef.current

    if (node == null) {
      return
    }

    let prevScrollTop = 0

    const onScroll = throttle((): void => {
      const prevStart = Boundaries.calcStart(itemHeight, prevScrollTop)
      const nextBoundaries = Boundaries.calc(itemHeight, node)

      if (prevStart !== nextBoundaries.start) {
        setBoundaries(nextBoundaries)
      }

      prevScrollTop = node.scrollTop
    }, scrollThrottling)

    node.addEventListener('scroll', onScroll)

    return () => {
      onScroll.cancel()
      node.removeEventListener('scroll', onScroll)
    }
  }, [itemHeight, scrollThrottling])

  // container size monitor
  useEffect(() => {
    const node = containerRef.current

    if (node == null) {
      return
    }

    const resizeListener = throttle((): void => {
      setBoundaries(Boundaries.calc(itemHeight, node))
    }, resizeThrottling)

    const observer = new ResizeObserver(resizeListener)

    observer.observe(node)

    return () => {
      resizeListener.cancel()
      observer.unobserve(node)
      observer.disconnect()
    }
  }, [itemHeight, resizeThrottling])

  // keep eye on overscroll when itemCount drops
  useEffect(() => {
    const node = containerRef.current

    if (node == null) {
      return
    }

    const maxItemsInWindow = Math.ceil(node.clientHeight / itemHeight)
    const maxStart = itemCount - maxItemsInWindow

    if (boundaries.start > maxStart) {
      setBoundaries(Boundaries.calc(itemHeight, node))
      scrollTo(itemCount * itemHeight - node.clientHeight)
    }
  }, [scrollTo, boundaries.start, itemCount, itemHeight])

  return {
    ref: containerRef,
    topOffset: overscanned.start * itemHeight,
    bottomOffset: (itemCount - overscanned.stop) * itemHeight,
    indexes: useMemo(() => Boundaries.indexes(overscanned), [overscanned]),
    isScrolling,
    scrollTo,
    scrollToItem
  }
}
