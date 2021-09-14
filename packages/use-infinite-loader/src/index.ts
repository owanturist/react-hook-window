import { useEffect } from 'react'

const calcUnloadedRanges = (
  isLoaded: (index: number) => boolean,
  overscanFromIndex: number,
  overscanBeforeIndex: number
): ReadonlyArray<[number, number]> => {
  const ranges = new Array<[number, number]>(0)

  for (let index = overscanFromIndex; index < overscanBeforeIndex; index++) {
    // skip loaded
    while (isLoaded(index)) {
      if (++index >= overscanBeforeIndex) {
        return ranges
      }
    }

    const start = index

    // skip unloaded
    while (!isLoaded(index)) {
      if (++index >= overscanBeforeIndex) {
        ranges.push([start, overscanBeforeIndex])

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
  overscanFromIndex: number
  overscanBeforeIndex: number
  isItemLoaded(index: number): boolean
  loadMoreItems(options: LoadMoreItemsOptions): void
}

export const useInfiniteLoader = ({
  isScrolling,
  overscanFromIndex,
  overscanBeforeIndex,
  isItemLoaded,
  loadMoreItems
}: UseInfiniteLoaderOptions): void => {
  useEffect(() => {
    if (isScrolling) {
      return
    }

    const ranges = calcUnloadedRanges(
      isItemLoaded,
      overscanFromIndex,
      overscanBeforeIndex
    )

    for (const [startIndex, stopIndex] of ranges) {
      loadMoreItems({
        startIndex,
        stopIndex,
        count: stopIndex - startIndex
      })
    }
  }, [
    isScrolling,
    overscanFromIndex,
    overscanBeforeIndex,
    isItemLoaded,
    loadMoreItems
  ])
}
