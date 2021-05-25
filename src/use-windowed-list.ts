import { useRef, useState, useEffect, useMemo } from 'react'
import throttle from 'lodash.throttle'
import debounce from 'lodash.debounce'

import { usePermanent } from './use-permanent'
import { useRefCallback } from './use-ref-callback'
import { ListBoundaries } from './list-boundaries'
import { ListViewport, initListViewport } from './list-viewport'
import { ScrollPosition, calcScrollPosition } from './scroll-position'
import { noop, range, onPassiveScroll } from './helpers'

const DEFAULT_OVERSCAN_COUNT = 1
const DEFAULT_SCROLL_THROTTLE_MS = 16 // ~ 60fps
const IS_SCROLLING_DEBOUNCE_MS = 150

const calcInitialScroll = (
  options: number | { index: number; position?: ScrollPosition },
  viewport: ListViewport,
  containerSize: number
): number => {
  if (typeof options === 'number') {
    return options
  }

  return calcScrollPosition(
    options.position ?? 'auto',
    viewport.getSpaceBefore(options.index),
    viewport.getItemSize(options.index),
    containerSize,
    0
  )
}

const useBoundaries = (
  itemCount: number,
  init: () => ListBoundaries
): [ListBoundaries, (boundaries: ListBoundaries) => void] => {
  const [boundaries, setBoundaries] = useState(init)

  return [
    ListBoundaries.limitOverScroll(boundaries, itemCount),
    usePermanent(() => (next: ListBoundaries) => {
      setBoundaries(prev => ListBoundaries.replace(prev, next))
    })
  ]
}

export interface ListRenderedRange {
  overscanStart: number
  overscanStop: number
  visibleStart: number
  visibleStop: number
}

export interface UseWindowedListOptions {
  height: number
  itemHeight: number | ((index: number) => number)
  itemCount: number
  overscanCount?: number
  initialScroll?: number | { index: number; position?: ScrollPosition }
  scrollThrottling?: number
  onItemsRendered?(renderedRange: ListRenderedRange): void
}

// #TODO extends by ListRenderedRange
export interface UseWindowedListResult<E extends HTMLElement> {
  topOffset: number
  bottomOffset: number
  indexes: ReadonlyArray<number>
  isScrolling: boolean
  setRef(node: E): void
  scrollTo(px: number): void
  scrollToItem(index: number, position?: ScrollPosition): void
}

export const useWindowedList = <E extends HTMLElement>({
  height,
  itemHeight,
  itemCount,
  overscanCount = DEFAULT_OVERSCAN_COUNT,
  initialScroll = 0,
  scrollThrottling = DEFAULT_SCROLL_THROTTLE_MS,
  onItemsRendered
}: UseWindowedListOptions): UseWindowedListResult<E> => {
  // it wants to keep track when a container gets changed
  const [container, setContainer] = useState<E>()
  const onScrollRef = useRef<(scrollTop: number) => void>(noop)
  const onScrollingRef = useRef<() => void>(noop)

  const viewport = useMemo(
    () => initListViewport(itemHeight, itemCount),
    [itemHeight, itemCount]
  )

  const [isScrolling, setIsScrolling] = useState(false)
  const [boundaries, setBoundaries] = useBoundaries(itemCount, () => {
    return viewport.calcBoundaries(
      height,
      calcInitialScroll(initialScroll, viewport, height)
    )
  })
  const { start, stop } = ListBoundaries.limit(
    boundaries,
    itemCount,
    overscanCount
  )

  // props.onItemsRendered monitor
  useEffect(() => {
    if (container != null) {
      onItemsRendered?.({
        overscanStart: start,
        overscanStop: stop,
        visibleStart: boundaries.start,
        visibleStop: boundaries.stop
      })
    }
  }, [
    container,
    onItemsRendered,
    start,
    stop,
    boundaries.start,
    boundaries.stop
  ])

  // set initial scroll
  useEffect(() => {
    container?.scrollTo(
      container.scrollLeft,
      calcInitialScroll(initialScroll, viewport, height)
    )
    // it does not want to watch the values' changes on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container])

  // props.height and props.itemHeight monitor
  useEffect(() => {
    if (container != null) {
      setBoundaries(viewport.calcBoundaries(height, container.scrollTop))
    }
  }, [setBoundaries, container, viewport, height])

  // define onScrolling handler
  useEffect(() => {
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

    // the ref keeps onScrolling callback so it never needs to reattach the listener
    onScrollingRef.current = () => {
      onScrollBegin()
      onScrollEnd()
    }

    return () => {
      onScrollBegin.cancel()
      onScrollEnd.cancel()
    }
  }, [])

  // define onScroll handler
  useEffect(() => {
    const onScroll = throttle(
      (scrollTop: number) => {
        setBoundaries(viewport.calcBoundaries(height, scrollTop))
      },
      scrollThrottling,
      // execute on END of interval so it always applies actual boundaries
      { leading: false, trailing: true }
    )

    // the ref keeps onScroll callback so it doesn't need to reattach
    // the listener to node each time the props changes
    onScrollRef.current = onScroll

    return onScroll.cancel
  }, [setBoundaries, viewport, height, scrollThrottling])

  // container scroll monitor
  useEffect(() => {
    if (container == null) {
      return
    }

    return onPassiveScroll(container, () => {
      onScrollingRef.current()
      onScrollRef.current(container.scrollTop)
    })
  }, [container])

  return {
    isScrolling,
    setRef: setContainer,
    topOffset: useMemo(() => viewport.getSpaceBefore(start), [viewport, start]),
    bottomOffset: useMemo(() => viewport.getSpaceAfter(stop), [viewport, stop]),
    indexes: useMemo(() => range(start, stop), [start, stop]),

    scrollTo: useRefCallback(px => {
      container?.scrollTo(container.scrollLeft, px)
    }),

    scrollToItem: useRefCallback((index, position = 'auto') => {
      container?.scrollTo(
        container.scrollLeft,
        calcScrollPosition(
          position,
          viewport.getSpaceBefore(index),
          viewport.getItemSize(index),
          height,
          container.scrollTop
        )
      )
    })
  }
}
