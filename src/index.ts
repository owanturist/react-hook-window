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
  scrollThrottling?: number
  resizeThrottling?: number
}

export interface UseFixedSizeListResult<E extends HTMLElement> {
  ref: RefObject<E>
  startOffset: number
  endOffset: number
  indexes: Array<number>
  isScrolling: boolean
  scrollToItem(index: number): void
}

export const useFixedSizeList = <E extends HTMLElement>({
  itemHeight,
  itemCount,
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

  const scrollToItem = useCallback(
    (index: number): void => {
      const node = containerRef.current

      if (node) {
        node.scrollTo(node.scrollLeft, itemHeight * index)
      }
    },
    [itemHeight]
  )

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

    const onScrollStartEnd = debounce(
      () => setIsScrolling(x => !x),
      IS_SCROLLING_DEBOUNCE_MS,
      { leading: true, trailing: true }
    )

    node.addEventListener('scroll', onScroll)
    node.addEventListener('scroll', onScrollStartEnd)

    return () => {
      onScroll.cancel()
      onScrollStartEnd.cancel()
      node.removeEventListener('scroll', onScroll)
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
      node.scrollTo(node.scrollLeft, itemCount * itemHeight - node.clientHeight)
    }
  }, [start, itemCount, itemHeight])

  const indexes = useMemo(
    () => Array.from({ length: end - start }).map((_, i) => i + start),
    [start, end]
  )

  return useMemo(
    () => ({
      ref: containerRef,
      startOffset: start * itemHeight,
      endOffset: (itemCount - end) * itemHeight,
      indexes,
      isScrolling,
      scrollToItem
    }),
    [start, end, itemHeight, itemCount, indexes, isScrolling, scrollToItem]
  )
}
