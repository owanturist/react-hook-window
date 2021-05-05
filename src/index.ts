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

const on = <K extends keyof HTMLElementEventMap>(
  node: HTMLElement,
  type: K,
  listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => void
): VoidFunction => {
  node.addEventListener(type, listener)

  return () => {
    node.removeEventListener(type, listener)
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

  public static initial = Boundaries.of(0, 0)

  public static of(start: number, stop: number): Boundaries {
    return { start, stop }
  }

  public static calcStart(itemHeight: number, scrollTop: number): number {
    return Math.floor(scrollTop / itemHeight)
  }

  public static calcStop(
    itemHeight: number,
    scrollTop: number,
    height: number
  ): number {
    return Math.floor((scrollTop + height) / itemHeight)
  }

  public static calc(itemHeight: number, node: HTMLElement): Boundaries {
    const start = Boundaries.calcStart(itemHeight, node.scrollTop)
    const stop = Boundaries.calcStop(
      itemHeight,
      node.scrollTop,
      node.clientHeight
    )

    return Boundaries.of(start, stop)
  }

  // FIX +1 on visibleStopIndex
  public static limit(itemCount: number, boundaries: Boundaries): Boundaries {
    const start = clamp(0, boundaries.start, itemCount)
    const stop = clamp(start, boundaries.stop, itemCount)

    return Boundaries.of(start, stop)
  }

  public static indexes({ start, stop }: Boundaries): Array<number> {
    const N = stop - start
    const acc = new Array<number>(N)

    for (let index = 0; index < N; index++) {
      acc[index] = index + start
    }

    return acc
  }

  public static isEqual(left: Boundaries, right: Boundaries): boolean {
    return left.start === right.start && left.stop === right.stop
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

    return cleanup([
      onScrollBegin.cancel,
      onScrollEnd.cancel,
      on(node, 'scroll', onScrollBegin),
      on(node, 'scroll', onScrollEnd)
    ])
  }, [ref])

  return isScrolling
}

export interface OnItemsRenderedParams {
  overscanStartIndex: number
  overscanStopIndex: number
  visibleStartIndex: number
  visibleStopIndex: number
}

export interface UseFixedSizeListOptions {
  itemHeight: number
  itemCount: number
  overscanCount?: number
  scrollTo?: number
  scrollThrottling?: number
  resizeThrottling?: number
  onItemsRendered?(params: OnItemsRenderedParams): void
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
  resizeThrottling = DEFAULT_THROTTLE_MS,
  onItemsRendered
}: UseFixedSizeListOptions): UseFixedSizeListResult<E> => {
  const containerRef = useRef<E>(null)

  const isScrolling = useIsScrolling(containerRef)
  const [boundariesRaw, setBoundariesRaw] = useState(Boundaries.initial)

  const boundaries = useMemo(() => {
    return Boundaries.limit(
      itemCount,
      Boundaries.of(boundariesRaw.start, boundariesRaw.stop)
    )
  }, [itemCount, boundariesRaw.start, boundariesRaw.stop])

  const setBoundaries = useCallback((nextBoundaries: Boundaries) => {
    setBoundariesRaw(current =>
      Boundaries.isEqual(nextBoundaries, current) ? current : nextBoundaries
    )
  }, [])

  const overscan = useMemo(() => {
    return Boundaries.limit(
      itemCount,
      Boundaries.of(
        boundaries.start - overscanCount,
        boundaries.stop + overscanCount
      )
    )
  }, [overscanCount, itemCount, boundaries.start, boundaries.stop])

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
  }, [setBoundaries, itemHeight])

  // container scroll monitor
  useEffect(() => {
    const node = containerRef.current

    if (node == null) {
      return
    }

    let prevScrollTop = 0

    const onScroll = throttle((): void => {
      const prevStart = Boundaries.calcStart(itemHeight, prevScrollTop)
      const prevStop = Boundaries.calcStop(
        itemHeight,
        prevScrollTop,
        node.clientHeight
      )
      const nextBoundaries = Boundaries.calc(itemHeight, node)

      if (
        prevStart !== nextBoundaries.start ||
        prevStop !== nextBoundaries.stop
      ) {
        setBoundaries(nextBoundaries)
      }

      prevScrollTop = node.scrollTop
    }, scrollThrottling)

    return cleanup([
      onScroll.cancel,
      // subscribe on scroll
      on(node, 'scroll', onScroll)
    ])
  }, [setBoundaries, itemHeight, scrollThrottling])

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
  }, [setBoundaries, itemHeight, resizeThrottling])

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
  }, [setBoundaries, scrollTo, boundaries.start, itemCount, itemHeight])

  // props.onItemsRendered monitor
  useEffect(() => {
    if (onItemsRendered == null || Boundaries.initial === boundaries) {
      return
    }

    onItemsRendered({
      overscanStartIndex: overscan.start,
      overscanStopIndex: overscan.stop,
      visibleStartIndex: boundaries.start,
      visibleStopIndex: boundaries.stop
    })
  }, [boundaries, overscan.start, overscan.stop, onItemsRendered])

  return {
    ref: containerRef,
    topOffset: overscan.start * itemHeight,
    bottomOffset: (itemCount - overscan.stop) * itemHeight,
    indexes: useMemo(() => Boundaries.indexes(overscan), [overscan]),
    isScrolling,
    scrollTo,
    scrollToItem
  }
}
