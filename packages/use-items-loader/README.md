# `use-items-loader`

React hook to manage pagination or infinite loading of a windowed list items.

## Getting started

Install with Yarn:

```bash
yarn add @react-hook-window/use-items-loader
```

Install with NPM:

```bash
npm install @react-hook-window/use-items-loader --save
```

## Infinite loading usage

Consider a social network feed like one in Instagram, Facebook, YouTube, etc. That case is an infinite loading list, where an application can always render a loading placeholder while the next page is loading. As soon as the loading placeholder becomes visible the app starts the next page loading.

<details>
  <summary>
    Show an infinite loading illustration.
  </summary>

  <blockquote>

Consider page size equal to 3 items.

```
┏┯━━━━━━━━━━━━━━━━━━┯┓          ┏┯━━━━━━━━━━━━━━━━━━┯┓           ┌──────────────────┐
┃│     LOADING      │┃          ┃│ #0               │┃           │ #0               │
┃│   PLACEHOLDER    │┃   load   ┃│                  │┃           │                  │
┃└──────────────────┘┃   first  ┃├──────────────────┤┃          ┏┿━━━━━━━━━━━━━━━━━━┿┓
┃                    ┃   page   ┃│ #1               │┃  scroll  ┃│ #1               │┃
┃                    ┃          ┃│                  │┃   down   ┃│                  │┃
┃                    ┃     ▶    ┃├──────────────────┤┃          ┃├──────────────────┤┃
┃                    ┃          ┃│ #2               │┃    ▶     ┃│ #2               │┃
┗━━━━━━━━━━━━━━━━━━━━┛          ┗┿━━━━━━━━━━━━━━━━━━┿┛          ┃│                  │┃
                                 ├──────────────────┤           ┃├──────────────────┤┃
                                 │     LOADING      │           ┃│     LOADING      │┃
                                 │   PLACEHOLDER    │           ┗┿━━━━━━━━━━━━━━━━━━┿┛
                                 └──────────────────┘            └──────────────────┘

╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌   load next page ▼

 ┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
 │ #0               │            │ #0               │            │ #0               │
 │                  │            │                  │            │                  │
 ├──────────────────┤            ├──────────────────┤           ┏┿━━━━━━━━━━━━━━━━━━┿┓
 │ #1               │            │ #1               │           ┃│ #1               │┃
 │                  │            │                  │           ┃│                  │┃
 ├──────────────────┤            ├──────────────────┤           ┃├──────────────────┤┃
 │ #2               │            │ #2               │           ┃│ #2               │┃
┏┿━━━━━━━━━━━━━━━━━━┿┓          ┏┿━━━━━━━━━━━━━━━━━━┿┓  scroll  ┃│                  │┃
┃├──────────────────┤┃          ┃├──────────────────┤┃   down   ┃├──────────────────┤┃
┃│ #3               │┃          ┃│ #3               │┃          ┃│ #3               │┃
┃│                  │┃   load   ┃│                  │┃     ◀    ┃│                  │┃
┃├──────────────────┤┃   next   ┃├──────────────────┤┃          ┃├──────────────────┤┃
┃│ #4               │┃   page   ┃│ #4               │┃          ┃│ #4               │┃
┃│                  │┃          ┃│                  │┃          ┗┿━━━━━━━━━━━━━━━━━━┿┛
┃├──────────────────┤┃    ◀     ┃├──────────────────┤┃           ├──────────────────┤
┃│ #5               │┃          ┃│ #5               │┃           │ #5               │
┃│                  │┃          ┃│                  │┃           │                  │
┃├──────────────────┤┃          ┃├──────────────────┤┃           ├──────────────────┤
┗┿━━━━━━━━━━━━━━━━━━┿┛          ┗┿━━━━━━━━━━━━━━━━━━┿┛           │     LOADING      │
 │ #6               │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            └──────────────────┘            └──────────────────┘
 │ #7               │
 │                  │
 ├──────────────────┤
 │ #8               │
 │                  │
 ├──────────────────┤
 │     LOADING      │
 │   PLACEHOLDER    │
 └──────────────────┘
```

  </blockquote>
</details>

Let's implement the `InfiniteFeed` windowed component with infinite items loading. Here is a [live demo][todo] with [source code][todo].

<details>
  <summary>
    Show a windowed infinite loading illustration.
  </summary>

  <blockquote>

Consider page size equals to 3 items and [`UseWindowedListOptions.overscanCount`][use-windowed-list-options.overscan-count] equals 0.

Compare it with the "infinite loading illustration" above to get more insights.

```
┏┯━━━━━━━━━━━━━━━━━━┯┓          ┏┯━━━━━━━━━━━━━━━━━━┯┓           ┌──────────────────┐
┃│     LOADING      │┃          ┃│ #0               │┃           │ start space =    │
┃│   PLACEHOLDER    │┃   load   ┃│                  │┃           │ #0.size          │
┃└──────────────────┘┃   first  ┃├──────────────────┤┃          ┏┿━━━━━━━━━━━━━━━━━━┿┓
┃                    ┃   page   ┃│ #1               │┃  scroll  ┃│ #1               │┃
┃                    ┃          ┃│                  │┃   down   ┃│                  │┃
┃                    ┃     ▶    ┃├──────────────────┤┃          ┃├──────────────────┤┃
┃                    ┃          ┃│ #2               │┃    ▶     ┃│ #2               │┃
┗━━━━━━━━━━━━━━━━━━━━┛          ┗┿━━━━━━━━━━━━━━━━━━┿┛          ┃│                  │┃
                                 ├──────────────────┤           ┃├──────────────────┤┃
                                 │ end space =      │           ┃│     LOADING      │┃
                                 │ placeholder.size │           ┗┿━━━━━━━━━━━━━━━━━━┿┛
                                 └──────────────────┘            └──────────────────┘

╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌   load next page ▼

 ┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
 │ start space =    │            │ start space =    │            │ start space =    │
 │ #0.size +        │            │ #0.size +        │            │ #0.size          │
 │ #1.size          │            │ #1.size          │           ┏┿━━━━━━━━━━━━━━━━━━┿┓
 │                  │            │                  │           ┃│ #1               │┃
 │                  │            │                  │           ┃│                  │┃
 ├──────────────────┤            ├──────────────────┤           ┃├──────────────────┤┃
 │ #2               │            │ #2               │           ┃│ #2               │┃
┏┿━━━━━━━━━━━━━━━━━━┿┓          ┏┿━━━━━━━━━━━━━━━━━━┿┓  scroll  ┃│                  │┃
┃├──────────────────┤┃          ┃├──────────────────┤┃   down   ┃├──────────────────┤┃
┃│ #3               │┃          ┃│ #3               │┃          ┃│ #3               │┃
┃│                  │┃   load   ┃│                  │┃     ◀    ┃│                  │┃
┃├──────────────────┤┃   next   ┃├──────────────────┤┃          ┃├──────────────────┤┃
┃│ #4               │┃   page   ┃│ #4               │┃          ┃│ #4               │┃
┃│                  │┃          ┃│                  │┃          ┗┿━━━━━━━━━━━━━━━━━━┿┛
┃├──────────────────┤┃    ◀     ┃├──────────────────┤┃           ├──────────────────┤
┃│ #5               │┃          ┃│ #5               │┃           │ end space =      │
┃│                  │┃          ┃│                  │┃           │ #5.size +        │
┃├──────────────────┤┃          ┃├──────────────────┤┃           │ placeholder.size │
┗┿━━━━━━━━━━━━━━━━━━┿┛          ┗┿━━━━━━━━━━━━━━━━━━┿┛           │                  │
 │ #6               │            │   PLACEHOLDER    │            │                  │
 ├──────────────────┤            └──────────────────┘            └──────────────────┘
 │ end space =      │
 │ #7.size +        │
 │ #8.size +        │
 │ placeholder.size │
 │                  │
 │                  │
 │                  │
 │                  │
 └──────────────────┘
```

  </blockquote>
</details>

```tsx
import { useWindowedList } from '@react-hook-window/use-windowed-list'
import {
  LoadingItemsRange,
  useItemsLoader
} from '@react-hook-window/use-items-loader'

interface FeedItem {
  id: string
  content: string
}

const FEED_ITEM_LOADING_PLACEHOLDER_COUNT = 1

export const InfiniteFeed: React.VFC<{
  feedItems: Array<FeedItem>
  loadNextPage(): void
}> = ({ feedItems, loadNextPage }) => {
  const {
    setContainerRef,
    startSpace,
    endSpace,
    indexes,
    isScrolling,
    overscanFromIndex,
    overscanBeforeIndex
  } = useWindowedList({
    containerSize: FEED_CONTAINER_HEIGHT,
    itemSize: FEED_ITEM_HEIGHT,
    // 1. Reserve extra items for the loading placeholders.
    // It might be reasonable to define the value equal to a page size.
    itemCount: feedItems.length + FEED_ITEM_LOADING_PLACEHOLDER_COUNT
  })

  useItemsLoader({
    // 2. Skip the loading while isScrolling
    skip: isScrolling,
    overscanFromIndex,
    overscanBeforeIndex,
    shouldLoadItem: React.useCallback(
      (index: number) => {
        // 3. Items further than feedItems are loading placeholders
        // so they should be loaded.
        return index >= feedItems.length
      },
      [feedItems.length]
    ),
    loadItemsRange: React.useCallback(
      (_range: LoadingItemsRange) => {
        // 4. Just load the next page ignoring loading items range.
        loadNextPage()
      },
      [loadNextPage]
    )
  })

  return (
    <div
      ref={setContainerRef}
      className="container"
      style={{
        overflow: 'auto',
        height: FEED_CONTAINER_HEIGHT
      }}
    >
      <div style={{ height: startSpace }} />

      {indexes.map(index => {
        // 5. Render as many placeholders as reserved.
        if (index >= feedItems.length) {
          return (
            <div
              key={`placeholder-${index}`}
              className="box"
              style={{ height: FEED_ITEM_HEIGHT }}
            >
              LOADING PLACEHOLDER
            </div>
          )
        }

        const feedItem = feedItems[index]

        return (
          <div
            key={feedItem.id}
            className="box"
            style={{ height: FEED_ITEM_HEIGHT }}
          >
            {feedItem.content}
          </div>
        )
      })}

      <div style={{ height: endSpace }} />
    </div>
  )
}
```

<!-- L I N K S -->

[todo]: #i-am-sorry-it-is-not-done-yet
[use-windowed-list-options.overscan-count]: ../use-windowed-list/README.md#usewindowedlistoptionsoverscancount
