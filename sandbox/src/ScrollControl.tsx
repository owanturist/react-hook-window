import * as React from 'react'
import {
  InitialListScroll,
  ScrollPosition
} from '@react-hook-window/use-windowed-list'

const SCROLL_POSITIONS: ReadonlyArray<ScrollPosition> = [
  'auto',
  'start',
  'center',
  'end',
  'smart'
]

export const ScrollControl: React.VFC<{
  scrollToPxName: string
  scrollToItemPositionName: string
  scrollToItemIndexName: string
  initialScroll?: InitialListScroll
  onChange(initialScroll: InitialListScroll): void
}> = ({
  scrollToPxName,
  scrollToItemPositionName,
  scrollToItemIndexName,
  initialScroll = 0,
  onChange
}) => {
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
          data-testid={scrollToPxName}
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
          data-testid={scrollToItemPositionName}
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
          data-testid={scrollToItemIndexName}
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

export const DynamicScrollControl: React.VFC<{
  scrollTo(px: number): void
  scrollToItem(index: number, position?: ScrollPosition): void
}> = ({ scrollTo, scrollToItem }) => {
  const [scroll, setScroll] = React.useState<InitialListScroll>(0)

  return (
    <ScrollControl
      scrollToPxName="dynamic-scroll-px-input"
      scrollToItemPositionName="dynamic-scroll-position-select"
      scrollToItemIndexName="dynamic-scroll-index-input"
      initialScroll={scroll}
      onChange={nextScroll => {
        if (typeof nextScroll === 'number') {
          scrollTo(nextScroll)
        } else {
          scrollToItem(nextScroll.index, nextScroll.position)
        }

        setScroll(nextScroll)
      }}
    />
  )
}
