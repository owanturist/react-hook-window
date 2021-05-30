import React from 'react'
import ReactDOM from 'react-dom'
import { UseWindowedListOptions, useWindowedList } from '../src'

interface FixedSizeOptions extends UseWindowedListOptions {
  itemSize: number
}

const ControlPanel = React.memo<{
  options: FixedSizeOptions
  setOptions: React.Dispatch<React.SetStateAction<FixedSizeOptions>>
}>(({ options, setOptions }) => (
  <div>
    <div>
      <input
        data-testid="container-size-input"
        type="number"
        value={options.containerSize}
        onChange={event =>
          setOptions(current => ({
            ...current,
            containerSize: Number(event.target.value)
          }))
        }
      />
    </div>

    <div>
      <input
        data-testid="item-size-input"
        type="number"
        value={options.itemSize}
        onChange={event =>
          setOptions(current => ({
            ...current,
            itemSize: Number(event.target.value)
          }))
        }
      />
    </div>

    <div>
      <input
        data-testid="item-count-input"
        type="number"
        value={options.itemCount}
        onChange={event =>
          setOptions(current => ({
            ...current,
            itemCount: Number(event.target.value)
          }))
        }
      />
    </div>
  </div>
))

const FixedSizeListDemo = React.memo(() => {
  const [options, setOptions] = React.useState<FixedSizeOptions>({
    containerSize: 510,
    itemSize: 50,
    itemCount: 20
  })
  const { setRef, isScrolling, startSpace, endSpace, indexes } =
    useWindowedList(options)

  return (
    <div>
      <ControlPanel options={options} setOptions={setOptions} />

      <div>
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
    </div>
  )
})

ReactDOM.render(
  <React.StrictMode>
    <FixedSizeListDemo />
  </React.StrictMode>,
  document.getElementById('root')
)
