import React from 'react'
import { UseWindowedListOptions } from '../src'
import { ScrollControl } from './ScrollControl'

export interface ControlPanelOptions extends UseWindowedListOptions {
  visible: boolean
}

const ItemSizePicker = React.memo<{
  itemSize: number | ((index: number) => number)
  setOptions: React.Dispatch<React.SetStateAction<ControlPanelOptions>>
}>(({ itemSize, setOptions }) => {
  if (typeof itemSize === 'number') {
    return (
      <input
        data-testid="item-size-input"
        type="number"
        value={itemSize}
        onChange={event =>
          setOptions(current => ({
            ...current,
            itemSize: Number(event.target.value)
          }))
        }
      />
    )
  }

  const onChange = (x: number): void => {
    setOptions(current => ({
      ...current,
      itemSize: (index: number) => x * itemSize(index)
    }))
  }

  return (
    <>
      <button
        data-testid="item-size-half"
        type="button"
        onClick={() => onChange(0.5)}
      >
        Half
      </button>

      <button
        data-testid="item-size-double"
        type="button"
        onClick={() => onChange(2)}
      >
        Double
      </button>
    </>
  )
})

export const ControlPanel = React.memo<{
  options: ControlPanelOptions
  setOptions: React.Dispatch<React.SetStateAction<ControlPanelOptions>>
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
      <ItemSizePicker itemSize={options.itemSize} setOptions={setOptions} />
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
      <ScrollControl
        scrollToPxName="initial-scroll-px-input"
        scrollToItemPositionName="initial-scroll-position-select"
        scrollToItemIndexName="initial-scroll-index-input"
        initialScroll={options.initialScroll}
        onChange={initialScroll =>
          setOptions(current => ({ ...current, initialScroll }))
        }
      />
    </div>
  </div>
))
