import { useEffect } from 'react'

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

// @TODO rename with ListRenderedRange renaming
export interface LoadMoreItemsOptions {
  startIndex: number
  stopIndex: number
  count: number
}

export interface UseInfiniteLoaderOptions {
  isScrolling: boolean
  overscanStart: number
  overscanStop: number
  isItemLoaded(index: number): boolean
  loadMoreItems(options: LoadMoreItemsOptions): void
}

export const useInfiniteLoader = ({
  isScrolling,
  overscanStart,
  overscanStop,
  isItemLoaded,
  loadMoreItems
}: UseInfiniteLoaderOptions): void => {
  useEffect(() => {
    if (isScrolling) {
      return
    }

    const ranges = calcUnloadedRanges(isItemLoaded, overscanStart, overscanStop)

    for (const [startIndex, stopIndex] of ranges) {
      loadMoreItems({
        startIndex,
        stopIndex,
        count: stopIndex - startIndex
      })
    }
  }, [isScrolling, overscanStart, overscanStop, isItemLoaded, loadMoreItems])
}
