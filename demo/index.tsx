import React from 'react'
import ReactDOM from 'react-dom'
import { useWindowedList } from '../src'
import { DynamicScrollControl } from './ScrollControl'
import { ControlPanelOptions, ControlPanel } from './ControlPanel'

const FixedSizeList = React.memo<{
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

  return (
    <>
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
                height: options.itemSize,
                background: index % 2 === 0 ? '#eee' : '#ddd'
              }}
            >
              Item #{index}
            </div>
          ))}
        </div>
      </div>
    </>
  )
})

const FixedSizeListDemo = React.memo(() => {
  const [options, setOptions] = React.useState<ControlPanelOptions>({
    containerSize: 510,
    itemSize: 50,
    itemCount: 20,
    visible: true
  })

  return (
    <div>
      <ControlPanel options={options} setOptions={setOptions} />

      {options.visible && <FixedSizeList options={options} />}
    </div>
  )
})

ReactDOM.render(
  <React.StrictMode>
    <FixedSizeListDemo />
  </React.StrictMode>,
  document.getElementById('root')
)
