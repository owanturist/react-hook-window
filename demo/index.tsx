import React from 'react'
import ReactDOM from 'react-dom'
import { ScrollPosition, ListViewport, useFixedSizeList } from '../src'

const makeItems = (n: number): Array<{ id: number; title: string }> => {
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

const Demo = React.memo(() => {
  const [height, setHeight] = React.useState(500)
  const [itemHeight, setItemHeight] = React.useState(40)
  const [itemCount, setItemCount] = React.useState(100)
  const [overscanCount, setOverscanCount] = React.useState(3)
  const [scrollToItemIndex, setScrollToItemIndex] = React.useState(30)
  const [scrollTo, setScrollTo] = React.useState(0)

  const items = React.useMemo(() => makeItems(itemCount), [itemCount])
  const onItemsRendered = React.useCallback((params: ListViewport) => {
    // eslint-disable-next-line no-console
    console.log(params)
  }, [])

  const {
    ref,
    topOffset,
    bottomOffset,
    indexes,
    scrollToItem,
    isScrolling
  } = useFixedSizeList<HTMLDivElement>({
    height,
    itemHeight,
    itemCount,
    overscanCount,
    scrollTo,
    scrollThrottling: 20,
    onItemsRendered
  })

  React.useEffect(() => {
    console.log('render %d', n++)
  })

  React.useEffect(() => {
    console.log(indexes)
  }, [indexes])

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
      {positions.map(position => (
        <button
          key={position}
          type="button"
          onClick={() => scrollToItem(scrollToItemIndex, position)}
        >
          scroll {position}
        </button>
      ))}
      <div ref={ref} style={{ height, overflow: 'auto' }}>
        <div style={{ paddingTop: topOffset, paddingBottom: bottomOffset }}>
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
        </div>
      </div>
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

ReactDOM.render(
  <React.StrictMode>
    <App>
      <Demo />
    </App>
  </React.StrictMode>,
  document.getElementById('root')
)
