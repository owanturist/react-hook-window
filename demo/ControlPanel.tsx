import React from 'react'
import { UseWindowedListOptions } from '../src'
import { ScrollControl } from './ScrollControl'

export interface ControlPanelOptions extends UseWindowedListOptions {
  itemSize: number
  visible: boolean
}

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
