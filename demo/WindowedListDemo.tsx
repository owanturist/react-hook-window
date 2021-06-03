import React from 'react'
import { useWindowedList } from '../src'
import { DynamicScrollControl } from './ScrollControl'
import { ControlPanelOptions, ControlPanel } from './ControlPanel'

const WindowedList = React.memo<{
  options: ControlPanelOptions
}>(({ options }) => {
  const {
    setRef,
    startSpace,
    endSpace,
    indexes,
    isScrolling,
    scrollTo,
    scrollToItem
  } = useWindowedList(options)
  const { itemSize } = options
  const getItemSize = typeof itemSize === 'function' ? itemSize : () => itemSize

  return (
    <div>
      <div>
        Dynamic scroll
        <DynamicScrollControl scrollTo={scrollTo} scrollToItem={scrollToItem} />
        <input
          data-testid="scrolling"
          type="checkbox"
          checked={isScrolling}
          readOnly
          disabled
        />
        Scrolling
      </div>

      <div
        data-testid="container"
        ref={setRef}
        style={{
          overflow: 'auto',
          boxShadow: '0 0 0 2px #888',
          height: options.containerSize
        }}
      >
        <div
          style={{
            paddingTop: startSpace,
            paddingBottom: endSpace
          }}
        >
          {indexes.map(index => (
            <div
              data-testid="item"
              key={index}
              style={{
                height: getItemSize(index),
                background: index % 2 === 0 ? '#eee' : '#ddd'
              }}
            >
              Item #{index}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export const WindowedListDemo = React.memo<{
  itemSize: number | ((index: number) => number)
}>(({ itemSize }) => {
  const [options, setOptions] = React.useState<ControlPanelOptions>({
    containerSize: 510,
    itemSize,
    itemCount: 20,
    visible: true
  })

  return (
    <div style={{ display: 'flex' }}>
      <ControlPanel options={options} setOptions={setOptions} />

      {options.visible && <WindowedList options={options} />}
    </div>
  )
})
