import { useEffect } from 'react'
import { calcUnloadedRanges } from './calc-unloaded-ranges'

export interface LoadingItemsRange {
  loadFromIndex: number
  loadBeforeIndex: number
  loadCount: number
}

export interface UseItemsLoaderOptions {
  skip?: boolean
  overscanFromIndex: number
  overscanBeforeIndex: number
  shouldLoadItem(index: number): boolean
  loadItemsRange(range: LoadingItemsRange): void
}

export const useItemsLoader = ({
  skip = false,
  overscanFromIndex,
  overscanBeforeIndex,
  shouldLoadItem,
  loadItemsRange
}: UseItemsLoaderOptions): void => {
  useEffect(() => {
    if (skip) {
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
    skip,
    overscanFromIndex,
    overscanBeforeIndex,
    shouldLoadItem,
    loadItemsRange
  ])
}
