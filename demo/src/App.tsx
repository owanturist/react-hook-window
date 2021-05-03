import React from 'react'
import './App.css'
import { useFixedSizeList } from 'react-hook-window'

const items = Array.from({ length: 100 }).map((_, i) => ({
  id: i,
  title: `Hello world #${i}`
}))

const App = React.memo(() => {
  const {
    ref,
    startOffset,
    endOffset,
    indexes
  } = useFixedSizeList<HTMLDivElement>({
    itemHeight: 40,
    itemCount: items.length
  })

  return (
    <div ref={ref} style={{ height: 500, overflow: 'auto' }}>
      <div style={{ height: startOffset }} />
      {indexes.map(index => {
        const item = items[index]

        return (
          <div
            key={item.id}
            style={{
              height: '40px',
              boxSizing: 'border-box',
              background: index % 2 === 0 ? '#ccc' : '#cec'
            }}
          >
            {item.title}
          </div>
        )
      })}
      <div style={{ height: endOffset }} />
    </div>
  )
})

export default App
