import React from 'react'
import { useWindowedList, useInfiniteLoader } from '../src'

const loadRange = (
  start: number,
  count: number,
  delay: number
): Promise<ReadonlyArray<string>> => {
  return new Promise(done => {
    setTimeout(() => {
      const items = Array.from({ length: count }).map((_, i) => `#${start + i}`)

      done(items)
    }, delay)
  })
}

export const InfiniteLoaderDemo = React.memo(() => {
  const containerSize = 500
  const itemSize = 50
  const [items, setItems] = React.useState<Partial<Record<number, string>>>({})
  const [loading, setLoading] = React.useState<Record<number, boolean>>({})
  const isItemLoaded = React.useCallback(index => index in loading, [loading])

  const {
    setRef,
    startSpace,
    endSpace,
    indexes,
    isScrolling,
    overscanStart,
    overscanStop
  } = useWindowedList({
    containerSize,
    itemSize,
    itemCount: 1000
  })

  useInfiniteLoader({
    isScrolling,
    overscanStart,
    overscanStop,
    isItemLoaded,
    loadMoreItems: React.useCallback(({ startIndex, count }) => {
      const accLoading: Record<number, boolean> = {}

      for (let index = 0; index < count; index++) {
        accLoading[startIndex + index] = true
      }

      setLoading(current => ({ ...current, ...accLoading }))

      loadRange(startIndex, count, 200).then(data => {
        const accItems: Record<number, string> = {}

        for (let index = 0; index < data.length; index++) {
          accItems[startIndex + index] = data[index]
        }

        setItems(current => ({ ...current, ...accItems }))
      })
    }, [])
  })

  return (
    <div
      data-testid="container"
      ref={setRef}
      style={{
        overflow: 'auto',
        boxShadow: '0 0 0 2px #888',
        width: 400,
        height: containerSize
      }}
    >
      <div style={{ height: startSpace }} />
      {indexes.map(index => {
        const item = items[index]

        return (
          <div
            data-testid="item"
            key={index}
            style={{
              height: itemSize,
              background: index % 2 === 0 ? '#eee' : '#ddd'
            }}
          >
            {item ?? 'Loading'}
          </div>
        )
      })}
      <div style={{ height: endSpace }} />
    </div>
  )
})
