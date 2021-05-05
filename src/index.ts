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

  public static limit(itemCount: number, boundaries: Boundaries): Boundaries {
    const itemCount_ = Math.max(0, itemCount)
    const start = clamp(0, boundaries.start, itemCount_)
    const stop = clamp(start, boundaries.stop, itemCount_)

    if (start === boundaries.start && stop === boundaries.stop) {
      return boundaries
    }

    return Boundaries.of(start, stop)
  }

  public static indexes(boundaries: Boundaries): ReadonlyArray<number> {
    const N = Boundaries.diff(boundaries)
    const acc = new Array<number>(N)

    for (let index = 0; index < N; index++) {
      acc[index] = index + boundaries.start
    }

    return acc
  }

  public static diff({ start, stop }: Boundaries): number {
    return stop - start
  }

  public static isEqual(left: Boundaries, right: Boundaries): boolean {
    return left.start === right.start && left.stop === right.stop
  }

  public static isInitial(boundaries: Boundaries): boolean {
    return boundaries === Boundaries.initial
  }

  public static isOverScroll(
    itemCount: number,
    { start, stop }: Boundaries
  ): boolean {
    return start > itemCount && stop > itemCount
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

const useBoundaries = ({
  itemCount,
  overscanCount
}: {
  itemCount: number
  overscanCount: number
}): [Boundaries, Boundaries, (boundaries: Boundaries) => void] => {
  const [boundaries, setBoundaries] = useState(Boundaries.initial)

  const visible = useMemo(() => {
    // checks if scroll position is much further than current boundaries
    // and if so assume accurate boundaries based on previous diff
    if (Boundaries.isOverScroll(itemCount, boundaries)) {
      const start = itemCount - Boundaries.diff(boundaries)

      return Boundaries.of(Math.max(0, start), itemCount)
    }

    return Boundaries.limit(itemCount, boundaries)
  }, [itemCount, boundaries])

  const overscan = useMemo(() => {
    // checks if scroll position is much further than current boundaries
    // and if so assume accurate boundaries based on previous diff
    if (Boundaries.isOverScroll(itemCount, boundaries)) {
      const start = itemCount - Boundaries.diff(boundaries) - overscanCount

      return Boundaries.of(Math.max(0, start), itemCount)
    }

    return Boundaries.limit(
      itemCount,
      Boundaries.of(
        boundaries.start - overscanCount,
        boundaries.stop + overscanCount
      )
    )
  }, [overscanCount, itemCount, boundaries])

  return [
    visible,

    Boundaries.isInitial(boundaries) ? Boundaries.initial : overscan,

    useCallback(next => {
      setBoundaries(prev => (Boundaries.isEqual(next, prev) ? prev : next))
    }, [])
  ]
}

const useOnItemsRendered = ({
  visible,
  overscan,
  onItemsRendered
}: {
  visible: Boundaries
  overscan: Boundaries
  onItemsRendered?(params: OnItemsRenderedParams): void
}): void => {
  useEffect(() => {
    if (onItemsRendered == null || Boundaries.isInitial(visible)) {
      return
    }

    onItemsRendered({
      overscanStartIndex: overscan.start,
      overscanStopIndex: overscan.stop,
      visibleStartIndex: visible.start,
      visibleStopIndex: visible.stop
    })
  }, [visible, overscan.start, overscan.stop, onItemsRendered])
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
  indexes: ReadonlyArray<number>
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
  const [visible, overscan, setBoundaries] = useBoundaries({
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

  useOnItemsRendered({
    // onItemsRendered should limit boundaries per last item index
    // that's why itemCount gets -1
    visible: Boundaries.limit(itemCount - 1, visible),
    overscan: Boundaries.limit(itemCount - 1, overscan),
    onItemsRendered
  })

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

    const onScroll = throttle(
      () => {
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
      },
      scrollThrottling,
      // execute on END of interval so it always applies actual data
      { leading: false, trailing: true }
    )

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

    const resizeListener = throttle(
      () => setBoundaries(Boundaries.calc(itemHeight, node)),
      resizeThrottling,
      // execute on END of interval so it always applies actual data
      { leading: false, trailing: true }
    )

    const observer = new ResizeObserver(resizeListener)

    observer.observe(node)

    return () => {
      resizeListener.cancel()
      observer.unobserve(node)
      observer.disconnect()
    }
  }, [setBoundaries, itemHeight, resizeThrottling])

  // // props.onItemsRendered monitor
  // useEffect(() => {
  //   if (onItemsRendered == null || Boundaries.isInitial(visible)) {
  //     return
  //   }

  //   onItemsRendered({
  //     overscanStartIndex: overscan.start,
  //     overscanStopIndex: overscan.stop,
  //     visibleStartIndex: visible.start,
  //     visibleStopIndex: visible.stop
  //   })
  // }, [visible, overscan.start, overscan.stop, onItemsRendered])

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
