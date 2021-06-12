import { useRef, useState, useEffect, useMemo } from 'react'
import throttle from 'lodash.throttle'
import debounce from 'lodash.debounce'

import { usePermanent } from './use-permanent'
import { useRefCallback } from './use-ref-callback'
import { ListBoundaries } from './list-boundaries'
import { ListViewport, initListViewport } from './list-viewport'
import { ScrollPosition, calcScrollPosition } from './scroll-position'
import { noop, range, onPassiveScroll, positive } from './helpers'

const DEFAULT_OVERSCAN_COUNT = 1
const DEFAULT_SCROLL_THROTTLE_MS = 16 // ~ 60fps
const IS_SCROLLING_DEBOUNCE_MS = 150

const scrollTo = (
  node: HTMLElement,
  isVerticalLayout: boolean,
  position: number
): void => {
  if (isVerticalLayout) {
    node.scrollTo(node.scrollLeft, position)
  } else {
    node.scrollTo(position, node.scrollTop)
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

export type ListLayout = 'vertical' | 'horizontal'

export type InitialListScroll =
  | number
  | { index: number; position?: ScrollPosition }

export interface UseWindowedListOptions {
  containerSize: number
  itemSize: number | ((index: number) => number)
  itemCount: number
  overscanCount?: number
  layout?: ListLayout
  initialScroll?: InitialListScroll
  scrollThrottling?: number
  onItemsRendered?(renderedRange: ListRenderedRange): void
}

export interface UseWindowedListResult<E extends HTMLElement>
  extends ListRenderedRange {
  startSpace: number
  endSpace: number
  indexes: ReadonlyArray<number>
  isScrolling: boolean
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
  scrollThrottling = DEFAULT_SCROLL_THROTTLE_MS,
  onItemsRendered
}: UseWindowedListOptions): UseWindowedListResult<E> => {
  // it wants to keep track when a container gets changed
  const isVerticalLayout = layout === 'vertical'
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
      scrollTo(
        container,
        isVerticalLayout,
        calcInitialScroll(initialScroll, viewport, containerSize)
      )
    }

    // it does not want to watch the values' changes on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, isVerticalLayout])

  // props.height and props.itemHeight monitor
  useEffect(() => {
    if (container != null) {
      const scrollPosition = isVerticalLayout
        ? container.scrollTop
        : container.scrollLeft

      setBoundaries(viewport.calcBoundaries(containerSize, scrollPosition))
    }
  }, [setBoundaries, container, isVerticalLayout, viewport, containerSize])

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
      (scrollPosition: number) => {
        setBoundaries(viewport.calcBoundaries(containerSize, scrollPosition))
      },
      scrollThrottling,
      // execute on END of interval so it always applies actual boundaries
      { leading: false, trailing: true }
    )

    // the ref keeps onScroll callback so it doesn't need to reattach
    // the listener to node each time the props changes
    onScrollRef.current = onScroll

    return onScroll.cancel
  }, [setBoundaries, viewport, containerSize, scrollThrottling])

  // container scroll monitor
  useEffect(() => {
    if (container == null) {
      return
    }

    return onPassiveScroll(container, () => {
      onScrollingRef.current()
      onScrollRef.current(
        isVerticalLayout ? container.scrollTop : container.scrollLeft
      )
    })
  }, [container, isVerticalLayout])

  return {
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
        scrollTo(container, isVerticalLayout, px)
      }
    }),

    scrollToItem: useRefCallback((index, position = 'auto') => {
      if (container != null) {
        scrollTo(
          container,
          isVerticalLayout,
          calcScrollPosition(
            position,
            viewport.getSpaceBefore(index),
            viewport.getItemSize(index),
            containerSize,
            isVerticalLayout ? container.scrollTop : container.scrollLeft
          )
        )
      }
    })
  }
}
