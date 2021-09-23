import * as React from 'react'
import { useWindowedList } from '@react-hook-window/use-windowed-list'
import { useInfiniteLoader } from '@react-hook-window/use-infinite-loader'

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

const ItemsList = React.forwardRef<
  HTMLDivElement,
  {
    containerSize: number
    itemSize: number
    startSpace: number
    endSpace: number
    indexes: ReadonlyArray<number>
    getItemData(index: number): null | string
  }
>(
  (
    { containerSize, itemSize, startSpace, endSpace, indexes, getItemData },
    setRef
  ) => (
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
        const item = getItemData(index)

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
)

const InfiniteRangeLoaderDemo = React.memo(() => {
  const containerSize = 500
  const itemSize = 50
  const [items, setItems] = React.useState<Partial<Record<number, string>>>({})
  const [loading, setLoading] = React.useState<Record<number, boolean>>({})
  const shouldLoadItem = React.useCallback(
    index => !(index in loading),
    [loading]
  )

  const {
    setRef,
    startSpace,
    endSpace,
    indexes,
    isScrolling,
    overscanFromIndex,
    overscanBeforeIndex
  } = useWindowedList({
    containerSize,
    itemSize,
    itemCount: 1000
  })

  useInfiniteLoader({
    isScrolling,
    overscanFromIndex,
    overscanBeforeIndex,
    shouldLoadItem,
    loadItemsRange: React.useCallback(({ loadFromIndex, loadCount }) => {
      const accLoading: Record<number, boolean> = {}

      for (let index = 0; index < loadCount; index++) {
        accLoading[loadFromIndex + index] = true
      }

      setLoading(current => ({ ...current, ...accLoading }))

      loadRange(loadFromIndex, loadCount, 200).then(data => {
        const accItems: Record<number, string> = {}

        for (let index = 0; index < data.length; index++) {
          accItems[loadFromIndex + index] = data[index]
        }

        setItems(current => ({ ...current, ...accItems }))
      })
    }, [])
  })

  return (
    <ItemsList
      ref={setRef}
      containerSize={containerSize}
      itemSize={itemSize}
      indexes={indexes}
      startSpace={startSpace}
      endSpace={endSpace}
      getItemData={index => items[index] ?? null}
    />
  )
})

const InfinitePagedLoaderDemo = React.memo(() => {
  const containerSize = 500
  const itemSize = 30
  const pageSize = 10
  const [items, setItems] = React.useState<ReadonlyArray<string>>([])
  const shouldLoadItem = React.useCallback(
    (index: number) => index >= items.length,
    [items]
  )

  const {
    setRef,
    startSpace,
    endSpace,
    indexes,
    isScrolling,
    overscanFromIndex,
    overscanBeforeIndex
  } = useWindowedList({
    containerSize,
    itemSize,
    itemCount: 1000
  })

  useInfiniteLoader({
    isScrolling,
    overscanFromIndex,
    overscanBeforeIndex,
    shouldLoadItem,
    loadItemsRange: React.useCallback(() => {
      loadRange(items.length, pageSize, 200).then(data => {
        setItems(current => [...current, ...data])
      })
    }, [items.length])
  })

  return (
    <ItemsList
      ref={setRef}
      containerSize={containerSize}
      itemSize={itemSize}
      indexes={indexes}
      startSpace={startSpace}
      endSpace={endSpace}
      getItemData={index => (index < items.length ? items[index] : null)}
    />
  )
})

const UndefinitePagedLoaderDemo = React.memo(() => {
  const containerSize = 500
  const itemSize = 30
  const pageSize = 10
  const [items, setItems] = React.useState<ReadonlyArray<string>>([])
  const shouldLoadItem = React.useCallback(
    (index: number) => index >= items.length,
    [items]
  )

  const {
    setRef,
    startSpace,
    endSpace,
    indexes,
    isScrolling,
    overscanFromIndex,
    overscanBeforeIndex
  } = useWindowedList({
    containerSize,
    itemSize,
    itemCount: items.length + 1
  })

  useInfiniteLoader({
    isScrolling,
    overscanFromIndex,
    overscanBeforeIndex,
    shouldLoadItem,
    loadItemsRange: React.useCallback(() => {
      loadRange(items.length, pageSize, 200).then(data => {
        setItems(current => [...current, ...data])
      })
    }, [items.length])
  })

  return (
    <ItemsList
      ref={setRef}
      containerSize={containerSize}
      itemSize={itemSize}
      indexes={indexes}
      startSpace={startSpace}
      endSpace={endSpace}
      getItemData={index => (index < items.length ? items[index] : null)}
    />
  )
})

export const InfiniteLoaderDemo: React.VFC = () => (
  <div style={{ display: 'flex' }}>
    <InfiniteRangeLoaderDemo />

    <div style={{ width: 30 }} />

    <InfinitePagedLoaderDemo />

    <div style={{ width: 30 }} />

    <UndefinitePagedLoaderDemo />
  </div>
)
