import React from 'react'
import './App.css'
import { useFixedSizeList } from 'react-hook-window'

const makeItems = (n: number): Array<{ id: number; title: string }> =>
  Array.from({ length: n }).map((_, i) => ({
    id: i,
    title: `Hello world #${i}`
  }))

const App = React.memo(() => {
  const [height, setHeight] = React.useState(500)
  const [itemHeight, setItemHeight] = React.useState(40)
  const [itemCount, setItemCount] = React.useState(1000)
  const [scrollToItemIndex, setScrollToItemIndex] = React.useState(30)
  const [scrollTo, setScrollTo] = React.useState(100)

  const items = React.useMemo(() => makeItems(itemCount), [itemCount])

  const {
    ref,
    topOffset,
    bottomOffset,
    indexes,
    scrollToItem,
    isScrolling
  } = useFixedSizeList<HTMLDivElement>({
    itemHeight,
    itemCount,
    scrollTo,
    scrollThrottling: 100
  })

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
      Scroll to px
      <input
        type="number"
        value={scrollTo}
        onChange={event => setScrollTo(Number(event.target.value))}
      />
      <br />
      Scroll to Item
      <input
        type="number"
        value={scrollToItemIndex}
        onChange={event => setScrollToItemIndex(Number(event.target.value))}
      />
      <button type="button" onClick={() => scrollToItem(scrollToItemIndex)}>
        scroll
      </button>
      <div ref={ref} style={{ height, overflow: 'auto' }}>
        <div style={{ height: topOffset }} />
        {indexes.map(index => {
          const item = items[index]

          return (
            <div
              key={item.id}
              style={{
                height: itemHeight,
                boxSizing: 'border-box',
                background: index % 2 === 0 ? '#ccc' : '#cec'
              }}
            >
              {item.title}
            </div>
          )
        })}
        <div style={{ height: bottomOffset }} />
      </div>
    </div>
  )
})

export default App
