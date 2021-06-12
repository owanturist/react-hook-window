import React from 'react'
import { ListLayout, useWindowedList } from '../src'
import { DynamicScrollControl } from './ScrollControl'
import { ControlPanelOptions, ControlPanel } from './ControlPanel'

const WindowedList = React.memo<{
  isVerticalLayout: boolean
  options: ControlPanelOptions
}>(({ isVerticalLayout, options }) => {
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
  const makeStyles = (px: number): React.CSSProperties => {
    return isVerticalLayout ? { height: px } : { flex: `0 0 ${px}px` }
  }

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
          display: isVerticalLayout ? 'block' : 'flex',
          flexDirection: isVerticalLayout ? 'unset' : 'row',
          overflow: 'auto',
          boxShadow: '0 0 0 2px #888',
          width: isVerticalLayout ? 400 : options.containerSize,
          height: isVerticalLayout ? options.containerSize : 400
        }}
      >
        <div style={makeStyles(startSpace)} />
        {indexes.map(index => (
          <div
            data-testid="item"
            key={index}
            style={{
              ...makeStyles(getItemSize(index)),
              background: index % 2 === 0 ? '#eee' : '#ddd'
            }}
          >
            #{index}
          </div>
        ))}
        <div style={makeStyles(endSpace)} />
      </div>
    </div>
  )
})

export const WindowedListDemo = React.memo<{
  layout?: ListLayout
  itemSize: number | ((index: number) => number)
}>(({ layout = 'vertical', itemSize }) => {
  const [options, setOptions] = React.useState<ControlPanelOptions>({
    containerSize: 510,
    itemSize,
    itemCount: 20,
    layout,
    visible: true
  })

  return (
    <div style={{ display: 'flex' }}>
      <ControlPanel options={options} setOptions={setOptions} />

      {options.visible && (
        <WindowedList
          isVerticalLayout={layout === 'vertical'}
          options={options}
        />
      )}
    </div>
  )
})
