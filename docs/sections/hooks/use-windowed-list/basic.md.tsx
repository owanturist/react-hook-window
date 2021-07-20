import React from 'react'
import { useWindowedList } from 'react-hook-window'
import { Container, Item } from '~/components'
import { range } from '~/utils'

const CONTAINER_HEIGHT = 400
const ITEM_HEIGHT = 50
const items = React.useMemo(() => {
  return range(1000).map(i => ({
    id: `item-${i}`,
    title: `Item #${i}`
  }))
}, [])

const { setRef, indexes, startSpace, endSpace } = useWindowedList({
  containerSize: CONTAINER_HEIGHT,
  itemSize: ITEM_HEIGHT,
  itemCount: items.length
})

;<Container
  ref={setRef}
  style={{
    height: CONTAINER_HEIGHT,
    overflowY: 'auto'
  }}
>
  <div style={{ height: startSpace }} />

  {indexes.map(index => {
    const item = items[index]

    return (
      <Item key={item.id} style={{ height: ITEM_HEIGHT }}>
        {item.title}
      </Item>
    )
  })}

  <div style={{ height: endSpace }} />
</Container>
