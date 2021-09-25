import { useEffect } from 'react'
import { calcUnloadedRanges } from './calc-unloaded-ranges'

export interface LoadingItemsRange {
  loadFromIndex: number
  loadBeforeIndex: number
  loadCount: number
}

export interface UseItemsLoaderOptions {
  isScrolling: boolean
  overscanFromIndex: number
  overscanBeforeIndex: number
  shouldLoadItem(index: number): boolean
  loadItemsRange(range: LoadingItemsRange): void
}

export const useItemsLoader = ({
  isScrolling,
  overscanFromIndex,
  overscanBeforeIndex,
  shouldLoadItem,
  loadItemsRange
}: UseItemsLoaderOptions): void => {
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
