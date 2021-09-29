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
┃                    ┃          ┃│                  │┃  down    ┃│                  │┃
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
┃├──────────────────┤┃          ┃├──────────────────┤┃    down  ┃├──────────────────┤┃
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
 │                  │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
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
┃                    ┃          ┃│                  │┃  down    ┃│                  │┃
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
┃├──────────────────┤┃          ┃├──────────────────┤┃    down  ┃├──────────────────┤┃
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
 │                  │            │   PLACEHOLDER    │            │                  │
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

export const InfiniteFeed: React.VFC<{
  feedItemsPlaceholderCount?: number
  feedItems: Array<FeedItem>
  loadNextPage(): void
}> = ({ feedItemsPlaceholderCount = 1, feedItems, loadNextPage }) => {
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
    // It might be reasonable to define the value equal to the loading page size.
    itemCount: feedItems.length + feedItemsPlaceholderCount
  })

  useItemsLoader({
    // 2. Skip the loading while isScrolling
    skip: isScrolling,
    overscanFromIndex,
    overscanBeforeIndex,
    shouldLoadItem: React.useCallback(
      // 3. Items further than feedItems are loading placeholders so they should be loaded.
      (index: number) => index >= feedItems.length,
      [feedItems.length]
    ),
    loadItemsRange: React.useCallback(
      // 4. Just load the next page ignoring loading items range.
      (_range: LoadingItemsRange) => loadNextPage(),
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

## Finite loading (aka pagination) usage

Consider an Internet shop's searching page where resulting items split into pages. That case is a finite loading list, where an application knows a total count of items but loads them page by page when a user scrolls to an unloaded area. The app might render loading placeholders instead of all unloaded items since the total count is known ahead.

<details>
  <summary>
    Show a finite loading illustration.
  </summary>

  <blockquote>

Consider page size equal to 3 items with total count of 15 items.

```
┏┯━━━━━━━━━━━━━━━━━━┯┓          ┏┯━━━━━━━━━━━━━━━━━━┯┓           ┌──────────────────┐
┃│ #0    LOADING    │┃          ┃│ #0               │┃           │ #0               │
┃│   PLACEHOLDER    │┃   load   ┃│                  │┃           │                  │
┃├──────────────────┤┃   first  ┃├──────────────────┤┃  scroll   ├──────────────────┤
┃│ #1    LOADING    │┃   page   ┃│ #1               │┃  one      │ #1               │
┃│   PLACEHOLDER    │┃          ┃│                  │┃  page    ┏┿━━━━━━━━━━━━━━━━━━┿┓
┃├──────────────────┤┃     ▶    ┃├──────────────────┤┃  down    ┃├──────────────────┤┃
┃│ #2    LOADING    │┃          ┃│ #2               │┃          ┃│ #2               │┃
┗┿━━━━━━━━━━━━━━━━━━┿┛          ┗┿━━━━━━━━━━━━━━━━━━┿┛     ▶    ┃│                  │┃
 ├──────────────────┤            ├──────────────────┤           ┃├──────────────────┤┃
 │ #3    LOADING    │            │ #3    LOADING    │           ┃│ #3    LOADING    │┃
 │   PLACEHOLDER    │            │   PLACEHOLDER    │           ┃│   PLACEHOLDER    │┃
 ├──────────────────┤            ├──────────────────┤           ┃├──────────────────┤┃
 │ #4    LOADING    │            │ #4    LOADING    │           ┗┿━━━━━━━━━━━━━━━━━━┿┛
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #5    LOADING    │            │ #5    LOADING    │            │ #5    LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #6    LOADING    │            │ #6    LOADING    │            │ #6    LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #7    LOADING    │            │ #7    LOADING    │            │ #7    LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #8    LOADING    │            │ #8    LOADING    │            │ #8    LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #9    LOADING    │            │ #9    LOADING    │            │ #9    LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #10   LOADING    │            │ #10   LOADING    │            │ #10   LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #11   LOADING    │            │ #11   LOADING    │            │ #11   LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #12   LOADING    │            │ #12   LOADING    │            │ #12   LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #13   LOADING    │            │ #13   LOADING    │            │ #13   LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #14   LOADING    │            │ #14   LOADING    │            │ #14   LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 └──────────────────┘            └──────────────────┘            └──────────────────┘

╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  load second page ▼

 ┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
 │ #0               │            │ #0               │            │ #0               │
 │                  │            │                  │            │                  │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #1               │            │ #1               │            │ #1               │
 │                  │            │                  │           ┏┿━━━━━━━━━━━━━━━━━━┿┓
 ├──────────────────┤            ├──────────────────┤           ┃├──────────────────┤┃
 │ #2               │            │ #2               │           ┃│ #2               │┃
 │                  │            │                  │           ┃│                  │┃
 ├──────────────────┤            ├──────────────────┤           ┃├──────────────────┤┃
 │ #3               │            │ #3               │           ┃│ #3               │┃
 │                  │            │                  │           ┃│                  │┃
 ├──────────────────┤            ├──────────────────┤           ┃├──────────────────┤┃
 │ #4               │            │ #4               │           ┗┿━━━━━━━━━━━━━━━━━━┿┛
 │                  │            │                  │            │                  │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #5               │            │ #5               │            │ #5               │
 │                  │            │                  │            │                  │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #6               │            │ #6    LOADING    │   scroll   │ #6    LOADING    │
 │                  │     load   │   PLACEHOLDER    │      two   │   PLACEHOLDER    │
 ├──────────────────┤    third   ├──────────────────┤    pages   ├──────────────────┤
 │ #7               │     page   │ #7    LOADING    │     down   │ #7    LOADING    │
 │                  │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤      ◀     ├──────────────────┤      ◀     ├──────────────────┤
 │ #8               │            │ #8    LOADING    │            │ #8    LOADING    │
 │                  │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
┏┿━━━━━━━━━━━━━━━━━━┿┓          ┏┿━━━━━━━━━━━━━━━━━━┿┓           ├──────────────────┤
┃│ #9    LOADING    │┃          ┃│ #9    LOADING    │┃           │ #9    LOADING    │
┃│   PLACEHOLDER    │┃          ┃│   PLACEHOLDER    │┃           │   PLACEHOLDER    │
┃├──────────────────┤┃          ┃├──────────────────┤┃           ├──────────────────┤
┃│ #10   LOADING    │┃          ┃│ #10   LOADING    │┃           │ #10   LOADING    │
┃│   PLACEHOLDER    │┃          ┃│   PLACEHOLDER    │┃           │   PLACEHOLDER    │
┃├──────────────────┤┃          ┃├──────────────────┤┃           ├──────────────────┤
┃│ #11   LOADING    │┃          ┃│ #11   LOADING    │┃           │ #11   LOADING    │
┗┿━━━━━━━━━━━━━━━━━━┿┛          ┗┿━━━━━━━━━━━━━━━━━━┿┛           │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #12   LOADING    │            │ #12   LOADING    │            │ #12   LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #13   LOADING    │            │ #13   LOADING    │            │ #13   LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #14   LOADING    │            │ #14   LOADING    │            │ #14   LOADING    │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │   PLACEHOLDER    │
 └──────────────────┘            └──────────────────┘            └──────────────────┘

  load fourth page ▼ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

 ┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
 │ #0               │            │ #0               │            │ #0               │
 │                  │            │                  │            │                  │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #1               │            │ #1               │            │ #1               │
 │                  │            │                  │            │                  │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #2               │            │ #2               │            │ #2               │
 │                  │            │                  │            │                  │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #3               │            │ #3               │            │ #3               │
 │                  │            │                  │            │                  │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #4               │            │ #4               │            │ #4               │
 │                  │            │                  │            │                  │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #5               │            │ #5               │            │ #5               │
 │                  │            │                  │            │                  │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #6               │            │ #6               │            │ #6               │
 │                  │            │                  │            │                  │
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #7               │            │ #7               │            │ #7               │
 │                  │    scroll  │                  │            │                  │
 ├──────────────────┤    one     ├──────────────────┤    load    ├──────────────────┤
 │ #8               │    page    │ #8               │    fifth   │ #8               │
 │                  │    down    │                  │    page    │                  │
┏┿━━━━━━━━━━━━━━━━━━┿┓           ├──────────────────┤            ├──────────────────┤
┃│ #9               │┃     ▶     │ #9               │      ▶     │ #9               │
┃│                  │┃           │                  │            │                  │
┃├──────────────────┤┃           ├──────────────────┤            ├──────────────────┤
┃│ #10              │┃           │ #10              │            │ #10              │
┃│                  │┃           │                  │            │                  │
┃├──────────────────┤┃          ┏┿━━━━━━━━━━━━━━━━━━┿┓          ┏┿━━━━━━━━━━━━━━━━━━┿┓
┃│ #11              │┃          ┃│ #11              │┃          ┃│ #11              │┃
┗┿━━━━━━━━━━━━━━━━━━┿┛          ┃│                  │┃          ┃│                  │┃
 ├──────────────────┤           ┃├──────────────────┤┃          ┃├──────────────────┤┃
 │ #12   LOADING    │           ┃│ #12   LOADING    │┃          ┃│ #12              │┃
 │   PLACEHOLDER    │           ┃│   PLACEHOLDER    │┃          ┃│                  │┃
 ├──────────────────┤           ┃├──────────────────┤┃          ┃├──────────────────┤┃
 │ #13   LOADING    │           ┃│ #13   LOADING    │┃          ┃│ #13              │┃
 │   PLACEHOLDER    │           ┗┿━━━━━━━━━━━━━━━━━━┿┛          ┗┿━━━━━━━━━━━━━━━━━━┿┛
 ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
 │ #14   LOADING    │            │ #14   LOADING    │            │ #14              │
 │   PLACEHOLDER    │            │   PLACEHOLDER    │            │                  │
 └──────────────────┘            └──────────────────┘            └──────────────────┘
```

  </blockquote>
</details>

Let's implement the `SearchResult` windowed component with finite items loading. Here is a [live demo][todo] with [source code][todo].

<details>
  <summary>
    Show a windowed finite loading illustration.
  </summary>

  <blockquote>

Consider page size equal to 3 items with total count of 15 items and [`UseWindowedListOptions.overscanCount`][use-windowed-list-options.overscan-count] equals 0.

Compare it with the "finite loading illustration" above to get more insights.

```
┏┯━━━━━━━━━━━━━━━━━━┯┓          ┏┯━━━━━━━━━━━━━━━━━━┯┓           ┌──────────────────┐
┃│ #0    LOADING    │┃          ┃│ #0               │┃           │ start space =    │
┃│   PLACEHOLDER    │┃   load   ┃│                  │┃           │ #0.size          │
┃├──────────────────┤┃   first  ┃├──────────────────┤┃  scroll   ├──────────────────┤
┃│ #1    LOADING    │┃   page   ┃│ #1               │┃  one      │ #1               │
┃│   PLACEHOLDER    │┃          ┃│                  │┃  page    ┏┿━━━━━━━━━━━━━━━━━━┿┓
┃├──────────────────┤┃     ▶    ┃├──────────────────┤┃  down    ┃├──────────────────┤┃
┃│ #2    LOADING    │┃          ┃│ #2               │┃          ┃│ #2               │┃
┗┿━━━━━━━━━━━━━━━━━━┿┛          ┗┿━━━━━━━━━━━━━━━━━━┿┛     ▶    ┃│                  │┃
 ├──────────────────┤            ├──────────────────┤           ┃├──────────────────┤┃
 │ end space =      │            │ end space =      │           ┃│ #3    LOADING    │┃
 │ 12x              │            │ 12x              │           ┃│   PLACEHOLDER    │┃
 │ placeholder.size │            │ placeholder.size │           ┃├──────────────────┤┃
 │                  │            │                  │           ┗┿━━━━━━━━━━━━━━━━━━┿┛
 │                  │            │                  │            │   PLACEHOLDER    │
 │                  │            │                  │            ├──────────────────┤
 │                  │            │                  │            │ end space =      │
 │                  │            │                  │            │ 10x              │
 │                  │            │                  │            │ placeholder.size │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 └──────────────────┘            └──────────────────┘            └──────────────────┘

╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  load second page ▼

 ┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
 │ start space =    │            │ start space =    │            │ start space =    │
 │ #0.size +        │            │ #0.size +        │            │ #0.size          │
 │ #1.size +        │            │ #1.size +        │            ├──────────────────┤
 │ #2.size +        │            │ #2.size +        │            │ #1               │
 │ #3.size +        │            │ #3.size +        │           ┏┿━━━━━━━━━━━━━━━━━━┿┓
 │ #4.size +        │            │ #4.size +        │           ┃├──────────────────┤┃
 │ #5.size +        │            │ #5.size +        │           ┃│ #2               │┃
 │ #6.size +        │            │ 3x               │           ┃│                  │┃
 │ #7.size +        │            │ placeholder.size │           ┃├──────────────────┤┃
 │ #8.size          │            │                  │           ┃│ #3               │┃
 │                  │            │                  │           ┃│                  │┃
 │                  │            │                  │           ┃├──────────────────┤┃
 │                  │            │                  │           ┗┿━━━━━━━━━━━━━━━━━━┿┛
 │                  │            │                  │            │                  │
 │                  │            │                  │            ├──────────────────┤
 │                  │            │                  │            │ end space =      │
 │                  │            │                  │            │ #5.size +        │
 │                  │            │                  │            │ 9x               │
 │                  │            │                  │   scroll   │ placeholder.size │
 │                  │     load   │                  │      two   │                  │
 │                  │    third   │                  │    pages   │                  │
 │                  │     page   │                  │     down   │                  │
 │                  │            │                  │            │                  │
 │                  │      ◀     │                  │      ◀     │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
┏┿━━━━━━━━━━━━━━━━━━┿┓          ┏┿━━━━━━━━━━━━━━━━━━┿┓           │                  │
┃│ #9    LOADING    │┃          ┃│ #9    LOADING    │┃           │                  │
┃│   PLACEHOLDER    │┃          ┃│   PLACEHOLDER    │┃           │                  │
┃├──────────────────┤┃          ┃├──────────────────┤┃           │                  │
┃│ #10   LOADING    │┃          ┃│ #10   LOADING    │┃           │                  │
┃│   PLACEHOLDER    │┃          ┃│   PLACEHOLDER    │┃           │                  │
┃├──────────────────┤┃          ┃├──────────────────┤┃           │                  │
┃│ #11   LOADING    │┃          ┃│ #11   LOADING    │┃           │                  │
┗┿━━━━━━━━━━━━━━━━━━┿┛          ┗┿━━━━━━━━━━━━━━━━━━┿┛           │                  │
 ├──────────────────┤            ├──────────────────┤            │                  │
 │ end space =      │            │ end space =      │            │                  │
 │ 3x               │            │ 3x               │            │                  │
 │ placeholder.size │            │ placeholder.size │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 └──────────────────┘            └──────────────────┘            └──────────────────┘

  load fourth page ▼ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

 ┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
 │ start space =    │            │ start space =    │            │ start space =    │
 │ #0.size +        │            │ #0.size +        │            │ #0.size +        │
 │ #1.size +        │            │ #1.size +        │            │ #1.size +        │
 │ #2.size +        │            │ #2.size +        │            │ #2.size +        │
 │ #3.size +        │            │ #3.size +        │            │ #3.size +        │
 │ #4.size +        │            │ #4.size +        │            │ #4.size +        │
 │ #5.size +        │            │ #5.size +        │            │ #5.size +        │
 │ #6.size +        │            │ #6.size +        │            │ #6.size +        │
 │ #7.size +        │            │ #7.size +        │            │ #7.size +        │
 │ #8.size          │            │ #8.size +        │            │ #8.size +        │
 │                  │            │ #9.size +        │            │ #9.size +        │
 │                  │            │ #10.size         │            │ #10.size         │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │            │                  │            │                  │
 │                  │    scroll  │                  │            │                  │
 │                  │    one     │                  │    load    │                  │
 │                  │    page    │                  │    fifth   │                  │
 │                  │    down    │                  │    page    │                  │
┏┿━━━━━━━━━━━━━━━━━━┿┓           │                  │            │                  │
┃│ #9               │┃     ▶     │                  │      ▶     │                  │
┃│                  │┃           │                  │            │                  │
┃├──────────────────┤┃           │                  │            │                  │
┃│ #10              │┃           │                  │            │                  │
┃│                  │┃           │                  │            │                  │
┃├──────────────────┤┃          ┏┿━━━━━━━━━━━━━━━━━━┿┓          ┏┿━━━━━━━━━━━━━━━━━━┿┓
┃│ #11              │┃          ┃│ #11              │┃          ┃│ #11              │┃
┗┿━━━━━━━━━━━━━━━━━━┿┛          ┃│                  │┃          ┃│                  │┃
 ├──────────────────┤           ┃├──────────────────┤┃          ┃├──────────────────┤┃
 │ end space =      │           ┃│ #12   LOADING    │┃          ┃│ #12              │┃
 │ 3x               │           ┃│   PLACEHOLDER    │┃          ┃│                  │┃
 │ placeholder.size │           ┃├──────────────────┤┃          ┃├──────────────────┤┃
 │                  │           ┃│ #13   LOADING    │┃          ┃│ #13              │┃
 │                  │           ┗┿━━━━━━━━━━━━━━━━━━┿┛          ┗┿━━━━━━━━━━━━━━━━━━┿┛
 │                  │            ├──────────────────┤            ├──────────────────┤
 │                  │            │ end space =      │            │ end space =      │
 │                  │            │ placeholder.size │            │ #14.size         │
 └──────────────────┘            └──────────────────┘            └──────────────────┘
```

  </blockquote>
</details>

```tsx
import { useWindowedList } from '@react-hook-window/use-windowed-list'
import {
  LoadingItemsRange,
  useItemsLoader
} from '@react-hook-window/use-items-loader'

interface SearchItem {
  id: string
  content: string
}

export const SearchResult: React.VFC<{
  searchItemsTotalCount: number
  searchItems: Array<SearchItem>
  loadNextPage(): void
}> = ({ searchItemsTotalCount, searchItems, loadNextPage }) => {
  const {
    setContainerRef,
    startSpace,
    endSpace,
    indexes,
    isScrolling,
    overscanFromIndex,
    overscanBeforeIndex
  } = useWindowedList({
    containerSize: SEARCH_CONTAINER_HEIGHT,
    itemSize: SEARCH_ITEM_HEIGHT,
    // 1. Pass total count but not searchItems.length
    itemCount: searchItemsTotalCount
  })

  useItemsLoader({
    // 2. Skip the loading while isScrolling
    skip: isScrolling,
    overscanFromIndex,
    overscanBeforeIndex,
    shouldLoadItem: React.useCallback(
      // 3. Items further than searchItems are loading placeholders so they should be loaded.
      (index: number) => index >= searchItems.length,
      [searchItems.length]
    ),
    loadItemsRange: React.useCallback(
      // 4. Just load the next page ignoring loading items range.
      (_range: LoadingItemsRange) => loadNextPage(),
      [loadNextPage]
    )
  })

  return (
    <div
      ref={setContainerRef}
      className="container"
      style={{
        overflow: 'auto',
        height: SEARCH_CONTAINER_HEIGHT
      }}
    >
      <div style={{ height: startSpace }} />

      {indexes.map(index => {
        // 5. Render as many placeholders as needed.
        if (index >= searchItems.length) {
          return (
            <div
              key={`placeholder-${index}`}
              className="box"
              style={{ height: SEARCH_ITEM_HEIGHT }}
            >
              LOADING PLACEHOLDER
            </div>
          )
        }

        const searchItem = searchItems[index]

        return (
          <div
            key={searchItem.id}
            className="box"
            style={{ height: FEED_ITEM_HEIGHT }}
          >
            {searchItem.content}
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
