import { useCallback } from 'react'

const calcUnloadedRanges = (
  isLoaded: (index: number) => boolean,
  overscanStart: number,
  overscanStop: number
): ReadonlyArray<[number, number]> => {
  const ranges = new Array<[number, number]>(0)

  for (let index = overscanStart; index < overscanStop; index++) {
    // skip loaded
    while (isLoaded(index)) {
      if (++index >= overscanStop) {
        return ranges
      }
    }

    const start = index

    // skip unloaded
    while (!isLoaded(index)) {
      if (++index >= overscanStop) {
        ranges.push([start, overscanStop])

        return ranges
      }
    }

    ranges.push([start, index])
  }

  return ranges
}

export interface InfiniteLoaderRenderedRange {
  overscanStart: number
  overscanStop: number
}

export interface UseInfiniteLoaderOptions {
  isItemLoaded(index: number): boolean
  loadMoreItems(startIndex: number, stopIndex: number): void
}

export interface UseInfiniteLoaderResult {
  onItemsRendered(renderedRange: InfiniteLoaderRenderedRange): void
}

export const useInfiniteLoader = ({
  isItemLoaded,
  loadMoreItems
}: UseInfiniteLoaderOptions): UseInfiniteLoaderResult => {
  const onItemsRendered = useCallback(
    ({ overscanStart, overscanStop }: InfiniteLoaderRenderedRange) => {
      const ranges = calcUnloadedRanges(
        isItemLoaded,
        overscanStart,
        overscanStop
      )

      for (const [start, stop] of ranges) {
        loadMoreItems(start, stop)
      }
    },
    [isItemLoaded, loadMoreItems]
  )

  return { onItemsRendered }
}
