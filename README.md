# Getting Started

If you are using Yarn here is how you install it:

```bash
yarn add react-hook-window
```

And for a NPM oriented audience here is what you would run:

```bash
npm install react-hook-window
```

# Usage

Consider a friends list component:

```tsx
import React from 'react'

const FRIENDS_CONTAINER_HEIGHT = 500
const FRIENDS_ITEM_HEIGHT = 60

export interface Friend {
  id: string
  name: string
}

export const FriendsList: React.VFC<{
  friends: Array<Friend>
}> = ({ friends }) => {
  return (
    <div
      className="container"
      style={{
        overflow: 'auto',
        height: FRIENDS_CONTAINER_HEIGHT
      }}
    >
      {friends.map(friend => (
        <div
          key={friend.id}
          className="box"
          style={{ height: FRIENDS_ITEM_HEIGHT }}
        >
          {friend.name}
        </div>
      ))}
    </div>
  )
}
```

Let's convert it to a windowed feed component via four steps:

```tsx
export const FriendsList: React.VFC<{
  friends: Array<Friend>
}> = ({ friends }) => {
  // 1. Call the hook
  const { setRef, startSpace, endSpace, indexes } = useWindowedList({
    containerSize: FRIENDS_CONTAINER_HEIGHT,
    itemSize: FRIENDS_ITEM_HEIGHT,
    itemCount: friends.length
  })

  return (
    <div
      // 2. Set the container ref
      ref={setRef}
      className="container"
      style={{
        overflow: 'auto',
        height: FRIENDS_CONTAINER_HEIGHT
      }}
    >
      {/* 3.1. Add the start spacer */}
      <div style={{ height: startSpace }} />

      {indexes
        // 4. Map indexes to items
        .map(index => friends[index])
        .map(friend => (
          <div
            key={friend.id}
            className="box"
            style={{ height: FRIENDS_ITEM_HEIGHT }}
          >
            {friend.name}
          </div>
        ))}

      {/* 3.2. Add the end spacer */}
      <div style={{ height: endSpace }} />
    </div>
  )
}
```

This is the most basic usage example. See API documentation and Examples for more insights.

## `useWindowedList`

```ts
<E extends HTMLElement>(options: UseWindowedListOptions) => UseWindowedListResult<E>
```

The custom `useWindowedList` hook calculates a visible range of items in a given viewport. The hook creates zero additional DOM nodes, meaning that it provides unlimited customization freedom for both style preferenes and tags structure.

Under the hood the hook calculates range of visible items based on 3 variables:

1. scroll position
1. container size
1. items size

```
    ---- ┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
    ▲    │ #0              │           │ start space =   │           │ start space =   │
    │    │                 │           │ #0.size +       │           │ #0.size +       │
    │    │                 │           │ #1.size         │           │ #1.size +       │
    │    ├─────────────────┤           │                 │           │ #2.size         │
1 - │    │ #1              │           │                 │           │                 │
    │    │                 │           │                 │           │                 │
    │    │                 │           │                 │           │                 │
    │    ├─────────────────┤           ├─────────────────┤           │                 │
    ▼    │ #2              │           │ #2              │           │                 │
    --- ┏┿━━━━━━━━━━━━━━━━━┿┓         ┏┿━━━━━━━━━━━━━━━━━┿┓          │                 │
    ▲   ┃│                 │┃         ┃│                 │┃          │                 │
    │   ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
    │   ┃│ #3              │┃         ┃│ #3              │┃          │ #3              │
    │   ┃│                 │┃         ┃│                 │┃         ┏┿━━━━━━━━━━━━━━━━━┿┓
    │   ┃│                 │┃         ┃│                 │┃         ┃│                 │┃
2 - │   ┃├─────────────────┤┃   ==>   ┃├─────────────────┤┃   ==>   ┃├─────────────────┤┃
    │   ┃│ #4              │┃         ┃│ #4              │┃         ┃│ #4              │┃
    │   ┃│                 │┃         ┃│                 │┃         ┃│                 │┃
    │   ┃│                 │┃         ┃│                 │┃         ┃│                 │┃
    │   ┃├─────────────────┤┃         ┃├─────────────────┤┃         ┃├─────────────────┤┃
    ▼   ┃│ #5              │┃         ┃│ #5              │┃         ┃│ #5              │┃
    --- ┗┿━━━━━━━━━━━━━━━━━┿┛         ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│                 │┃
         │                 │           │                 │          ┃│                 │┃
    ---- ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
    ▲    │ #6              │           │ end space =     │          ┃│ #6              │┃
3 - │    │                 │           │ #6.size +       │          ┗┿━━━━━━━━━━━━━━━━━┿┛
    ▼    │                 │           │ #7.size         │           │                 │
    ---- ├─────────────────┤           │                 │           ├─────────────────┤
         │ #7              │           │                 │           │ end space =     │
         │                 │           │                 │           │ #7.size         │
         │                 │           │                 │           │                 │
         └─────────────────┘           └─────────────────┘           └─────────────────┘

```

This is a bare minimum to determine both first and last visible items. With the indexes known it's pretty straightforward to calculate spaces required to reserve before the first and after the last visible items. Following this strategy you can replace huge amount of complex item componets by a single placeholder node at each side and

1. speed up the initial render
1. reduce memory allocation of not visible DOM nodes

## `interface UseWindowedListOptions`

A collection of options to configure the windowed list.

```ts
interface UseWindowedListOptions {
  containerSize: number
  itemSize: ItemSize
  itemCount: number
  overscanCount?: number
  layout?: ListLayout
  initialScroll?: InitialListScroll
  containerOnScrollThrottleInterval?: number
  containerIsScrollingDebounceInterval?: number
  onItemsRendered?: (renderedRange: ListRenderedRange) => void
}
```

### `UseWindowedListOptions.containerSize`

```ts
containerSize: number
```

A size of the container in pixels which determine the number of items visible at any given time. Represents either hight for vertical or width for horizontal layout.

> note: The hook does not read container size from a DOM node properties so the value must represent actual size of the given container.

> tip: you can use any kind of approaches ([search for `use size react`](https://www.npmjs.com/search?q=use%20size%20react)) to determine size of a container in case it's unkown or changes dynamicly - the hook re-calculates output when the value changes. See the example of unknown and dynamic container sizes (@TODO add links to the examples).

> pro tip: it's recommended to use debouncing/throttline of the container size in case of high frequent changes to gain better performance. See the example of throttling the size value (@TODO add links to the example).

### `UseWindowedListOptions.itemSize`

A size of an item in pixels. Represents either items' height for vertical or width for horisontal layout.

In cases when all items have the same size it can define it as a constant number:

```ts
itemSize: number
```

But if items have unknown or different sizes it could be defined as a function, returning an item's height by its index:

```ts
itemSize: (index: number) => number
```

> note: The hook does not read items size from DOM nodes properties so the value must represent actual size of the given items.

> tip: you can use any kind of approaches ([search for `use size react`](https://www.npmjs.com/search?q=use%20size%20react)) to determine size of a items in case it's unkown or changes dynamicly - the hook re-calculates output when the function value changes. See the example of unknown and dynamic items sizes (@TODO add links to the examples).

> tip: make sure the function always returns a `number` value for cases when a value is uknown or out of range:
>
> ```ts
> const itemSize = (index: number): number => ITEMS_SIZE_ARRAY[index] || 0
> ```

TODO rearrange that 👇

> important: in order to reduce amount of constructions of the `itemsEndPositions` array the `itemSize` function should change as less often as possible. You can achieve that by using memoization technics. See the example of using React memoization tools (@TODO add links to the example). Click on the "How dynamic item size works" section right below the notice to understand why the memoizatin is imporant.

<details>
  <summary>
    How dynamic item size works?
  </summary>
<blockquote>

Each time when `itemCount` or `itemSize` values change the hook calculates an array of the items' end positions by accumulating items' sizes. Consider this example:

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

</blockquote></details>

### `UseWindowedListOptions.itemCount`

```ts
itemCount: number
```

The number of items. The hook will re-calculate the output on each value update.

### `UseWindowedListOptions.overscanCount`

```ts
overscanCount?: number = 1
```

The number of items to render outside of the visible area. The hook will update the output on each value update.

> tip: it's important to set the value to a number greater than 0 to make it possible to focus via tab button on the next or previous not yet visible items.

> tip: setting the value too high will degrade performance but keeping the value reasonably low could improve UX by pre-rendering not yet visible items.

### `UseWindowedListOptions.layout`

```ts
layout?: ListLayout = 'vertical'
```

The option determines in which direction a list's content will be windowed. By knowing the layout the hook can correctly extract current scrolling position and calculate desired ones on [`UseWindowedListResult.scrollTo`][todo] and [`UseWindowedListResult.scrollToItem`][todo] calls.

### `UseWindowedListOptions.initialScroll`

```ts
initialScroll?: number = 0
```

Scrolling position of a windowed list for an initial render only. It affect either `scrollTop` or `scrollLeft` for vertical or horizontal [layouts][todo] respectevely.

The `number` value represents the scrolling position in pixels. If it's nesessary to scroll to an exact item the value might be defined as an object with the item's `index` and optional [scrolling `strategy`][todo]:

```ts
initialScroll?: {
  index: number
  position?: ScrollPosition
}
```

### `UseWindowedListOptions.containerOnScrollThrottleInterval`

```ts
containerOnScrollThrottleInterval?: number = 16
```

The value defining a throttle interval of a container scroll listener in milliseconds. High value makes UI response faster but degrade performance and another way around. The default value limits the listener on ~60 calls per second.

### `UseWindowedListOptions.containerIsScrollingDebounceInterval`

```ts
containerIsScrollingDebounceInterval?: number = 150
```

The value defining an interval in milliseconds to determine the [`isScrolling`][todo] flag. The flag becomes `true` on the first onScroll listener call and turns `false` after the debounce interval time passed from the last call of the listener. The default value is an empiric based interval to provide natural feeling of the flag behaviour.

<details>
  <summary>
    Show an illustration
  </summary>

  <blockquote>

```
on scroll calls

          ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃                             ┃┃┃┃┃┃┃┃┃┃┃
          ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃                             ┃┃┃┃┃┃┃┃┃┃┃
          ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃                             ┃┃┃┃┃┃┃┃┃┃┃
┯━━━━━━━━━╇┻┻┻┻┻┻┻┻┻╇┻┻┻┻┻┻┻┻┻╇━━━━━━━━━┯━━━━━━━━━┯━━━━━━━━━╇┻┻┻┻┻┻┻┻┻╇━━━━━━━━━┯━━━━━━━━━┯━
0        100       200       300       400       500       600       700       800       900
          ┊                   ┊                             ┊         ┊
is scrolling                  ┊                             ┊         ┊
          ┊                   ┊                             ┊         ┊
          ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓              ┏━━━━━━━━━━━━━━━━━━━━━━━━┓
          ┃                   ┊              ┃              ┃         ┊              ┃
          ┃                   ┊              ┃              ┃         ┊              ┃
          ┃                   ┊              ┃              ┃         ┊              ┃
┯━━━━━━━━━╃─────────┬─────────┬─────────┬────┺━━━━┯━━━━━━━━━╃─────────┬─────────┬────┺━━━━┯━
0        100       200       300       400   ┊   500       600       700       800   ┊   900
                              ┊    150 ms    ┊                        ┊    150 ms    ┊
                              ┊◄────────────►┊                        ┊◄────────────►┊
                           the debounce interval                   the debounce interval
```

  </blockquote>
</details>

### `UseWindowedListOptions.onItemsRendered`

```ts
/**
 * renderedRange - a collection of visile and overscan items' indexes
 */
onItemsRendered?: (renderedRange: ListRenderedRange) => void
```

A callback to call when either visible or overscan ranges change. See [`ListRenderedRange`][todo] for more details about the ranges.

> tip: it's important to memoize the callback, otherwise it will be called not only on the ranges change but on the callback value change as well.

## `interface ListRenderedRange`

```ts
export interface ListRenderedRange {
  overscanStart: number
  overscanStop: number
  visibleStart: number
  visibleStop: number
}
```

A collection of values describing two half-open intervals:

1. visible items ∈ `[visibleStart, visibleStop)` partially or entirelly visible on the current scroll position
1. overscan items ∈ `[overscanStart, overscanStop)` includes visible items and some additional non visible defined via [UseWindowedListOptions.overscanCount][todo] value.

TODO put below content to collapsable with something like "Read why it is like this" name.

Both intervals include the start indexes and exclude end onces, so the resulting index ranges might be iterated by `for (let i = start; i < stop; i++)`, for instance:

```ts
const range: ListRenderedRange = {
  overscanStart: 15,
  overscanStop: 21,
  visibleStart: 16,
  visibleStop: 20
}:
```

The `range` indicates that elements with indexes `[16, 17, 18, 19]` are visible and `[15, 16, 17, 18, 19, 20]` are overscan.

> why: you might thing that the ranges should be defined as closed interval. For example visible items ∈ `[visibleStart, visibleStop]` so indexes might be iterated via `for (let i = start; i <= stop; i++)`. It works fine until it defines non empty ranges. If for some reason a range is empty it should be defined like `[1, 0]` or `[16, 0]`, because `[1, 1]` and `[16, 16]` define single item ranges. It is confusing. Instead, it excludes stop index, so it the empty ranges converts to `[1, 1)` and `[16, 16)`.

## `interface UseWindowedListResult`

The result of the hook call containing all needed information about windowed items and a piece of helpful additional properties and functions.

```ts
export interface UseWindowedListResult<E extends HTMLElement>
  extends ListRenderedRange {
  startSpace: number
  endSpace: number
  indexes: ReadonlyArray<number>
  isScrolling: boolean
  container: null | E
  setRef: (node: null | E) => void
  scrollTo: (px: number) => void
  scrollToItem: (index: number, position?: ScrollPosition) => void
}
```

### `UseWindowedListResult.startSpace`

```ts
startSpace: number
```

A space in pixels before the first rendered item required to reserve instead of rendering items outisde of a visible area. It represents either top space for vertical or left space for horizontal [layouts][todo]. Take a look at an illustration in the ["How does it work"][todo] section.

### `UseWindowedListResult.endSpace`

```ts
endSpace: number
```

A space in pixels after the last rendered item required to reserve instead of rendering items outisde of a visible area. It represents either bottom space for vertical or right space for horizontal [layouts][todo]. Take a look at an illustration in the ["How does it work"][todo] section.

### `UseWindowedListResult.indexes`

```ts
indexes: ReadonlyArray<number>
```

An array of the list items' indexes. The range starts from `ListRenderedRange.overscanStart` and ends before `ListRenderedRange.overscanStop` so it's easy to use `indexes.map` method to map the indexes to items' data.

### `UseWindowedListResult.isScrolling`

```ts
isScrolling: boolean
```

A flag indicating whenever the container is scrolling. See the relevant [`UseWindowedListOptions.containerIsScrollingDebounceInterval`][todo] option for changing it's behaviour.

### `UseWindowedListResult.container`

```ts
container: null | E
```

Either a container's node extending `HTMLElement` or `null` assigned by [`UseWindowedListResult.setRef`][todo].

### `UseWindowedListResult.setRef`

```ts
/**
 * node - either a container's DOM node exteinding HTMLElement or null
 */
setRef: (node: null | E) => void
```

A function to set a container of a windowed list. Each call of `setRef` enqueues a re-render of the component so the hook always calculates an output with an actual container. The value is accessable via [`UseWindowedListResult.container`][todo].

### `UseWindowedListResult.scrollTo`

```ts
/**
 * px - a scrolling position of a container to be scrolling to
 */
scrollTo: (px: number) => void
```

A function to scroll a windowed list to a position in pixels. It affect either `scrollTop` or `scrollLeft` for vertical or horizontal [layouts][todo] respectevely.

### `UseWindowedListResult.scrollToItem`

```ts
/**
 * index - an element's index to be scrolling to
 * position = 'auto' - a strategy to use for scrolling to a desired element
 */
scrollToItem: (index: number, position?: ScrollPosition) => void
```

A function to scroll a windowed list to a position of element index. It affect either `scrollTop` or `scrollLeft` for vertical or horizontal [layouts][todo] respectevely.

## `type ListLayout`

A set of availale values of [`UseWindowedListOptions.layout`][todo] option:

- `'vertical'` - the default value, indicates up/down scrolling.
- `'horizontal'` - indicates left/right scrolling. See horizontal layout windowed list [example][todo].
- `'horizontal-rtl'` - indicates right/left scrolling. See horizontal right-to-left layout windowed list [example][todo].
  > why: the layout **does not** set any style properties but due to [inconsistent right-to-left browser scrolling position][rtl-scroll-inconsistency] implementation it's required for correct desired position calculations for [`UseWindowedListResult.scrollTo`][todo] and [`UseWindowedListResult.scrollToItem`][todo] calls.

## `type ScrollPosition`

A set of available values defining a target element when scrolling via [`UseWindowedListOptions.initialScroll`][todo] or [`UseWindowedListOptions.scrollToItem`][todo].

- `auto` - scroll as little as possible to ensure the item is visible. If the item is already visible, it won't scroll at all.
  <details>
    <summary>
      Show an illustration
    </summary>

    <blockquote>

  ```
    containerSize > target itemSize

  ┏┯━━━━━━━━━━━━━━━━━┯┓          ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃          │ #0              │           │ #0              │
  ┃│                 │┃         ┏┿━━━━━━━━━━━━━━━━━┿┓          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #1              │┃         ┃│ #1              │┃          │ #1              │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #2              │┃         ┃│ #2              │┃          │ #2              │
  ┃│                 │┃         ┃│                 │┃         ┏┿━━━━━━━━━━━━━━━━━┿┓
  ┃│                 │┃         ┃│                 │┃         ┃│                 │┃
  ┃├─────────────────┤┃         ┃├─────────────────┤┃         ┃├─────────────────┤┃
  ┃│ #3              │┃         ┃│ #3              │┃         ┃│ #3              │┃
  ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│                 │┃         ┃│                 │┃
   │                 │     3    ┃│                 │┃    5    ┃│                 │┃
   ├─────────────────┤    ==>   ┗┿━━━━━━━━━━━━━━━━━┿┛   ==>   ┃├─────────────────┤┃
   │ #4              │           │ #4              │          ┃│ #4              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #5              │           │ #5              │          ┃│ #5              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┗┿━━━━━━━━━━━━━━━━━┿┛
   │ #6              │           │ #6              │           │ #6              │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   ├─────────────────┤           ├─────────────────┤           ├─────────────────┤
   │ #7              │           │ #7              │           │ #7              │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   └─────────────────┘           └─────────────────┘           └─────────────────┘

                                                                        ‖
                                                                      3 ‖ no change
                                                                        v

  ┏┯━━━━━━━━━━━━━━━━━┯┓          ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃          │ #0              │           │ #0              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃├─────────────────┤┃          ├─────────────────┤           ├─────────────────┤
  ┃│ #1              │┃          │ #1              │           │ #1              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃├─────────────────┤┃         ┏┿━━━━━━━━━━━━━━━━━┿┓          ├─────────────────┤
  ┃│ #2              │┃         ┃│ #2              │┃          │ #2              │
  ┃│                 │┃         ┃│                 │┃         ┏┿━━━━━━━━━━━━━━━━━┿┓
  ┃│                 │┃         ┃│                 │┃         ┃│                 │┃
  ┃├─────────────────┤┃         ┃├─────────────────┤┃         ┃├─────────────────┤┃
  ┃│ #3              │┃         ┃│ #3              │┃         ┃│ #3              │┃
  ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│                 │┃         ┃│                 │┃
   │                 │     0    ┃│                 │┃    2    ┃│                 │┃
   ├─────────────────┤    <==   ┃├─────────────────┤┃   <==   ┃├─────────────────┤┃
   │ #4              │          ┃│ #4              │┃         ┃│ #4              │┃
   │                 │          ┃│                 │┃         ┃│                 │┃
   │                 │          ┃│                 │┃         ┃│                 │┃
   ├─────────────────┤          ┃├─────────────────┤┃         ┃├─────────────────┤┃
   │ #5              │          ┃│ #5              │┃         ┃│ #5              │┃
   │                 │          ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┗┿━━━━━━━━━━━━━━━━━┿┛
   │ #6              │           │ #6              │           │ #6              │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   ├─────────────────┤           ├─────────────────┤           ├─────────────────┤
   │ #7              │           │ #7              │           │ #7              │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   └─────────────────┘           └─────────────────┘           └─────────────────┘
  ```

  @TODO fix it in the behaviour

  ```
    containerSize < target itemSize

  ┏┯━━━━━━━━━━━━━━━━━┯┓          ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃          │ #0              │           │ #0              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┗┿━━━━━━━━━━━━━━━━━┿┛          │                 │           │                 │
   │                 │           │                 │           │                 │
   ├─────────────────┤          ┏┿━━━━━━━━━━━━━━━━━┿┓          ├─────────────────┤
   │ #1              │          ┃│ #1              │┃          │ #1              │
   │                 │          ┃│                 │┃          │                 │
   │                 │          ┃│                 │┃          │                 │
   │                 │          ┃│                 │┃          │                 │
   │                 │          ┃│                 │┃          │                 │
   │                 │          ┗┿━━━━━━━━━━━━━━━━━┿┛          │                 │
   │                 │     1     │                 │     3     │                 │
   ├─────────────────┤    ==>    ├─────────────────┤    ==>    ├─────────────────┤
   │ #2              │           │ #2              │           │ #2              │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   ├─────────────────┤           ├─────────────────┤          ┏┿━━━━━━━━━━━━━━━━━┿┓
   │ #3              │           │ #3              │          ┃│ #3              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┗┿━━━━━━━━━━━━━━━━━┿┛
   │                 │           │                 │           │                 │
   └─────────────────┘           └─────────────────┘           └─────────────────┘

                                                                        ‖
                                                                      3 ‖ no change
                                                                        v

   ┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
   │ #0              │           │ #0              │           │ #0              │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   ├─────────────────┤           ├─────────────────┤           ├─────────────────┤
   │ #1              │           │ #1              │           │ #1              │
  ┏┿━━━━━━━━━━━━━━━━━┿┓         ┏┿━━━━━━━━━━━━━━━━━┿┓          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃    1    ┃│                 │┃    1     │                 │
  ┗┿━━━━━━━━━━━━━━━━━┿┛   <==   ┗┿━━━━━━━━━━━━━━━━━┿┛   <==    ├─────────────────┤
   │ #2              │ no change │ #2              │           │ #2              │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   ├─────────────────┤           ├─────────────────┤          ┏┿━━━━━━━━━━━━━━━━━┿┓
   │ #3              │           │ #3              │          ┃│ #3              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┗┿━━━━━━━━━━━━━━━━━┿┛
   │                 │           │                 │           │                 │
   └─────────────────┘           └─────────────────┘           └─────────────────┘
  ```

    </blockquote>
  </details>

- `smart` - if the item is already visible, don't scroll at all. If it is less than one viewport away, scroll as little as possible so that it becomes visible (acting the same as `auto`). If it is more than one viewport away, scroll so that it is centered within the list (acting the same as `center`).
  <details>
    <summary>
        Show an illustration
    </summary>

    <blockquote>

  ```
  1. scrolling to 6th that is clother than one viewport - scroll as little as possible
  2. scrolling to 11th that is father than one viewport - scroll to center the 11th item

  ┏┯━━━━━━━━━━━━━━━━━┯┓          ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃          │ #0              │           │ #0              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃├─────────────────┤┃          ├─────────────────┤           ├─────────────────┤
  ┃│ #1              │┃          │ #1              │           │ #1              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃├─────────────────┤┃          ├─────────────────┤           ├─────────────────┤
  ┃│ #2              │┃          │ #2              │           │ #2              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃├─────────────────┤┃    6     ├─────────────────┤           ├─────────────────┤
  ┃│ #3              │┃   ==>    │ #3              │           │ #3              │
  ┗┿━━━━━━━━━━━━━━━━━┿┛ ----    ┏┿━━━━━━━━━━━━━━━━━┿┓          │                 │
   │                 │     ┃    ┃│                 │┃          │                 │
   ├─────────────────┤     ┃    ┃├─────────────────┤┃          ├─────────────────┤
   │ #4              │     ┃    ┃│ #4              │┃          │ #4              │
   │                 │     ┃    ┃│                 │┃          │                 │
   │                 │     ┃    ┃│                 │┃          │                 │
   ├─────────────────┤     ┃    ┃├─────────────────┤┃          ├─────────────────┤
   │ #5              │     ┃    ┃│ #5              │┃          │ #5              │
   │                 │     ┃    ┃│                 │┃          │                 │
   │                 │     ┃    ┃│                 │┃          │                 │
   ├─────────────────┤     ┃    ┃├─────────────────┤┃          ├─────────────────┤
   │ #6              │     ┃    ┃│ #6              │┃          │ #6              │
   │                 │     ┃    ┃│                 │┃    11    │                 │
   │                 │     ▼    ┃│                 │┃   ===>   │                 │
   ├─────────────────┤     ---- ┗┿━━━━━━━━━━━━━━━━━┿┛ ----     ├─────────────────┤
   │ #7              │           │ #7              │     ┃     │ #7              │
   │                 │           │                 │     ┃     │                 │
   │                 │           │                 │     ┃     │                 │
   ├─────────────────┤           ├─────────────────┤     ┃     ├─────────────────┤
   │ #8              │           │ #8              │     ┃     │ #8              │
   │                 │           │                 │     ┃     │                 │
   │                 │           │                 │     ┃     │                 │
   ├─────────────────┤           ├─────────────────┤     ┃     ├─────────────────┤
   │ #9              │           │ #9              │     ┃     │ #9              │
   │                 │           │                 │     ┃     │                 │
   │                 │           │                 │     ┃    ┏┿━━━━━━━━━━━━━━━━━┿┓
   ├─────────────────┤           ├─────────────────┤     ┃    ┃├─────────────────┤┃
   │ #10             │           │ #10             │     ┃    ┃│ #10             │┃
   │                 │           │                 │     │    ┃│                 │┃
   │                 │           │                 │     │    ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤     │    ┃├─────────────────┤┃
   │ #11             │           │ #11             │     │    ┃│ #11             │┃
   │                 │           │                 │     │    ┃│                 │┃
   │                 │           │                 │     ▼    ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤     ---- ┃├─────────────────┤┃
   │ #12             │           │ #12             │          ┃│ #12             │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #13             │           │ #13             │          ┗┿━━━━━━━━━━━━━━━━━┿┛
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   └─────────────────┘           └─────────────────┘           └─────────────────┘

                                                                        ‖
                                                                    12 ‖ no change
                                                                        v
  3. scrolling to 12th that is already visible = no scroll needed
  4. scrolling to 3th that is farther than one viewport - scroll to center the 3rd item
  5. scrolling to 0th that is clother than one viewport - scroll as little as possible

  ┏┯━━━━━━━━━━━━━━━━━┯┓ -----    ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃     ▲    │ #0              │           │ #0              │
  ┃│                 │┃     ┃    │                 │           │                 │
  ┃│                 │┃     ┃    │                 │           │                 │
  ┃├─────────────────┤┃     ┃    ├─────────────────┤           ├─────────────────┤
  ┃│ #1              │┃     ┃    │ #1              │           │ #1              │
  ┃│                 │┃     ┃    │                 │           │                 │
  ┃│                 │┃     --- ┏┿━━━━━━━━━━━━━━━━━┿┓          │                 │
  ┃├─────────────────┤┃     0   ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #2              │┃    <==  ┃│ #2              │┃          │ #2              │
  ┃│                 │┃         ┃│                 │┃    3     │                 │
  ┃│                 │┃         ┃│                 │┃   <==    │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃ ----     ├─────────────────┤
  ┃│ #3              │┃         ┃│ #3              │┃    ▲     │ #3              │
  ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│                 │┃    │     │                 │
   │                 │          ┃│                 │┃    │     │                 │
   ├─────────────────┤          ┃├─────────────────┤┃    │     ├─────────────────┤
   │ #4              │          ┃│ #4              │┃    │     │ #4              │
   │                 │          ┃│                 │┃    │     │                 │
   │                 │          ┃│                 │┃    │     │                 │
   ├─────────────────┤          ┃├─────────────────┤┃    │     ├─────────────────┤
   │ #5              │          ┗┿━━━━━━━━━━━━━━━━━┿┛    │     │ #5              │
   │                 │           │                 │     │     │                 │
   │                 │           │                 │     │     │                 │
   ├─────────────────┤           ├─────────────────┤     │     ├─────────────────┤
   │ #6              │           │ #6              │     │     │ #6              │
   │                 │           │                 │     ┃     │                 │
   │                 │           │                 │     ┃     │                 │
   ├─────────────────┤           ├─────────────────┤     ┃     ├─────────────────┤
   │ #7              │           │ #7              │     ┃     │ #7              │
   │                 │           │                 │     ┃     │                 │
   │                 │           │                 │     ┃     │                 │
   ├─────────────────┤           ├─────────────────┤     ┃     ├─────────────────┤
   │ #8              │           │ #8              │     ┃     │ #8              │
   │                 │           │                 │     ┃     │                 │
   │                 │           │                 │     ┃     │                 │
   ├─────────────────┤           ├─────────────────┤     ┃     ├─────────────────┤
   │ #9              │           │ #9              │     ┃     │ #9              │
   │                 │           │                 │     ┃     │                 │
   │                 │           │                 │     ---- ┏┿━━━━━━━━━━━━━━━━━┿┓
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #10             │           │ #10             │          ┃│ #10             │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #11             │           │ #11             │          ┃│ #11             │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #12             │           │ #12             │          ┃│ #12             │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #13             │           │ #13             │          ┗┿━━━━━━━━━━━━━━━━━┿┛
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   └─────────────────┘           └─────────────────┘           └─────────────────┘
  ```

    </blockquote>
  </details>

- `start` - align the item to the beginning of the list (the top for vertical lists or the left for horizontal lists).
  <details>
    <summary>
      Show an illustration
    </summary>

    <blockquote>

  ```
  ┏┯━━━━━━━━━━━━━━━━━┯┓          ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃          │ #0              │           │ #0              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃├─────────────────┤┃          ├─────────────────┤           ├─────────────────┤
  ┃│ #1              │┃          │ #1              │           │ #1              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃├─────────────────┤┃          ├─────────────────┤           ├─────────────────┤
  ┃│ #2              │┃          │ #2              │           │ #2              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃├─────────────────┤┃         ┏┿━━━━━━━━━━━━━━━━━┿┓          ├─────────────────┤
  ┃│ #3              │┃         ┃│ #3              │┃          │ #3              │
  ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│                 │┃          │                 │
   │                 │     3    ┃│                 │┃    5     │                 │
   ├─────────────────┤    ==>   ┃├─────────────────┤┃   ==>    ├─────────────────┤
   │ #4              │          ┃│ #4              │┃          │ #4              │
   │                 │          ┃│                 │┃         ┏┿━━━━━━━━━━━━━━━━━┿┓
   │                 │          ┃│                 │┃         ┃│                 │┃
   ├─────────────────┤          ┃├─────────────────┤┃         ┃├─────────────────┤┃
   │ #5              │          ┃│ #5              │┃         ┃│ #5              │┃
   │                 │          ┃│                 │┃         ┃│                 │┃
   │                 │          ┃│                 │┃         ┃│                 │┃
   ├─────────────────┤          ┃├─────────────────┤┃         ┃├─────────────────┤┃
   │ #6              │          ┃│ #6              │┃         ┃│ #6              │┃
   │                 │          ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #7              │           │ #7              │          ┃│ #7              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   └─────────────────┘           └─────────────────┘          ┗┷━━━━━━━━━━━━━━━━━┷┛

                                                                        ‖
                                                                      3 ‖
                                                                        v

  ┏┯━━━━━━━━━━━━━━━━━┯┓          ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃          │ #0              │           │ #0              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃├─────────────────┤┃          ├─────────────────┤           ├─────────────────┤
  ┃│ #1              │┃          │ #1              │           │ #1              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃├─────────────────┤┃         ┏┿━━━━━━━━━━━━━━━━━┿┓          ├─────────────────┤
  ┃│ #2              │┃         ┃│ #2              │┃          │ #2              │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃         ┏┿━━━━━━━━━━━━━━━━━┿┓
  ┃│ #3              │┃         ┃│ #3              │┃         ┃│ #3              │┃
  ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│                 │┃         ┃│                 │┃
   │                 │     0    ┃│                 │┃    2    ┃│                 │┃
   ├─────────────────┤    <==   ┃├─────────────────┤┃   <==   ┃├─────────────────┤┃
   │ #4              │          ┃│ #4              │┃         ┃│ #4              │┃
   │                 │          ┃│                 │┃         ┃│                 │┃
   │                 │          ┃│                 │┃         ┃│                 │┃
   ├─────────────────┤          ┃├─────────────────┤┃         ┃├─────────────────┤┃
   │ #5              │          ┃│ #5              │┃         ┃│ #5              │┃
   │                 │          ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #6              │           │ #6              │          ┃│ #6              │┃
   │                 │           │                 │          ┗┿━━━━━━━━━━━━━━━━━┿┛
   │                 │           │                 │           │                 │
   ├─────────────────┤           ├─────────────────┤           ├─────────────────┤
   │ #7              │           │ #7              │           │ #7              │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   └─────────────────┘           └─────────────────┘           └─────────────────┘
  ```

    </blockquote>
  </details>

- `center` - align the item within the list.
  <details>
    <summary>
      Show an illustration
    </summary>

    <blockquote>

  ```
  ┏┯━━━━━━━━━━━━━━━━━┯┓          ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃          │ #0              │           │ #0              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃          │                 │           │                 │
  ┃├─────────────────┤┃          ├─────────────────┤           ├─────────────────┤
  ┃│ #1              │┃          │ #1              │           │ #1              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃         ┏┿━━━━━━━━━━━━━━━━━┿┓          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #2              │┃         ┃│ #2              │┃          │ #2              │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #3              │┃         ┃│ #3              │┃          │ #3              │
  ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│                 │┃          │                 │
   │                 │     3    ┃│                 │┃    5    ┏┿━━━━━━━━━━━━━━━━━┿┓
   ├─────────────────┤    ==>   ┃├─────────────────┤┃   ==>   ┃├─────────────────┤┃
   │ #4              │          ┃│ #4              │┃         ┃│ #4              │┃
   │                 │          ┃│                 │┃         ┃│                 │┃
   │                 │          ┃│                 │┃         ┃│                 │┃
   ├─────────────────┤          ┃├─────────────────┤┃         ┃├─────────────────┤┃
   │ #5              │          ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│ #5              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #6              │           │ #6              │          ┃│ #6              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #7              │           │ #7              │          ┗┿━━━━━━━━━━━━━━━━━┿┛
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   └─────────────────┘           └─────────────────┘           └─────────────────┘

                                                                        ‖
                                                                      6 ‖
                                                                        v

  ┏┯━━━━━━━━━━━━━━━━━┯┓          ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃          │ #0              │           │ #0              │
  ┃│                 │┃          │                 │           │                 │
  ┃│                 │┃         ┏┿━━━━━━━━━━━━━━━━━┿┓          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #1              │┃         ┃│ #1              │┃          │ #1              │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #2              │┃         ┃│ #2              │┃          │ #2              │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #3              │┃         ┃│ #3              │┃          │ #3              │
  ┗┿━━━━━━━━━━━━━━━━━┿┛         ┃│                 │┃          │                 │
   │                 │     0    ┃│                 │┃    2     │                 │
   ├─────────────────┤    <==   ┃├─────────────────┤┃   <==    ├─────────────────┤
   │ #4              │          ┗┿━━━━━━━━━━━━━━━━━┿┛          │ #4              │
   │                 │           │                 │          ┏┿━━━━━━━━━━━━━━━━━┿┓
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #5              │           │ #5              │          ┃│ #5              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #6              │           │ #6              │          ┃│ #6              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #7              │           │ #7              │          ┃│ #7              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   └─────────────────┘           └─────────────────┘          ┗┷━━━━━━━━━━━━━━━━━┷┛
  ```

    </blockquote>
  </details>

- `end` - align the item to the end of the list (the bottom for vertical lists or the right for horizontal lists).
  <details>
    <summary>
      Show an illustration
    </summary>

    <blockquote>

  ```
  ┏┯━━━━━━━━━━━━━━━━━┯┓          ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃          │ #0              │           │ #0              │
  ┃│                 │┃         ┏┿━━━━━━━━━━━━━━━━━┿┓          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #1              │┃         ┃│ #1              │┃          │ #1              │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #2              │┃         ┃│ #2              │┃          │ #2              │
  ┃│                 │┃         ┃│                 │┃         ┏┿━━━━━━━━━━━━━━━━━┿┓
  ┃│                 │┃         ┃│                 │┃         ┃│                 │┃
  ┃├─────────────────┤┃         ┃├─────────────────┤┃         ┃├─────────────────┤┃
  ┃│ #3              │┃         ┃│ #3              │┃         ┃│ #3              │┃
  ┗┷━━━━━━━━━━━━━━━━━┷┛         ┃│                 │┃         ┃│                 │┃
   │                 │     3    ┃│                 │┃    5    ┃│                 │┃
   ├─────────────────┤    ==>   ┗┷━━━━━━━━━━━━━━━━━┷┛   ==>   ┃├─────────────────┤┃
   │ #4              │           │ #4              │          ┃│ #4              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #5              │           │ #5              │          ┃│ #5              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┗┷━━━━━━━━━━━━━━━━━┷┛
   │ #6              │           │ #6              │           │ #6              │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   ├─────────────────┤           ├─────────────────┤           ├─────────────────┤
   │ #7              │           │ #7              │           │ #7              │
   │                 │           │                 │           │                 │
   │                 │           │                 │           │                 │
   └─────────────────┘           └─────────────────┘           └─────────────────┘

                                                                         ‖
                                                                       7 ‖
                                                                         v

  ┏┯━━━━━━━━━━━━━━━━━┯┓          ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃          │ #0              │           │ #0              │
  ┃│                 │┃         ┏┿━━━━━━━━━━━━━━━━━┿┓          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #1              │┃         ┃│ #1              │┃          │ #1              │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #2              │┃         ┃│ #2              │┃          │ #2              │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃│                 │┃         ┃│                 │┃          │                 │
  ┃├─────────────────┤┃         ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #3              │┃         ┃│ #3              │┃          │ #3              │
  ┗┷━━━━━━━━━━━━━━━━━┷┛         ┃│                 │┃          │                 │
   │                 │     2    ┃│                 │┃    3     │                 │
   ├─────────────────┤    <==   ┗┷━━━━━━━━━━━━━━━━━┷┛   <==    ├─────────────────┤
   │ #4              │           │ #4              │           │ #4              │
   │                 │           │                 │          ┏┿━━━━━━━━━━━━━━━━━┿┓
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #5              │           │ #5              │          ┃│ #5              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #6              │           │ #6              │          ┃│ #6              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   ├─────────────────┤           ├─────────────────┤          ┃├─────────────────┤┃
   │ #7              │           │ #7              │          ┃│ #7              │┃
   │                 │           │                 │          ┃│                 │┃
   │                 │           │                 │          ┃│                 │┃
   └─────────────────┘           └─────────────────┘          ┗┷━━━━━━━━━━━━━━━━━┷┛
  ```

    </blockquote>
  </details>

<!-- --------------------------------------------- -->

[todo]: https://to.do
[rtl-scroll-inconsistency]: https://stackoverflow.com/q/24276619/4582383
