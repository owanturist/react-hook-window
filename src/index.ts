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

const DEFAULT_THROTTLE_MS = 16 // ~ 60fps
const IS_SCROLLING_DEBOUNCE_MS = 150

abstract class Boundaries {
  public abstract readonly start: number
  public abstract readonly end: number

  public static initial: Boundaries = { start: 0, end: 0 }

  public static calcStart(itemHeight: number, scrollTop: number): number {
    return Math.floor(scrollTop / itemHeight)
  }

  public static calc(itemHeight: number, node: HTMLElement): Boundaries {
    const start = Boundaries.calcStart(itemHeight, node.scrollTop)
    const end = start + Math.ceil(node.clientHeight / itemHeight)

    return { start, end }
  }

  public static limit(
    itemCount: number,
    { start, end }: Boundaries
  ): Boundaries {
    return {
      start: Math.max(0, start - 1),
      end: Math.min(itemCount, end + 1)
    }
  }
}

export interface UseFixedSizeListOptions {
  itemHeight: number
  itemCount: number
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
  scrollToItem(index: number): void
}

export const useFixedSizeList = <E extends HTMLElement>({
  itemHeight,
  itemCount,
  scrollTo,
  scrollThrottling = DEFAULT_THROTTLE_MS,
  resizeThrottling = DEFAULT_THROTTLE_MS
}: UseFixedSizeListOptions): UseFixedSizeListResult<E> => {
  const [isScrolling, setIsScrolling] = useState(false)
  const [boundaries, setBoundaries] = useState(Boundaries.initial)

  const containerRef = useRef<E>(null)

  const { start, end } = useMemo(
    () => Boundaries.limit(itemCount, boundaries),
    [itemCount, boundaries]
  )

  const scrollToPx = useCallback((px: number) => {
    const node = containerRef.current

    if (node != null && node.scrollTop !== px) {
      node.scrollTo(node.scrollLeft, px)
    }
  }, [])

  const scrollToItem = useCallback(
    (index: number): void => scrollToPx(itemHeight * index),
    [scrollToPx, itemHeight]
  )

  useEffect(() => {
    if (scrollTo != null) {
      scrollToPx(scrollTo)
    }
  }, [scrollToPx, scrollTo])

  useEffect(() => {
    const node = containerRef.current

    if (node == null) {
      return
    }

    setBoundaries(Boundaries.calc(itemHeight, node))
  }, [itemHeight])

  useEffect(() => {
    const node = containerRef.current

    if (node == null) {
      return
    }

    let scrollTop = 0

    const onScroll = throttle((): void => {
      const prevStart = Boundaries.calcStart(itemHeight, scrollTop)
      const nextBoundaries = Boundaries.calc(itemHeight, node)

      if (prevStart !== nextBoundaries.start) {
        setBoundaries(nextBoundaries)
      }

      scrollTop = node.scrollTop
    }, scrollThrottling)

    const onScrollStart = debounce(
      () => setIsScrolling(true),
      IS_SCROLLING_DEBOUNCE_MS,
      { leading: true, trailing: false }
    )

    const onScrollEnd = debounce(
      () => setIsScrolling(false),
      IS_SCROLLING_DEBOUNCE_MS,
      { leading: false, trailing: true }
    )

    node.addEventListener('scroll', onScroll)
    node.addEventListener('scroll', onScrollStart)
    node.addEventListener('scroll', onScrollEnd)

    return () => {
      onScroll.cancel()
      onScrollStart.cancel()
      onScrollEnd.cancel()
      node.removeEventListener('scroll', onScroll)
      node.removeEventListener('scroll', onScrollStart)
      node.removeEventListener('scroll', onScrollEnd)
    }
  }, [itemHeight, scrollThrottling])

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

    if (start > maxStart) {
      setBoundaries(Boundaries.calc(itemHeight, node))
      scrollToPx(itemCount * itemHeight - node.clientHeight)
    }
  }, [scrollToPx, start, itemCount, itemHeight])

  const indexes = useMemo(
    () => Array.from({ length: end - start }).map((_, i) => i + start),
    [start, end]
  )

  return useMemo(
    () => ({
      ref: containerRef,
      topOffset: start * itemHeight,
      bottomOffset: (itemCount - end) * itemHeight,
      indexes,
      isScrolling,
      scrollToItem
    }),
    [start, end, itemHeight, itemCount, indexes, isScrolling, scrollToItem]
  )
}
