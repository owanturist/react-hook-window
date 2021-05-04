import {
  RefObject,
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react'

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
}

export interface UseFixedSizeListResult<E extends HTMLElement> {
  ref: RefObject<E>
  startOffset: number
  endOffset: number
  indexes: Array<number>
  scrollToItem(index: number): void
}

export const useFixedSizeList = <E extends HTMLElement>({
  itemHeight,
  itemCount
}: UseFixedSizeListOptions): UseFixedSizeListResult<E> => {
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

    let scrollTop = 0

    setBoundaries(Boundaries.calc(itemHeight, node))

    const onScroll = (): void => {
      const prevStart = Boundaries.calcStart(itemHeight, scrollTop)
      const nextBoundaries = Boundaries.calc(itemHeight, node)

      if (prevStart !== nextBoundaries.start) {
        setBoundaries(nextBoundaries)
      }

      scrollTop = node.scrollTop
    }

    node.addEventListener('scroll', onScroll)

    if (node.scrollTop > node.scrollHeight) {
      node.scrollTo(node.scrollLeft, node.scrollHeight)
    }

    const observer = new ResizeObserver(() => {
      setBoundaries(Boundaries.calc(itemHeight, node))
    })

    observer.observe(node)

    return () => {
      node.removeEventListener('scroll', onScroll)
      observer.unobserve(node)
      observer.disconnect()
    }
  }, [itemHeight])

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
    }
  }, [start, itemCount, itemHeight])

  return useMemo(
    () => ({
      ref: containerRef,
      startOffset: start * itemHeight,
      endOffset: (itemCount - end) * itemHeight,
      indexes: Array.from({ length: end - start }).map((_, i) => i + start),
      scrollToItem
    }),
    [start, end, itemHeight, itemCount, scrollToItem]
  )
}
