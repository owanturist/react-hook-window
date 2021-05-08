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

class Boundaries {
  public static of(start: number, stop: number): Boundaries {
    return new Boundaries(start, stop)
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

  public static isEqual(prev: Boundaries, next: Boundaries): boolean {
    return (
      prev === next || (prev.start === next.start && prev.stop === next.stop)
    )
  }

  private constructor(
    public readonly start: number,
    public readonly stop: number
  ) {}

  public replace(another: Boundaries): Boundaries {
    return Boundaries.isEqual(this, another) ? this : another
  }

  public limit(itemCount: number, overscanCount = 0): Boundaries {
    const start = clamp(0, this.start - overscanCount, itemCount)
    const stop = clamp(start, this.stop + overscanCount, itemCount)

    if (start === this.start && stop === this.stop) {
      return this
    }

    return Boundaries.of(start, stop)
  }

  public toIndexes(): ReadonlyArray<number> {
    const N = Math.max(0, this.stop - this.start)
    const acc = new Array<number>(N)

    for (let index = 0; index < N; index++) {
      acc[index] = index + this.start
    }

    return acc
  }
}

const useKeepEqual = <T>(
  isEqual: (prev: T, next: T) => boolean,
  value: T
): T => {
  const valueRef = useRef(value)

  if (!isEqual(valueRef.current, value)) {
    valueRef.current = value
  }

  return valueRef.current
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

  const visible = useKeepEqual(
    Boundaries.isEqual,
    useMemo(() => {
      // checks if scroll position is much further than current boundaries
      // and if so assume accurate boundaries based on previous distance
      if (boundaries.start > itemCount && boundaries.stop > itemCount) {
        const start = itemCount - (boundaries.stop - boundaries.start)

        return Boundaries.of(Math.max(0, start), itemCount)
      }

      return boundaries.limit(itemCount)
    }, [boundaries, itemCount])
  )

  const overscan = useKeepEqual(
    Boundaries.isEqual,
    useMemo(() => {
      return visible.limit(itemCount, overscanCount)
    }, [visible, itemCount, overscanCount])
  )

  const visibleIndex = visible.limit(lastItemIndex)
  const overscanIndex = overscan.limit(lastItemIndex)
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
    useCallback(next => setBoundaries(prev => prev.replace(next)), [])
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
    indexes: useMemo(() => boundaries.toIndexes(), [boundaries]),
    isScrolling,
    scrollTo,
    scrollToItem
  }
}
