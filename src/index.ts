import { RefObject, useRef, useState, useEffect, useMemo } from 'react'

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
}

export const useFixedSizeList = <E extends HTMLElement>({
  itemHeight,
  itemCount
}: UseFixedSizeListOptions): UseFixedSizeListResult<E> => {
  const [boundaries, setBoundaries] = useState(Boundaries.initial)

  const scrollTopRef = useRef(0)
  const containerRef = useRef<E>(null)

  useEffect(() => {
    const node = containerRef.current

    if (node != null) {
      setBoundaries(Boundaries.calc(itemHeight, node))
    }
  }, [itemHeight])

  useEffect(() => {
    const node = containerRef.current

    if (node == null) {
      return
    }

    const onScroll = (): void => {
      const prevStart = Boundaries.calcStart(itemHeight, scrollTopRef.current)
      const nextBoundaries = Boundaries.calc(itemHeight, node)

      if (prevStart !== nextBoundaries.start) {
        setBoundaries(nextBoundaries)
      }

      scrollTopRef.current = node.scrollTop
    }

    node.addEventListener('scroll', onScroll)

    return () => {
      node.removeEventListener('scroll', onScroll)
    }
  }, [itemHeight])

  return useMemo(() => {
    const { start, end } = Boundaries.limit(itemCount, boundaries)

    return {
      ref: containerRef,
      startOffset: start * itemHeight,
      endOffset: (itemCount - end) * itemHeight,
      indexes: Array.from({ length: end - start }).map((_, i) => i + start)
    }
  }, [itemCount, itemHeight, boundaries])
}
