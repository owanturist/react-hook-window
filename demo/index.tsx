import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import debounce from 'lodash.debounce'
import {
  ListRenderedRange,
  ScrollPosition,
  useFixedSizeList,
  useInfiniteLoader
} from '../src'

interface Data {
  id: number
  title: string
}

const makeItems = (n: number): Array<Data> => {
  return Array.from({ length: n }).map((_, i) => ({
    id: i,
    title: `Hello world #${i}`
  }))
}

let n = 0

const positions: ReadonlyArray<ScrollPosition> = [
  'auto',
  'smart',
  'start',
  'center',
  'end'
]

const ListView = React.memo(
  React.forwardRef<
    HTMLDivElement,
    {
      items: ReadonlyArray<Data>
      height: number
      topOffset: number
      bottomOffset: number
      indexes: ReadonlyArray<number>
      itemHeight(index: number): number
    }
  >(({ items, height, itemHeight, topOffset, bottomOffset, indexes }, ref) => (
    <div ref={ref} style={{ height, overflow: 'auto' }}>
      <div style={{ paddingTop: topOffset, paddingBottom: bottomOffset }}>
        {indexes.map(index => {
          const item = items[index]

          return (
            <div
              key={item.id}
              style={{
                height: itemHeight(index),
                boxSizing: 'border-box',
                background: index % 2 === 0 ? '#ccc' : '#cec'
              }}
            >
              {item.title}
            </div>
          )
        })}
      </div>
    </div>
  ))
)

const Demo = React.memo(() => {
  const [height, setHeight] = React.useState(500)
  const [itemHeight, setItemHeight] = React.useState(40)
  const [itemCount, setItemCount] = React.useState(100)
  const [overscanCount, setOverscanCount] = React.useState(3)
  const [scrollToItemIndex, setScrollToItemIndex] = React.useState(30)
  const [ref, saveRef] = React.useState<(node: HTMLDivElement) => void>()

  const items = React.useMemo(() => makeItems(itemCount), [itemCount])
  const itemsSize = React.useMemo(() => {
    const sizes = Array.from({ length: itemCount }).map(
      () => itemHeight + Math.round(Math.random() * itemHeight)
    )

    return (index: number) => sizes[index]
  }, [itemCount, itemHeight])

  const onItemsRendered = React.useCallback((params: ListRenderedRange) => {
    // eslint-disable-next-line no-console
    console.log(params)
  }, [])

  const {
    setRef,
    topOffset,
    bottomOffset,
    indexes,
    scrollTo,
    scrollToItem,
    isScrolling
  } = useFixedSizeList<HTMLDivElement>({
    height,
    itemHeight: itemsSize,
    itemCount,
    overscanCount,
    initialScroll: 0,
    scrollThrottling: 20,
    onItemsRendered
  })

  React.useEffect(() => {
    console.log('CHANGE SCROLL TO')
  }, [scrollToItem])

  React.useEffect(() => {
    console.log('render %d', n++)
  })

  React.useEffect(() => {
    console.log(indexes)
  }, [indexes])

  React.useEffect(() => {
    setTimeout(() => {
      saveRef(() => setRef)
    }, 1000)
  }, [setRef])

  return (
    <div>
      Scrolling: {String(isScrolling)}
      <br />
      Height:
      <input
        type="number"
        value={height}
        onChange={event => setHeight(Number(event.target.value))}
      />
      <br />
      Item height
      <input
        type="number"
        value={itemHeight}
        onChange={event => setItemHeight(Number(event.target.value))}
      />
      <br />
      Item count
      <input
        type="number"
        value={itemCount}
        onChange={event => setItemCount(Number(event.target.value))}
      />
      <br />
      Overscan count
      <input
        type="number"
        value={overscanCount}
        onChange={event => setOverscanCount(Number(event.target.value))}
      />
      <br />
      Scroll to Item
      <input
        type="number"
        value={scrollToItemIndex}
        onChange={event => setScrollToItemIndex(Number(event.target.value))}
      />
      {positions.map(position => (
        <button
          key={position}
          type="button"
          onClick={() => scrollToItem(scrollToItemIndex, position)}
        >
          scroll {position}
        </button>
      ))}
      <ListView
        items={items}
        height={height}
        itemHeight={itemsSize}
        topOffset={topOffset}
        bottomOffset={bottomOffset}
        indexes={indexes}
        ref={ref}
      />
    </div>
  )
})

const App: React.FC = ({ children }) => {
  const [show, setShow] = React.useState(true)

  return (
    <>
      <input
        type="checkbox"
        checked={show}
        onChange={event => setShow(event.target.checked)}
      />

      {show && children}
    </>
  )
}

const loadData = (index: number): Promise<Data> => {
  return new Promise(done => {
    const delay = Math.round(Math.random() * 2000 + 500)
    setTimeout(() => {
      done({
        id: index,
        title: `Item #${index} loaded after ${delay}`
      })
    }, delay)
  })
}

const DemoInfiniteLoading = React.memo(() => {
  const [data, setData] = useState<Record<number, null | Data>>({})

  const isItemLoaded = useCallback((index: number) => index in data, [data])

  const loadMoreItems = useMemo(() => {
    return debounce((start: number, stop: number) => {
      const range = new Array<number>(0)

      for (let index = start; index < stop; index++) {
        range.push(index)
      }

      setData(current => {
        return range.reduce((acc, id) => ({ ...acc, [id]: null }), current)
      })

      Promise.all(range.map(loadData)).then(loadedItems => {
        setData(current => {
          console.log('loaded [%d, %d)', start, stop)

          return loadedItems.reduce(
            (acc, item) => ({ ...acc, [item.id]: item }),
            current
          )
        })
      })
    }, 150)
  }, [])

  useEffect(() => loadMoreItems.cancel, [loadMoreItems])

  const { onItemsRendered } = useInfiniteLoader({
    isItemLoaded,
    loadMoreItems
  })

  const height = 500
  const itemHeight = 50
  const {
    setRef,
    topOffset,
    bottomOffset,
    indexes
  } = useFixedSizeList<HTMLDivElement>({
    height,
    itemHeight,
    itemCount: 300,
    overscanCount: 4,
    onItemsRendered
  })

  return (
    <div ref={setRef} style={{ height, overflow: 'auto' }}>
      <div style={{ paddingTop: topOffset, paddingBottom: bottomOffset }}>
        {indexes.map(index => {
          const item = data[index]

          return (
            <div
              key={item?.id ?? index}
              style={{
                height: itemHeight,
                boxSizing: 'border-box',
                background: index % 2 === 0 ? '#ccc' : '#cec'
              }}
            >
              {item == null ? 'Loading' : item.title}
            </div>
          )
        })}
      </div>
    </div>
  )
})

ReactDOM.render(
  <React.StrictMode>
    <App>
      <Demo />
      {/* <DemoInfiniteLoading /> */}
    </App>
  </React.StrictMode>,
  document.getElementById('root')
)
