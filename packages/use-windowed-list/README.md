# use-windowed-list

React hook to render only the visible items in a container.

## Getting Started

Install with Yarn:

```bash
yarn add @react-hook-window/use-windowed-list
```

Install with NPM:

```bash
npm install @react-hook-window/use-windowed-list --save
```

## Usage

Consider a friends list component:

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

Let’s convert it to a windowed friends list component via four steps:

```tsx
import { useWindowedList } from '@react-hook-window/use-windowed-list'

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

That is the most basic usage example. See API documentation below and [Examples][todo] for more insights.

---

### `useWindowedList`

```ts
<E extends HTMLElement>(options: UseWindowedListOptions) => UseWindowedListResult<E>
```

The custom `useWindowedList` hook calculates a visible range of items in a given viewport. It creates zero additional DOM nodes, meaning that it provides unlimited customization freedom for both style preferences and tags structure.

Under the hood, the hook calculates a range of visible items based on three variables:

1. **Scrolling position** - the container’s `scrollTop` or `scrollLeft` for vertical or horizontal [layouts][list-layout] respectively, extracted from a container’s node passed via [`UseWindowedListResult.setRef`][use-windowed-list-result.set-ref].
2. **Container size** - the container’s height or width for vertical or horizontal [layouts][list-layout] respectively, defined via [`UseWindowedListOptions.containerSize`][use-windowed-list-options.container-size].
3. **Items size** - the items’ height or width for vertical or horizontal [layouts][list-layout] respectively defined via [`UseWindowedListOptions.itemSize`][use-windowed-list-options.item-size].

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
2 - │   ┃├─────────────────┤┃    ▶    ┃├─────────────────┤┃    ▶    ┃├─────────────────┤┃
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

That is a bare minimum to determine both the first and last visible items. With the indexes known, it’s pretty straightforward to calculate spaces required to reserve before the first and after the last visible items. Following this strategy, you can replace a potentially huge amount of complex item components with a single placeholder node on each side. It helps address some common performance bottlenecks:

1. It reduces the amount of work (and time) required to render the initial view and to process updates.
2. It reduces the memory footprint by avoiding the over-allocation of DOM nodes.

---

### `interface UseWindowedListOptions`

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

That is a collection of options to configure the windowed list.

#### `UseWindowedListOptions.containerSize`

```ts
containerSize: number
```

It defines a size of a container in pixels determines the number of items visible at any given time. The value represents either height for vertical or width for horizontal [layouts][list-layout].

> 💬 The hook does not read container size from DOM node properties, so the value must represent the actual size of the given container.

> 💡 You can use any approach ([search for `use size react`][npm:use-size-react]) to determine the size of a container in case it’s unknown or changes dynamically - the hook re-calculates output when the value changes. See the example of [unknown][todo] and [dynamic][todo] container sizes.

> 💡 it’s recommended to use debouncing/throttling of the container size in case of high-frequency changes to gain better performance. See the [example][todo] of throttling the size value.

#### `UseWindowedListOptions.itemSize`

It defines a size of an item in pixels. The value represents either items’ height for vertical or width for horizontal [layouts][list-layout].

In cases when all items have the same size, it can define it as a constant number:

```ts
itemSize: number
```

But if items have unknown or different sizes, it could be defined as a function, returning an item’s height by its index:

```ts
itemSize: (index: number) => number
```

> 💬 The hook does not read items size from DOM nodes properties, so the value must represent the actual size of the given items.

> 💡 You can use any approach ([search for `use size react`][npm:use-size-react]) to determine the size of a container in case it’s unknown or changes dynamically - the hook re-calculates output when the value changes. See the example of [unknown][todo] and [dynamic][todo] container sizes.

> 💡 The `itemSize` function should always return a `number` for cases when the value is unknown or out of range.
>
> ```ts
> const itemSize = (index: number): number => ITEMS_SIZE_ARRAY[index] || 0
> ```

> 💡 The `itemSize` function should be memoized to avoid unnecessary recalculations of the items’ positions table.
>
>  <details>
>
>    <summary>
>      Show how the items’ positions table is calculated.
>    </summary>
>    <br/>
>
> Each time when `itemCount` or `itemSize` function changes the hook calculates an array of the items’ end positions by accumulating items’ sizes. Consider this example:
>
> ```ts
> const ITEM_SIZE_ARRAY = [30, 10, 40, 50, 20]
>
> // the hook's attributes
> const itemCount = ITEM_SIZE_ARRAY.length
> const itemSize = (index: number): number => ITEMS_SIZE_ARRAY[index]
>
> // the hook's INTERNAL array with each item end positions
> const itemsEndPositions = [
>   // each value is a sum of two numbers:
>   // - the number on left is the end position of a previous item (0 for the first one)
>   // - the number on right is the size of an item
>   30, // 0 + 30
>   40, // 30 + 10
>   80, // 40 + 40
>   130, // 80 + 50
>   150 // 130 + 20
> ]
> ```
>
> The hook calculates the first and last visible items for the current scroll position by performing a binary search in the `itemsEndPosition` array. The binary search spends only `O(log n)` (where `n` is `itemCount`), which means that it takes a maximum of 10 steps to find a value among 1.000 items or 20 among 1.000.000 respectively. For comparing a linear search which takes `O(n)` time and will find a value for a maximum of 1.000 steps among 1.000 items, or 1.000.000 among 1.000.000 respectively.
>
> There are two downsides of the binary search approach:
>
> 1. It takes `O(n)` time for constructing the `itemsEndPositions` array.
> 2. It takes `O(n)` extra space for keeping the `itemsEndPositions` array in memory.
>
> The first downside overcomes by assuming that real applications search for items positions much more often than it changes items’ size. The speed gain in performance easily defeats the second downside.
>
> </details>

#### `UseWindowedListOptions.itemCount`

```ts
itemCount: number
```

It defines the number of a list’s items.

#### `UseWindowedListOptions.overscanCount`

```ts
overscanCount?: number = 1
```

It defines the number of items to render outside of the visible area.

> 💡 It might be reasonable to set the value to a number greater than 0 to make it possible to focus via the tab button on the next or previous not yet visible items.

> 💡 Setting the value too high will degrade performance, but keeping the value number reasonably low could improve UX by pre-rendering not yet visible items.

#### `UseWindowedListOptions.layout`

```ts
layout?: ListLayout = 'vertical'
```

The option determines in which direction a list’s content will be windowed. By knowing the layout, the hook can correctly extract the current scrolling position and calculate desired ones on [`UseWindowedListResult.scrollTo`][use-windowed-list-result.scroll-to] and [`UseWindowedListResult.scrollToItem`][use-windowed-list-result.scroll-to-item] calls. See [`ListLayout`][list-layout] for more details.

#### `UseWindowedListOptions.initialScroll`

```ts
initialScroll?: number = 0
```

Scrolling position of a windowed list for an initial render only. It affect either `scrollTop` or `scrollLeft` for vertical or horizontal [layouts][list-layout] respectively.

The `number` value represents the scrolling position in pixels. If it’s necessary to scroll to an exact item, the value might be an object with the item’s `index` and optional [scrolling `position`][scroll-position]:

```ts
initialScroll?: {
  index: number
  position?: ScrollPosition
}
```

#### `UseWindowedListOptions.containerOnScrollThrottleInterval`

```ts
containerOnScrollThrottleInterval?: number = 16
```

It defines the throttle interval of a container scroll listener in milliseconds. High value makes UI response faster but degrades performance and another way around. The default value limits the listener on `1000ms / 16ms = ~60` calls per second.

#### `UseWindowedListOptions.containerIsScrollingDebounceInterval`

```ts
containerIsScrollingDebounceInterval?: number = 150
```

It defines an interval in milliseconds to determine the [`UseWindowedListResult.isScrolling`][use-windowed-list-result.is-scrolling] flag. The flag becomes `true` on the first onScroll listener call and turns `false` after the debounce interval time passed from the last call of the listener. The default value is an empiric-based interval to provide a natural feeling of the flag behavior.

<details>
  <summary>
    Show an illustration
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
                              ┊◀────────────▶┊                        ┊◀────────────▶┊
                           the debounce interval                   the debounce interval
```

  </blockquote>
</details>

#### `UseWindowedListOptions.onItemsRendered`

```ts
onItemsRendered?: (renderedRange: ListRenderedRange) => void
```

A callback to call when either visible or overscan ranges change. See [`ListRenderedRange`][list-rendered-range] for more details about the ranges.

> 💡 Make sure to memorize the callback otherwise, it will be called not only on the ranges change but on the callback value change as well.

---

### `interface ListRenderedRange`

```ts
export interface ListRenderedRange {
  overscanStart: number
  overscanStop: number
  visibleStart: number
  visibleStop: number
}
```

A collection of values describing two half-open intervals:

1. visible items ∈ `[visibleStart, visibleStop)` partially or entirely visible on the current scroll position
1. overscan items ∈ `[overscanStart, overscanStop)` includes visible items and some additional non-visible defined via [UseWindowedListOptions.overscanCount][use-windowed-list-options.overscan-count] value.

> 💬 Both intervals include the start indexes and exclude end ones, so the resulting index ranges might be iterated by <code>for (let i = start; i < stop; i++)</code>, for instance:
>
> ```ts
> const range: ListRenderedRange = {
>   overscanStart: 15,
>   overscanStop: 21,
>   visibleStart: 16,
>   visibleStop: 20
> }:
> ```
>
> The `range` indicates that elements with indexes `[16, 17, 18, 19]` are visible and `[15, 16, 17, 18, 19, 20]` are overscan.

---

### `interface UseWindowedListResult`

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

The result of the hook call contains necessary information and methods about windowed items.

#### `UseWindowedListResult.startSpace`

```ts
startSpace: number
```

Space in pixels before the first rendered item. It represents either top space for vertical or left space for horizontal [layouts][list-layout]. Take a look at an illustration in the [“Usage"][usage] section.

#### `UseWindowedListResult.endSpace`

```ts
endSpace: number
```

Space in pixels after the last rendered item. It represents either bottom space for vertical or right space for horizontal [layouts][list-layout]. Take a look at an illustration in the [“Usage"][usage] section.

#### `UseWindowedListResult.indexes`

```ts
indexes: ReadonlyArray<number>
```

An array of the list items’ indexes. The range starts from `ListRenderedRange.overscanStart` and ends before `ListRenderedRange.overscanStop`. It’s easy to use the `indexes.map` method to map the indexes to items’ data like in the [“Usage"][usage] example.

#### `UseWindowedListResult.isScrolling`

```ts
isScrolling: boolean
```

A flag indicates whenever the container is scrolling. See the relevant [`UseWindowedListOptions.containerIsScrollingDebounceInterval`][use-windowed-list-options.container-is-scrolling-debounce-interval] option for changing its behavior.

#### `UseWindowedListResult.container`

```ts
container: null | E
```

Either a container’s node extending `HTMLElement` or `null`. The value gets assigned by the [`UseWindowedListResult.setRef`][use-windowed-list-result.set-ref] function.

#### `UseWindowedListResult.setRef`

```ts
setRef: (node: null | E) => void
```

A function to set a container `node` of a windowed list. Each call of `setRef` enqueues a re-render of the component. Because of that, the hook always calculates an output with an actual container. The value is accessible via the [`UseWindowedListResult.container`][use-windowed-list-result.container] property.

#### `UseWindowedListResult.scrollTo`

```ts
scrollTo: (px: number) => void
```

A function to scroll a windowed list to a position in pixels. It affects either `scrollTop` or `scrollLeft` for vertical or horizontal [layouts][list-layout], respectively.

#### `UseWindowedListResult.scrollToItem`

```ts
scrollToItem: (index: number, position?: ScrollPosition = 'auto') => void
```

A function to scroll a windowed list to a `position` of an element by `index`. It affects either `scrollTop` or `scrollLeft` for vertical or horizontal [layouts][list-layout], respectively.

---

### `type ListLayout`

A set of available values of [`UseWindowedListOptions.layout`][use-windowed-list-options.layout] option:

- `'vertical'` - the default value indicates up/down scrolling.
- `'horizontal'` - indicates left/right scrolling. See horizontal layout windowed list [example][todo].
- `'horizontal-rtl'` - indicates right/left scrolling. See horizontal right-to-left layout windowed list [example][todo].

> 💡 The layout **does not** set any style properties.

> 💬 The `'horizontal-rtl'` variant is required for correct desired position calculations for [`UseWindowedListResult.scrollTo`][use-windowed-list-result.scroll-to] and [`UseWindowedListResult.scrollToItem`][use-windowed-list-result.scroll-to-item] calls due to an [inconsistent right-to-left browser scrolling position][rtl-scroll-inconsistency] implementation.

---

### `type ScrollPosition`

A set of available values defining a target element when scrolling via [`UseWindowedListOptions.initialScroll`][use-windowed-list-options.initial-scroll] or [`UseWindowedListResult.scrollToItem`][use-windowed-list-result.scroll-to-item].

- `auto` - scroll as little as possible to ensure the item is visible. If the item is already visible, it won’t scroll at all.
  <details>
    <summary>
      Show an illustration
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
   ├─────────────────┤     ▶    ┗┿━━━━━━━━━━━━━━━━━┿┛    ▶    ┃├─────────────────┤┃
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

                                                                      3 ▼ no change

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
   ├─────────────────┤     ◀    ┃├─────────────────┤┃    ◀    ┃├─────────────────┤┃
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
   ├─────────────────┤     ▶     ├─────────────────┤     ▶     ├─────────────────┤
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

                                                                      3 ▼ no change

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
  ┗┿━━━━━━━━━━━━━━━━━┿┛    ◀    ┗┿━━━━━━━━━━━━━━━━━┿┛    ◀     ├─────────────────┤
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

- `smart` - if the item is already visible, don’t scroll at all. If it is less than one viewport away, scroll as little as possible that it becomes visible (the same as `auto`). If it is more than one viewport away, scroll until it is in the center within the list (the same as `center`).
  <details>
    <summary>
      Show an illustration
    </summary>

    <blockquote>

  ```
  1. scrolling to 6th that is closer than one viewport - scroll as little as possible
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
  ┃│ #3              │┃    ▶     │ #3              │           │ #3              │
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
   │                 │     ▼    ┃│                 │┃    ▶     │                 │
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

                                                                    12 ▼ no change
  3. scrolling to 12th that is already visible - no scroll needed
  4. scrolling to 3th that is farther than one viewport - scroll to center the 3rd item
  5. scrolling to 0th that is closer than one viewport - scroll as little as possible

  ┏┯━━━━━━━━━━━━━━━━━┯┓ -----    ┌─────────────────┐           ┌─────────────────┐
  ┃│ #0              │┃     ▲    │ #0              │           │ #0              │
  ┃│                 │┃     ┃    │                 │           │                 │
  ┃│                 │┃     ┃    │                 │           │                 │
  ┃├─────────────────┤┃     ┃    ├─────────────────┤           ├─────────────────┤
  ┃│ #1              │┃     ┃    │ #1              │           │ #1              │
  ┃│                 │┃     ┃    │                 │           │                 │
  ┃│                 │┃     --- ┏┿━━━━━━━━━━━━━━━━━┿┓          │                 │
  ┃├─────────────────┤┃     0   ┃├─────────────────┤┃          ├─────────────────┤
  ┃│ #2              │┃     ◀   ┃│ #2              │┃          │ #2              │
  ┃│                 │┃         ┃│                 │┃    3     │                 │
  ┃│                 │┃         ┃│                 │┃    ◀     │                 │
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

- `start` - align the item to the beginning of the list (the top for vertical lists or the left for horizontal lists).
  <details>
    <summary>
      Show an illustration
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
   ├─────────────────┤     ▶    ┃├─────────────────┤┃    ▶     ├─────────────────┤
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

                                                                      3 ▼

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
   ├─────────────────┤     ◀    ┃├─────────────────┤┃    ◀    ┃├─────────────────┤┃
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
      Show an illustration
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
   ├─────────────────┤     ▶    ┃├─────────────────┤┃    ▶    ┃├─────────────────┤┃
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

                                                                      6 ▼

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
   ├─────────────────┤     ◀    ┃├─────────────────┤┃    ◀     ├─────────────────┤
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

- `end` - align the item to the end of the list (the bottom for vertical lists or the right for horizontal lists).
  <details>
    <summary>
      Show an illustration
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
   ├─────────────────┤     ▶    ┗┷━━━━━━━━━━━━━━━━━┷┛    ◀    ┃├─────────────────┤┃
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

                                                                       7 ▼

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
   ├─────────────────┤     ◀    ┗┷━━━━━━━━━━━━━━━━━┷┛    ◀     ├─────────────────┤
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

<!-- L I N K S -->

[todo]: #i-am-sorry-it-is-not-done-yet
[usage]: #usage
[use-windowed-list-options.item-size]: #usewindowedlistoptionsitemsize
[use-windowed-list-options.container-size]: #usewindowedlistoptionscontainersize
[use-windowed-list-options.overscan-count]: #usewindowedlistoptionsoverscancount
[use-windowed-list-options.initial-scroll]: #usewindowedlistoptionsinitialscroll
[use-windowed-list-options.layout]: #usewindowedlistoptionslayout
[use-windowed-list-options.container-is-scrolling-debounce-interval]: #usewindowedlistoptionscontainerisscrollingdebounceinterval
[use-windowed-list-result.container]: #usewindowedlistresultcontainer
[use-windowed-list-result.scroll-to]: #usewindowedlistresultscrollto
[use-windowed-list-result.scroll-to-item]: #usewindowedlistresultscrolltoitem
[use-windowed-list-result.set-ref]: #usewindowedlistresultsetref
[use-windowed-list-result.is-scrolling]: #usewindowedlistresultisscrolling
[list-layout]: #type-listlayout
[scroll-position]: #type-scrollposition
[list-rendered-range]: #interface-listrenderedrange
[rtl-scroll-inconsistency]: https://stackoverflow.com/q/24276619/4582383
[npm:use-size-react]: https://www.npmjs.com/search?q=use%20size%20react
