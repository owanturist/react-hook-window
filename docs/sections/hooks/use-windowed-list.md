```ts static
<E extends HTMLElement>(options: UseWindowedListOptions) => UseWindowedListResult<E>
```

The custom `useWindowedList` hook calculates a visible range of items in a given viewport. By rendering only part of large data sets, it might 1) speed up the initial render and 2) reduce memory allocation of not visible DOM nodes.

The hook creates zero additional DOM nodes, meaning that it provides unlimited customization freedom for both style preferenes and tags structure.

## Motivation

## How does it work?

Under the hood the hook calculates range of visible items based on 3 variables:

1. scroll position
2. container size
3. items size

```txt statis
      ----- +---------------------+           +---------------------+           +---------------------+
      ▲     | #0                  |           | start space =       |           | start space =       |
      |     |                     |           | #0.size +           |           | #0.size +           |
      |     |                     |           | #1.size             |           | #1.size +           |
      |     +---------------------+           |                     |           | #2.size             |
  1 - |     | #1                  |           |                     |           |                     |
      |     |                     |           |                     |           |                     |
      |     |                     |           |                     |           |                     |
      |     +---------------------+           +---------------------+           |                     |
      ▼     | #2                  |           | #2                  |           |                     |
      --- *=========================*       *=========================*         |                     |
      ▲   ‖ |                     | ‖       ‖ |                     | ‖         |                     |
      |   ‖ +---------------------+ ‖       ‖ +---------------------+ ‖         +---------------------+
      |   ‖ | #3                  | ‖       ‖ | #3                  | ‖         | #3                  |
      |   ‖ |                     | ‖       ‖ |                     | ‖       *=========================*
      |   ‖ |                     | ‖       ‖ |                     | ‖       ‖ |                     | ‖
  2 - |   ‖ +---------------------+ ‖  ==>  ‖ +---------------------+ ‖  ==>  ‖ +---------------------+ ‖
      |   ‖ | #4                  | ‖       ‖ | #4                  | ‖       ‖ | #4                  | ‖
      |   ‖ |                     | ‖       ‖ |                     | ‖       ‖ |                     | ‖
      |   ‖ |                     | ‖       ‖ |                     | ‖       ‖ |                     | ‖
      |   ‖ +---------------------+ ‖       ‖ +---------------------+ ‖       ‖ +---------------------+ ‖
      ▼   ‖ | #5                  | ‖       ‖ | #5                  | ‖       ‖ | #5                  | ‖
      --- *=========================*       *=========================*       ‖ |                     | ‖
            |                     |           |                     |         ‖ |                     | ‖
      ----- +---------------------+           +---------------------+         ‖ +---------------------+ ‖
      ▲     | #6                  |           | end space =         |         ‖ | #6                  | ‖
  3 - |     |                     |           | #6.size +           |         *=========================*
      ▼     |                     |           | #7.size             |           |                     |
      ----- +---------------------+           |                     |           +---------------------+
            | #7                  |           |                     |           | end space = #7.size |
            |                     |           |                     |           |                     |
            |                     |           |                     |           |                     |
            +---------------------+           +---------------------+           +---------------------+

```

This is a bare minimum to determine both first and last visible items. With the border indexes it's pretty straightforward to calculate space required to reserve for invisible items on both sides. By following this strategy you can replace huge amount of complex item componets by a single placeholder node at each end.

If any of the 3 variables changes the hook updates resulting values and this is where invisible becomes visible 💫 (and another way around).

### `interface UseWindowedListOptions`

A set of options to configure the windowed list.

```ts static
interface UseWindowedListOptions {
  containerSize: number
  itemSize: number | ((index: number) => number)
  itemCount: number
  overscanCount?: number
  layout?: ListLayout
  initialScroll?: InitialListScroll
  containerOnScrollThrottleInterval?: number
  containerIsScrollingDebounceInterval?: number
  onItemsRendered?(renderedRange: ListRenderedRange): void
}
```

#### `containerSize: number`

A size of the container in pixels which determine the number of items visible at any given time.
Represents either hight for vertical or width for horizontal containers.

> note: The hook does not read container size from a DOM node properties so the value must represent actual size of a container.

> tip: You can use any kind of approaches ([search for `use size react`](https://www.npmjs.com/search?q=use%20size%20react)) to determine size of a container in case it's unkown or changes dynamicly - the hook re-calculates output for a new size. See the example of unknown and dynamic container sizes (@TODO add links to the examples).

> pro tip: it's recommended to use debouncing/throttline of the container size in case of high frequent changes to gain better performance. See the example of throttling the size value (@TODO add links to the example).

```tsx { "file": "./use-windowed-list/basic.md.tsx" }

```
