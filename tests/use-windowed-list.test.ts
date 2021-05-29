import { RenderHookResult, act, renderHook } from '@testing-library/react-hooks'

import {
  UseWindowedListOptions,
  UseWindowedListResult,
  useWindowedList
} from '../src/use-windowed-list'

const renderUseWindowedList = (
  initialOptions: UseWindowedListOptions
): RenderHookResult<
  UseWindowedListOptions,
  UseWindowedListResult<HTMLElement>
> => {
  return renderHook(options => useWindowedList(options), {
    initialProps: initialOptions
  })
}

test('useWindowedList', () => {
  const onItemsRendered = jest.fn()

  const { result } = renderUseWindowedList({
    containerSize: 200,
    itemSize: 50,
    itemCount: 10,
    onItemsRendered
  })

  expect(onItemsRendered).not.toHaveBeenCalled()
  expect(result.current.indexes).toEqual([0, 1, 2, 3, 4])
  expect(result.current.startOffset).toBe(0)
  expect(result.current.endOffset).toBe(250) // 50px * (10 - 4 visible - 1 overscan)

  const node = document.createElement('div')

  act(() => {
    result.current.setRef(node)
  })

  expect(onItemsRendered).toHaveBeenCalledTimes(1)
})
