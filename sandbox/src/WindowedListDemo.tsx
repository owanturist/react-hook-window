import * as React from 'react'
import { ListLayout, useWindowedList } from 'react-hook-window'
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
  const isVertical = options.layout === 'vertical'
  const isRTL = options.layout === 'horizontal-rtl'

  const makeStyles = (px: number): React.CSSProperties => {
    return isVertical ? { height: px } : { flex: `0 0 ${px}px` }
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
          display: isVertical ? 'block' : 'flex',
          flexDirection: isVertical ? 'unset' : 'row',
          direction: isRTL ? 'rtl' : 'inherit',
          overflow: 'auto',
          boxShadow: '0 0 0 2px #888',
          width: isVertical ? 400 : options.containerSize,
          height: isVertical ? options.containerSize : 400
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

      {options.visible && <WindowedList options={options} />}
    </div>
  )
})
