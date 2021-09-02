import { useRef, useState, useEffect, useMemo } from 'react'
import throttle from 'lodash.throttle'
import debounce from 'lodash.debounce'
import {
  setNormalizedScrollLeft,
  getNormalizedScrollLeft
} from 'normalize-scroll-left'

import { usePermanent } from './use-permanent'
import { useRefCallback } from './use-ref-callback'
import { ListBoundaries } from './list-boundaries'
import { ListViewport, initListViewport } from './list-viewport'
import { ScrollPosition, calcScrollPosition } from './scroll-position'
import { noop, range, onPassiveScroll, positive } from './helpers'

const DEFAULT_OVERSCAN_COUNT = 1
const DEFAULT_SCROLL_THROTTLE_MS = 16 // ~ 60fps
const DEFAULT_IS_SCROLLING_DEBOUNCE_MS = 150

const layoutDirection = (layout: ListLayout): 'rtl' | 'ltr' => {
  return layout === 'horizontal-rtl' ? 'rtl' : 'ltr'
}

const getLayoutScroll = (node: HTMLElement, layout: ListLayout): number => {
  if (layout === 'vertical') {
    return node.scrollTop
  }

  if (layout === 'horizontal') {
    return node.scrollLeft
  }

  return (
    node.scrollWidth -
    node.clientWidth -
    getNormalizedScrollLeft(node, layoutDirection(layout))
  )
}

const scrollLayoutTo = (
  node: HTMLElement,
  layout: ListLayout,
  position: number
): void => {
  if (layout === 'vertical') {
    node.scrollTop = position
  } else if (layout === 'horizontal') {
    node.scrollLeft = position
  } else {
    setNormalizedScrollLeft(
      node,
      node.scrollWidth - node.clientWidth - position,
      layoutDirection(layout)
    )
  }
}

const calcInitialScroll = (
  options: InitialListScroll,
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

// @TODO rename *Start to *StartingWithIndex, and *Stop to *EndingBeforeIndex

// , and stop to untilIndex, range to intervals
export interface ListRenderedRange {
  overscanStart: number
  overscanStop: number
  visibleStart: number
  visibleStop: number
}

export type ItemDynamicSize = (index: number) => number

export type ItemSize = number | ItemDynamicSize

export type ListLayout = 'vertical' | 'horizontal' | 'horizontal-rtl'

export type InitialListElementScroll = {
  index: number
  position?: ScrollPosition
}

export type InitialListScroll = number | InitialListElementScroll

// @TODO add containerRef as an option
// @TODO add offset to set a scroll position from which first item starts
export interface UseWindowedListOptions {
  containerSize: number
  itemSize: ItemSize
  itemCount: number
  overscanCount?: number
  layout?: ListLayout
  initialScroll?: InitialListScroll
  containerOnScrollThrottleInterval?: number
  containerIsScrollingDebounceInterval?: number
  onItemsRendered?(renderedRange: ListRenderedRange): void
}

export interface UseWindowedListResult<E extends HTMLElement>
  extends ListRenderedRange {
  startSpace: number
  endSpace: number
  indexes: ReadonlyArray<number>
  isScrolling: boolean
  container: null | E
  // @TODO rename to setContainerRef
  setRef(node: null | E): void
  scrollTo(px: number): void
  scrollToItem(index: number, position?: ScrollPosition): void
}

export const useWindowedList = <E extends HTMLElement>({
  containerSize,
  itemSize,
  itemCount,
  overscanCount = DEFAULT_OVERSCAN_COUNT,
  layout = 'vertical',
  initialScroll = 0,
  containerOnScrollThrottleInterval = DEFAULT_SCROLL_THROTTLE_MS,
  containerIsScrollingDebounceInterval = DEFAULT_IS_SCROLLING_DEBOUNCE_MS,
  onItemsRendered
}: UseWindowedListOptions): UseWindowedListResult<E> => {
  // it wants to keep track when a container gets changed
  const [container, setContainer] = useState<null | E>(null)
  const onScrollRef = useRef<(scrollTop: number) => void>(noop)
  const onScrollingRef = useRef<VoidFunction>(noop)

  const viewport = useMemo(
    () => initListViewport(itemSize, itemCount),
    [itemSize, itemCount]
  )

  const [isScrolling, setIsScrolling] = useState(false)
  const [boundaries, setBoundaries] = useBoundaries(itemCount, () => {
    return viewport.calcBoundaries(
      containerSize,
      calcInitialScroll(initialScroll, viewport, containerSize)
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
    if (container != null) {
      scrollLayoutTo(
        container,
        layout,
        calcInitialScroll(initialScroll, viewport, containerSize)
      )
    }

    // @TODO try to avoid this
    // it does not want to watch the values' changes on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, layout])

  // props.height and props.itemHeight monitor
  useEffect(() => {
    if (container != null) {
      const scrollPosition = getLayoutScroll(container, layout)

      setBoundaries(viewport.calcBoundaries(containerSize, scrollPosition))
    }
  }, [setBoundaries, container, layout, viewport, containerSize])

  // define onScrolling handler
  useEffect(() => {
    const onScrollBegin = debounce(
      () => setIsScrolling(true),
      containerIsScrollingDebounceInterval,
      { leading: true, trailing: false }
    )

    const onScrollEnd = debounce(
      () => setIsScrolling(false),
      containerIsScrollingDebounceInterval,
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
  }, [containerIsScrollingDebounceInterval])

  // define onScroll handler
  useEffect(() => {
    const onScroll = throttle(
      (scrollPosition: number) => {
        setBoundaries(viewport.calcBoundaries(containerSize, scrollPosition))
      },
      containerOnScrollThrottleInterval,
      // execute on END of interval so it always applies actual boundaries
      { leading: false, trailing: true }
    )

    // the ref keeps onScroll callback so it doesn't need to reattach
    // the listener to node each time the props changes
    onScrollRef.current = onScroll

    return onScroll.cancel
  }, [
    setBoundaries,
    viewport,
    containerSize,
    containerOnScrollThrottleInterval
  ])

  // container scroll monitor
  useEffect(() => {
    if (container == null) {
      return
    }

    return onPassiveScroll(container, () => {
      onScrollingRef.current()
      onScrollRef.current(getLayoutScroll(container, layout))
    })
  }, [container, layout])

  return {
    container,
    isScrolling,
    setRef: setContainer,

    overscanStart: start,
    overscanStop: stop,
    visibleStart: boundaries.start,
    visibleStop: boundaries.stop,

    startSpace: useMemo(
      () => viewport.getSpaceBefore(start),
      [viewport, start]
    ),
    endSpace: useMemo(
      () => viewport.getSpaceAfter(positive(stop - 1)),
      [viewport, stop]
    ),
    indexes: useMemo(() => range(start, stop), [start, stop]),

    scrollTo: useRefCallback(px => {
      if (container != null) {
        scrollLayoutTo(container, layout, px)
      }
    }),

    scrollToItem: useRefCallback((index, position = 'auto') => {
      if (container != null) {
        scrollLayoutTo(
          container,
          layout,
          calcScrollPosition(
            position,
            viewport.getSpaceBefore(index),
            viewport.getItemSize(index),
            containerSize,
            getLayoutScroll(container, layout)
          )
        )
      }
    })
  }
}
