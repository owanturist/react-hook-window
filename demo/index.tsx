import React from 'react'
import ReactDOM from 'react-dom'
import {
  UseWindowedListOptions,
  InitialListScroll,
  ScrollPosition,
  useWindowedList
} from '../src'

const SCROLL_POSITIONS: ReadonlyArray<ScrollPosition> = [
  'auto',
  'start',
  'center',
  'end',
  'smart'
]

const InitialScrollControl: React.VFC<{
  initialScroll?: InitialListScroll
  onChange(initialScroll: InitialListScroll): void
}> = ({ initialScroll = 0, onChange }) => {
  const [px, index, position] =
    typeof initialScroll === 'number'
      ? [initialScroll, 0, SCROLL_POSITIONS[0]]
      : [0, initialScroll.index, initialScroll.position ?? SCROLL_POSITIONS[0]]

  return (
    <div>
      <div>
        <input
          type="checkbox"
          checked={typeof initialScroll === 'number'}
          disabled
        />
        {' by px '}
        <input
          data-testid="initial-scroll-px-input"
          type="number"
          value={px}
          onChange={event => onChange(Number(event.target.value))}
        />
      </div>

      <div>
        <input
          type="checkbox"
          checked={typeof initialScroll === 'object'}
          disabled
        />

        {' by item index '}
        <select
          data-testid="initial-scroll-position-select"
          value={position}
          onChange={event => {
            onChange({
              index,
              position: event.target.value as ScrollPosition
            })
          }}
        >
          {SCROLL_POSITIONS.map(pos => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        <input
          data-testid="initial-scroll-index-input"
          type="number"
          value={index}
          onChange={event => {
            onChange({
              index: Number(event.target.value),
              position
            })
          }}
        />
      </div>
    </div>
  )
}

interface FixedSizeOptions extends UseWindowedListOptions {
  itemSize: number
  visible: boolean
}

const ControlPanel = React.memo<{
  options: FixedSizeOptions
  setOptions: React.Dispatch<React.SetStateAction<FixedSizeOptions>>
}>(({ options, setOptions }) => (
  <div>
    <div>
      Visible{' '}
      <input
        data-testid="visibility-checkbox"
        type="checkbox"
        checked={options.visible}
        onChange={event =>
          setOptions(current => ({
            ...current,
            visible: event.target.checked
          }))
        }
      />
    </div>

    <div>
      Container size{' '}
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
      Item size{' '}
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
      Item count{' '}
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

    <div>
      Overscan count{' '}
      <input
        data-testid="overscan-count-input"
        type="number"
        value={options.overscanCount}
        onChange={event =>
          setOptions(current => ({
            ...current,
            overscanCount: Number(event.target.value)
          }))
        }
      />
    </div>

    <div>
      Initial scroll
      <InitialScrollControl
        initialScroll={options.initialScroll}
        onChange={initialScroll =>
          setOptions(current => ({ ...current, initialScroll }))
        }
      />
    </div>
  </div>
))

const FixedSizeList = React.memo<{
  options: FixedSizeOptions
}>(({ options }) => {
  const { setRef, isScrolling, startSpace, endSpace, indexes } =
    useWindowedList(options)

  return (
    <>
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
    </>
  )
})

const FixedSizeListDemo = React.memo(() => {
  const [options, setOptions] = React.useState<FixedSizeOptions>({
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
