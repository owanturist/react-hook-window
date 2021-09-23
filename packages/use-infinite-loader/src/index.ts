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

export interface LoadRange {
  loadFromIndex: number
  loadBeforeIndex: number
  loadCount: number
}

export interface UseInfiniteLoaderOptions {
  isScrolling: boolean
  overscanFromIndex: number
  overscanBeforeIndex: number
  shouldLoadItem(index: number): boolean
  loadItemsRange(range: LoadRange): void
}

export const useInfiniteLoader = ({
  isScrolling,
  overscanFromIndex,
  overscanBeforeIndex,
  shouldLoadItem,
  loadItemsRange
}: UseInfiniteLoaderOptions): void => {
  useEffect(() => {
    if (isScrolling) {
      return
    }

    const ranges = calcUnloadedRanges(
      shouldLoadItem,
      overscanFromIndex,
      overscanBeforeIndex
    )

    for (const [loadFromIndex, loadBeforeIndex] of ranges) {
      loadItemsRange({
        loadFromIndex,
        loadBeforeIndex,
        loadCount: loadBeforeIndex - loadFromIndex
      })
    }
  }, [
    isScrolling,
    overscanFromIndex,
    overscanBeforeIndex,
    shouldLoadItem,
    loadItemsRange
  ])
}
