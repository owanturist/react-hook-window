import React from 'react'
import ReactDOM from 'react-dom'
import { useWindowedList } from '../src'

const FixedSizeListDemo = React.memo<{
  containerSize: number
  itemSize: number
  itemCount: number
}>(({ containerSize, itemSize, itemCount }) => {
  const { setRef, startSpace, endSpace, indexes } = useWindowedList({
    containerSize,
    itemSize,
    itemCount
  })

  return (
    <div
      data-testid="container"
      ref={setRef}
      style={{
        boxSizing: 'border-box',
        overflow: 'auto',
        height: containerSize,
        paddingTop: startSpace,
        paddingBottom: endSpace
      }}
    >
      {indexes.map(index => (
        <div
          data-testid="item"
          key={index}
          style={{
            height: itemSize,
            background: index % 2 === 0 ? '#eee' : '#ddd'
          }}
        >
          Item #{index}
        </div>
      ))}
    </div>
  )
})

ReactDOM.render(
  <React.StrictMode>
    <FixedSizeListDemo containerSize={510} itemSize={50} itemCount={20} />
  </React.StrictMode>,
  document.getElementById('root')
)
