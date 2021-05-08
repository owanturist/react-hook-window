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

  public static calc(
    itemHeight: number,
    scrollTop: number,
    height: number
  ): Boundaries {
    const start = Boundaries.calcStart(itemHeight, scrollTop)
    const stop = Boundaries.calcStop(itemHeight, scrollTop, height)

    return Boundaries.of(start, stop)
  }

  public static limit(itemCount: number, boundaries: Boundaries): Boundaries {
    const start = clamp(0, boundaries.start, itemCount)
    const stop = clamp(start, boundaries.stop, itemCount)

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
  initial,
  itemCount,
  overscanCount
}: {
  initial: Boundaries
  itemCount: number
  overscanCount: number
}): [Boundaries, Boundaries, (boundaries: Boundaries) => void] => {
  const [boundaries, setBoundaries] = useState(initial)

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
    overscan,
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
    onItemsRendered?.({
      overscanStartIndex: overscan.start,
      overscanStopIndex: overscan.stop,
      visibleStartIndex: visible.start,
      visibleStopIndex: visible.stop
    })
  }, [
    visible.start,
    visible.stop,
    overscan.start,
    overscan.stop,
    onItemsRendered
  ])
}

export interface OnItemsRenderedParams {
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
  height,
  itemHeight,
  itemCount,
  overscanCount = DEFAULT_OVERSCAN_COUNT,
  scrollTo: scrollToPx,
  scrollThrottling = DEFAULT_SCROLL_THROTTLE_MS,
  onItemsRendered
}: UseFixedSizeListOptions): UseFixedSizeListResult<E> => {
  const lastItemIndex = Math.max(0, itemCount - 1)
  const containerRef = useRef<E>(null)
  const onScrollRef = useRef<DebouncedFunc<(scrollTop: number) => void>>()

  const isScrolling = useIsScrolling(containerRef)
  const [visible, overscan, setBoundaries] = useBoundaries({
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
    let prevScrollTop = 0

    onScrollRef.current = throttle(
      (scrollTop: number) => {
        // use calc and isEqual
        // myabe don't compare at all?
        const prevStart = Boundaries.calcStart(itemHeight, prevScrollTop)
        const prevStop = Boundaries.calcStop(itemHeight, prevScrollTop, height)
        const nextBoundaries = Boundaries.calc(itemHeight, scrollTop, height)

        if (
          prevStart !== nextBoundaries.start ||
          prevStop !== nextBoundaries.stop
        ) {
          setBoundaries(nextBoundaries)
        }

        prevScrollTop = scrollTop
      },
      scrollThrottling,
      // execute on END of interval so it always applies actual data
      { leading: false, trailing: true }
    )
  }, [setBoundaries, height, itemHeight, scrollThrottling])

  useOnItemsRendered({
    visible: Boundaries.limit(lastItemIndex, visible),
    overscan: Boundaries.limit(lastItemIndex, overscan),
    onItemsRendered
  })

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

    return cleanup([
      () => onScrollRef.current?.cancel(),
      // subscribe on scroll
      on(node, 'scroll', () => onScrollRef.current?.(node.scrollTop))
    ])
  }, [])

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
