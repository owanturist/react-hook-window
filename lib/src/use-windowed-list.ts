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

export interface ListRenderedRange {
  overscanStart: number
  overscanStop: number
  visibleStart: number
  visibleStop: number
}

export type ListLayout = 'vertical' | 'horizontal' | 'horizontal-rtl'

export type InitialListScroll =
  | number
  | { index: number; position?: ScrollPosition }

// @TODO add containerRef as an option
// @TODO add offset to set a scroll position from which first item starts
/**
 * @public
 */
export interface UseWindowedListOptions {
  /**
   * A size of the container which determine the number of items visible at any given time.
   * Represents either hight for vertical or width for horizontal containers.
   */
  containerSize: number
  /**
   * A size of an item.
   * Can take a number representing constant items' size or
   * a function returning an item's size by its index for variable size items.
   * Represents either hight for vertical or width for horizontal containers.
   */
  itemSize: number | ((index: number) => number)
  /**
   * A total count of items.
   */
  itemCount: number
  /**
   * The number of items to render outside of the visible area.
   *
   * It's important to set the value to a number greater than 0
   * to make it possible to focus via tab button on the next
   * or previous not yet visible items.
   *
   * Setting the value too high will degrade performance but keeping
   * the value reasonably low could improve UX by pre-rendering not yet visible items.
   *
   * @default 1
   */
  overscanCount?: number
  layout?: ListLayout
  initialScroll?: InitialListScroll
  containerOnScrollThrottleInterval?: number
  containerIsScrollingDebounceInterval?: number
  onItemsRendered?(renderedRange: ListRenderedRange): void
}

/**
 * @public
 */
export interface UseWindowedListResult<E extends HTMLElement>
  extends ListRenderedRange {
  /**
   * A container node.
   */
  container: null | E
  /**
   * A blank space before the first visible item.
   */
  startSpace: number
  endSpace: number
  indexes: Array<number>
  isScrolling: boolean
  setRef(node: null | E): void
  scrollTo(px: number): void
  scrollToItem(index: number, position?: ScrollPosition): void
}

/**
 * Title foo
 *
 * @returns {UseWindowedListResult}
 */
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
