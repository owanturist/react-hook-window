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

#### `UseWindowedListOptions.containerSize: number`

A size of the container in pixels which determine the number of items visible at any given time. Represents either hight for vertical or width for horizontal layout.

> note: The hook does not read container size from a DOM node properties so the value must represent actual size of the given container.

> tip: you can use any kind of approaches ([search for `use size react`](https://www.npmjs.com/search?q=use%20size%20react)) to determine size of a container in case it's unkown or changes dynamicly - the hook re-calculates output when the value changes. See the example of unknown and dynamic container sizes (@TODO add links to the examples).

> pro tip: it's recommended to use debouncing/throttline of the container size in case of high frequent changes to gain better performance. See the example of throttling the size value (@TODO add links to the example).

#### `UseWindowedListOptions.itemSize: number`

A size of every item in pixels. Represents either items' height for vertical or width for horisontal layout.

It is an ideal option in cases when all items have the same size. In cases when items have different or unknown sizes, you can define the `itemSize` as a function (@TODO add cross-link to the doc).

> note: The hook does not read items size from DOM nodes properties so the value must represent actual size of the given items.

#### `UseWindowedListOptions.itemSize: (index: number) => number`

A function that determines an item's size in pixels by its index. Represents either items' height for vertical or width for horisontal layout.

This is the only option to define a windowed list with variable items size. In cases when items have same known size, you can define the `itemSize` value as a number (@TODO add cross-link to the doc).

> note: The hook does not read items size from DOM nodes properties so the value must represent actual size of the given items.

> tip: you can use any kind of approaches ([search for `use size react`](https://www.npmjs.com/search?q=use%20size%20react)) to determine size of a items in case it's unkown or changes dynamicly - the hook re-calculates output when the function value changes. See the example of unknown and dynamic items sizes (@TODO add links to the examples).

> tip: make sure the function always returns a `number` value for cases when a value is uknown or out of range:
>
> ```ts
> const itemSize = (index: number): number => ITEMS_SIZE_ARRAY[index] || 0
> ```

> important: in order to reduce amount of constructions of the `itemEndPositions` array the `itemSize` function should change as less often as possible. You can achieve that by using memoization technics. See the example of using React memoization tools (@TODO add links to the example). Read the "how it works" section right below the notice to understand why the memoizatin is imporant (@TODO add collapsible section).

Here is how it works: each time when `itemCount` or `itemSize` values change the hook calculates an array of the items' end positions by accumulating items' sizes. Consider this example:

```ts
const ITEM_SIZE_ARRAY = [30, 10, 40, 50, 20]

// the hooks attributes
const itemCount = ITEM_SIZE_ARRAY.length
const itemSize = (index: number): number => ITEMS_SIZE_ARRAY[index]

// the hook INTERNAL array with each item end positions
const itemsEndPositions = [
  // each value is a sum of two numbers:
  // - left number is end position of previous item (or 0 for the first one)
  // - right number is size of the item
  30, // 0 + 30
  40, // 30 + 10
  80, // 40 + 40
  130, // 80 + 50
  150 // 130 + 20
]
```

Each time when the hook should calculate first or last visible items for the current scroll position it performs binary search in the `itemsEndPosition` array. The binary search spends only `O(log n)` (where `n` is `itemCount`), wihch means that it takes maximum 10 steps to find a value in 1.000 items or maximum 20 steps in 1.000.000 items. For comparasing, linear search wich takes `O(n)` time and will find a value for maximum 1.000 steps in 1.000 items, or maximum 1.000.000 steps 1.000.000 items.

There are two downsides of the binary search approach:

1. It takes `O(n)` time for constructing the `itemsEndPositions` array
2. It takes `O(n)` extra space for keeping the `itemsEndPositions` array in memory

The first downside could be overcome by assuming that real applications search for items positions much more often than it changes items size. The speed gain in performance easily defeats the second downside.

#### `UseWindowedListOptions.itemCount: number`

The number of items. That's simple. The hook will re-calculate the output on each value update so don't be afraid to change it on fly.

#### `UseWindowedListOptions.overscanCount?: number = 1`

The number of items to render outside of the visible area. The hook will update the output on each value update.

> tip: it's important to set the value to a number greater than 0 to make it possible to focus via tab button on the next or previous not yet visible items.

> tip: setting the value too high will degrade performance but keeping the value reasonably low could improve UX by pre-rendering not yet visible items.

#### `UseWindowedListOptions.layout?: ListLayout = 'vertical'`

It determines the expected list layout to indicate which scrolling variables the hook should rely on. It's still up to you to decide styling preferences but it's important to let the hook know the direction its content should be windowed. By knowing so the hook can correctly extract current scrolling position and calculate desired ones on [`UseWindowedListResult.scrollTo`](https://@TODO-add-cross-link.com) and [`UseWindowedListResult.scrollToItem`](https://@TODO-add-cross-link.com) calls.

##### `ListLayout: 'vertical'`

The default layout value. Indicates the layout to be scrolling up and down, meaning that items from above of the first visible and from below of the last visible item might be not rendered. See an example of vertical windowed list (@TODO add link to the example).

```tsx { "file": "./use-windowed-list/basic.md.tsx" }

```
