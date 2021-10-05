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

Consider a social network feed like one on Instagram, Facebook, YouTube, etc. That case is an infinite loading list, where an application can always render a loading placeholder while the next page is loading. As soon as the loading placeholder becomes visible, the app starts the next page loading.

<details>
  <summary>
    Show an infinite loading illustration.
  </summary>

  <blockquote>

Consider page size equals to 3 items.

```
                    load first page       ▶         scroll down         ▶       load next page        ▶         scroll down         ▶       load next page
┏┯━━━━━━━━━━━━━━━━━━━━━┯┓     ┏┯━━━━━━━━━━━━━━━━━━━━━┯┓      ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
┃│       LOADING       │┃     ┃│ #0                  │┃      │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │
┃│   PLACEHOLDER       │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │
┃└─────────────────────┘┃     ┃├─────────────────────┤┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      ├─────────────────────┤       ├─────────────────────┤
┃                       ┃     ┃│ #1                  │┃     ┃│ #1                  │┃     ┃│ #1                  │┃      │ #1                  │       │ #1                  │
┃                       ┃     ┃│                     │┃     ┃│                     │┃     ┃│                     │┃      │                     │       │                     │
┃                       ┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤
┃                       ┃     ┃│ #2                  │┃     ┃│ #2                  │┃     ┃│ #2                  │┃      │ #2                  │       │ #2                  │
┗━━━━━━━━━━━━━━━━━━━━━━━┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓
                               ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
                               │       LOADING       │      ┃│       LOADING       │┃     ┃│ #3                  │┃     ┃│ #3                  │┃     ┃│ #3                  │┃
                               │     PLACEHOLDER     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃     ┃│                     │┃
                               └─────────────────────┘       └─────────────────────┘      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
                                                                                          ┃│ #4                  │┃     ┃│ #4                  │┃     ┃│ #4                  │┃
                                                                                          ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃
                                                                                           ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
                                                                                           │ #5                  │      ┃│ #5                  │┃     ┃│ #5                  │┃
                                                                                           │                     │      ┃│                     │┃     ┃│                     │┃
                                                                                           ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
                                                                                           │       LOADING       │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛
                                                                                           │     PLACEHOLDER     │       │     PLACEHOLDER     │       │                     │
                                                                                           └─────────────────────┘       └─────────────────────┘       ├─────────────────────┤
                                                                                                                                                       │ #7                  │
                                                                                                                                                       │                     │
                                                                                                                                                       ├─────────────────────┤
                                                                                                                                                       │ #8                  │
                                                                                                                                                       │                     │
                                                                                                                                                       ├─────────────────────┤
                                                                                                                                                       │       LOADING       │
                                                                                                                                                       │     PLACEHOLDER     │
                                                                                                                                                       └─────────────────────┘
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
                    load first page       ▶         scroll down         ▶       load next page        ▶         scroll down         ▶       load next page
┏┯━━━━━━━━━━━━━━━━━━━━━┯┓     ┏┯━━━━━━━━━━━━━━━━━━━━━┯┓      ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
┃│       LOADING       │┃     ┃│ #0                  │┃      │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │
┃│     PLACEHOLDER     │┃     ┃│                     │┃      │ #0.size             │       │ #0.size             │       │ #0.size +           │       │ #0.size +           │
┃└─────────────────────┘┃     ┃├─────────────────────┤┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      │ #1.size             │       │ #1.size             │
┃                       ┃     ┃│ #1                  │┃     ┃│ #1                  │┃     ┃│ #1                  │┃      │                     │       │                     │
┃                       ┃     ┃│                     │┃     ┃│                     │┃     ┃│                     │┃      │                     │       │                     │
┃                       ┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤
┃                       ┃     ┃│ #2                  │┃     ┃│ #2                  │┃     ┃│ #2                  │┃      │ #2                  │       │ #2                  │
┗━━━━━━━━━━━━━━━━━━━━━━━┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓
                               ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
                               │ end space =         │      ┃│       LOADING       │┃     ┃│ #3                  │┃     ┃│ #3                  │┃     ┃│ #3                  │┃
                               │ loading.size        │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃     ┃│                     │┃
                               └─────────────────────┘       └─────────────────────┘      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
                                                                                          ┃│ #4                  │┃     ┃│ #4                  │┃     ┃│ #4                  │┃
                                                                                          ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃
                                                                                           ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
                                                                                           │ end space =         │      ┃│ #5                  │┃     ┃│ #5                  │┃
                                                                                           │ #5.size +           │      ┃│                     │┃     ┃│                     │┃
                                                                                           │ loading.size        │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
                                                                                           │                     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛
                                                                                           │                     │       │     PLACEHOLDER     │       │                     │
                                                                                           └─────────────────────┘       └─────────────────────┘       ├─────────────────────┤
                                                                                                                                                       │ end space =         │
                                                                                                                                                       │ #7.size +           │
                                                                                                                                                       │ #8.size +           │
                                                                                                                                                       │ loading.size        │
                                                                                                                                                       │                     │
                                                                                                                                                       │                     │
                                                                                                                                                       │                     │
                                                                                                                                                       │                     │
                                                                                                                                                       └─────────────────────┘
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

Consider page size equals to 3 items with total count of 15 items.

```
                    load first page       ▶         scroll down         ▶      load second page       ▶       scroll down far       ▶       load third page       ▶       load fourth page      ▶         scroll down         ▶       load fifth page
┏┯━━━━━━━━━━━━━━━━━━━━━┯┓     ┏┯━━━━━━━━━━━━━━━━━━━━━┯┓      ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
┃│ #0    LOADING       │┃     ┃│ #0                  │┃      │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │
┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
┃│ #1    LOADING       │┃     ┃│ #1                  │┃      │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │
┃│     PLACEHOLDER     │┃     ┃│                     │┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      │                     │       │                     │       │                     │       │                     │       │                     │
┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
┃│ #2    LOADING       │┃     ┃│ #2                  │┃     ┃│ #2                  │┃     ┃│ #2                  │┃      │ #2                  │       │ #2                  │       │ #2                  │       │ #2                  │       │ #2                  │
┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #3    LOADING       │       │ #3    LOADING       │      ┃│ #3    LOADING       │┃     ┃│ #3                  │┃      │ #3                  │       │ #3                  │       │ #3                  │       │ #3                  │       │ #3                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #4    LOADING       │       │ #4    LOADING       │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛      │ #4                  │       │ #4                  │       │ #4                  │       │ #4                  │       │ #4                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #5    LOADING       │       │ #5    LOADING       │       │ #5    LOADING       │       │ #5                  │       │ #5                  │       │ #5                  │       │ #5                  │       │ #5                  │       │ #5                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #6    LOADING       │       │ #6    LOADING       │       │ #6    LOADING       │       │ #6    LOADING       │       │ #6    LOADING       │       │ #6                  │       │ #6                  │       │ #6                  │       │ #6                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #7    LOADING       │       │ #7    LOADING       │       │ #7    LOADING       │       │ #7    LOADING       │       │ #7    LOADING       │       │ #7                  │       │ #7                  │       │ #7                  │       │ #7                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #8    LOADING       │       │ #8    LOADING       │       │ #8    LOADING       │       │ #8    LOADING       │       │ #8    LOADING       │       │ #8                  │       │ #8                  │       │ #8                  │       │ #8                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      ├─────────────────────┤       ├─────────────────────┤
 │ #9    LOADING       │       │ #9    LOADING       │       │ #9    LOADING       │       │ #9    LOADING       │      ┃│ #9    LOADING       │┃     ┃│ #9    LOADING       │┃     ┃│ #9                  │┃      │ #9                  │       │ #9                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤
 │ #10   LOADING       │       │ #10   LOADING       │       │ #10   LOADING       │       │ #10   LOADING       │      ┃│ #10   LOADING       │┃     ┃│ #10   LOADING       │┃     ┃│ #10                 │┃      │ #10                 │       │ #10                 │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓
 │ #11   LOADING       │       │ #11   LOADING       │       │ #11   LOADING       │       │ #11   LOADING       │      ┃│ #11   LOADING       │┃     ┃│ #11   LOADING       │┃     ┃│ #11                 │┃     ┃│ #11                 │┃     ┃│ #11                 │┃
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
 │ #12   LOADING       │       │ #12   LOADING       │       │ #12   LOADING       │       │ #12   LOADING       │       │ #12   LOADING       │       │ #12   LOADING       │       │ #12   LOADING       │      ┃│ #12   LOADING       │┃     ┃│ #12                 │┃
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
 │ #13   LOADING       │       │ #13   LOADING       │       │ #13   LOADING       │       │ #13   LOADING       │       │ #13   LOADING       │       │ #13   LOADING       │       │ #13   LOADING       │      ┃│ #13   LOADING       │┃     ┃│ #13                 │┃
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14                 │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │                     │
 └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘
```

  </blockquote>
</details>

Let's implement the `SearchResult` windowed component with finite items loading. Here is a [live demo][todo] with [source code][todo].

<details>
  <summary>
    Show a windowed finite loading illustration.
  </summary>

  <blockquote>

Consider page size equals to 3 items with total count of 15 items and [`UseWindowedListOptions.overscanCount`][use-windowed-list-options.overscan-count] equals 0.

Compare it with the "finite loading illustration" above to get more insights.

```
                    load first page       ▶         scroll down         ▶      load second page       ▶       scroll down far       ▶       load third page       ▶       load fourth page      ▶         scroll down         ▶       load fifth page
┏┯━━━━━━━━━━━━━━━━━━━━━┯┓     ┏┯━━━━━━━━━━━━━━━━━━━━━┯┓      ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
┃│ #0    LOADING       │┃     ┃│ #0                  │┃      │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │
┃│     PLACEHOLDER     │┃     ┃│                     │┃      │ #0.size             │       │ #0.size             │       │ #0.size +           │       │ #0.size +           │       │ #0.size +           │       │ #0.size +           │       │ #0.size +           │
┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       │ #1.size +           │       │ #1.size +           │       │ #1.size +           │       │ #1.size +           │       │ #1.size +           │
┃│ #1    LOADING       │┃     ┃│ #1                  │┃      │ #1                  │       │ #1                  │       │ #2.size +           │       │ #2.size +           │       │ #2.size +           │       │ #2.size +           │       │ #2.size +           │
┃│     PLACEHOLDER     │┃     ┃│                     │┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      │ #3.size +           │       │ #3.size +           │       │ #3.size +           │       │ #3.size +           │       │ #3.size +           │
┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │ #4.size +           │       │ #4.size +           │       │ #4.size +           │       │ #4.size +           │       │ #4.size +           │
┃│ #2    LOADING       │┃     ┃│ #2                  │┃     ┃│ #2                  │┃     ┃│ #2                  │┃      │ #5.size +           │       │ #5.size +           │       │ #5.size +           │       │ #5.size +           │       │ #5.size +           │
┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃      │ 3 * loading.size    │       │ #6.size +           │       │ #6.size +           │       │ #6.size +           │       │ #6.size +           │
 ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │                     │       │ #7.size +           │       │ #7.size +           │       │ #7.size +           │       │ #7.size +           │
 │ end space =         │       │ end space =         │      ┃│ #3    LOADING       │┃     ┃│ #3                  │┃      │                     │       │ #8.size             │       │ #8.size             │       │ #8.size +           │       │ #8.size +           │
 │ 12 * loading.size   │       │ 12 * loading.size   │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │ #9.size +           │       │ #9.size +           │
 │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │                     │       │                     │       │                     │       │ #10.size            │       │ #10.size            │
 │                     │       │                     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛      │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │     PLACEHOLDER     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       ├─────────────────────┤       ├─────────────────────┤       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │ end space =         │       │ end space =         │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │ 10 * loading.size   │       │ #5.size +           │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │ 9 * loading.size    │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃│ #9    LOADING       │┃     ┃│ #9    LOADING       │┃     ┃│ #9                  │┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃│     PLACEHOLDER     │┃     ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃│ #10   LOADING       │┃     ┃│ #10   LOADING       │┃     ┃│ #10                 │┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃│     PLACEHOLDER     │┃     ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓
 │                     │       │                     │       │                     │       │                     │      ┃│ #11   LOADING       │┃     ┃│ #11   LOADING       │┃     ┃│ #11                 │┃     ┃│ #11                 │┃     ┃│ #11                 │┃
 │                     │       │                     │       │                     │       │                     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃
 │                     │       │                     │       │                     │       │                     │       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
 │                     │       │                     │       │                     │       │                     │       │ end space =         │       │ end space =         │       │ end space =         │      ┃│ #12   LOADING       │┃     ┃│ #12                 │┃
 │                     │       │                     │       │                     │       │                     │       │ 3 * loading.size    │       │ 3 * loading.size    │       │ 3 * loading.size    │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┃│ #13   LOADING       │┃     ┃│ #13                 │┃
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       ├─────────────────────┤       ├─────────────────────┤
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │ end space =         │       │ end space =         │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │ loading.size        │       │ #14.size            │
 └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘
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

## Range loading usage

The finite loading use case above might be a bit underwhelming for some use cases.

1. The app might not need to load an entire page but only a few items.
2. The app might need to load a far away page.

For both cases, it might be helpful to load a range of items instead of a page. That case is a range loading list, where an application knows a total count of items and can fetch a range of them when a user scrolls to unloaded items. The app might render loading placeholders since the total count is known ahead.

<details>
  <summary>
    Show a range loading illustration.
  </summary>

  <blockquote>

Consider total count of 15 items.

```
                  load items 0, 1, 2      ▶         scroll down         ▶       load items 3, 4       ▶         scroll down         ▶    load items 9, 10, 11     ▶         scroll down         ▶      load items 12, 13      ▶          scroll up          ▶     load items 5, 6, 7      ▶         scroll down         ▶         load item 8         ▶         scroll down         ▶         load item 14
┏┯━━━━━━━━━━━━━━━━━━━━━┯┓     ┏┯━━━━━━━━━━━━━━━━━━━━━┯┓      ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
┃│ #0    LOADING       │┃     ┃│ #0                  │┃      │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │       │ #0                  │
┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
┃│ #1    LOADING       │┃     ┃│ #1                  │┃      │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │       │ #1                  │
┃│     PLACEHOLDER     │┃     ┃│                     │┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
┃│ #2    LOADING       │┃     ┃│ #2                  │┃     ┃│ #2                  │┃     ┃│ #2                  │┃      │ #2                  │       │ #2                  │       │ #2                  │       │ #2                  │       │ #2                  │       │ #2                  │       │ #2                  │       │ #2                  │       │ #2                  │       │ #2                  │
┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #3    LOADING       │       │ #3    LOADING       │      ┃│ #3    LOADING       │┃     ┃│ #3                  │┃      │ #3                  │       │ #3                  │       │ #3                  │       │ #3                  │       │ #3                  │       │ #3                  │       │ #3                  │       │ #3                  │       │ #3                  │       │ #3                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #4    LOADING       │       │ #4    LOADING       │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛      │ #4                  │       │ #4                  │       │ #4                  │       │ #4                  │       │ #4                  │       │ #4                  │       │ #4                  │       │ #4                  │       │ #4                  │       │ #4                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #5    LOADING       │       │ #5    LOADING       │       │ #5    LOADING       │       │ #5    LOADING       │       │ #5    LOADING       │       │ #5    LOADING       │       │ #5    LOADING       │       │ #5    LOADING       │      ┃│ #5    LOADING       │┃     ┃│ #5                  │┃      │ #5                  │       │ #5                  │       │ #5                  │       │ #5                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #6    LOADING       │       │ #6    LOADING       │       │ #6    LOADING       │       │ #6    LOADING       │       │ #6    LOADING       │       │ #6    LOADING       │       │ #6    LOADING       │       │ #6    LOADING       │      ┃│ #6    LOADING       │┃     ┃│ #6                  │┃      │ #6                  │       │ #6                  │       │ #6                  │       │ #6                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      ├─────────────────────┤       ├─────────────────────┤
 │ #7    LOADING       │       │ #7    LOADING       │       │ #7    LOADING       │       │ #7    LOADING       │       │ #7    LOADING       │       │ #7    LOADING       │       │ #7    LOADING       │       │ #7    LOADING       │      ┃│ #7    LOADING       │┃     ┃│ #7                  │┃     ┃│ #7                  │┃     ┃│ #7                  │┃      │ #7                  │       │ #7                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃      │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤
 │ #8    LOADING       │       │ #8    LOADING       │       │ #8    LOADING       │       │ #8    LOADING       │       │ #8    LOADING       │       │ #8    LOADING       │       │ #8    LOADING       │       │ #8    LOADING       │       │ #8    LOADING       │       │ #8    LOADING       │      ┃│ #8    LOADING       │┃     ┃│ #8                  │┃      │ #8                  │       │ #8                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤
 │ #9    LOADING       │       │ #9    LOADING       │       │ #9    LOADING       │       │ #9    LOADING       │      ┃│ #9    LOADING       │┃     ┃│ #9                  │┃      │ #9                  │       │ #9                  │       │ #9                  │       │ #9                  │      ┃│ #9                  │┃     ┃│ #9                  │┃      │ #9                  │       │ #9                  │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛      │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #10   LOADING       │       │ #10   LOADING       │       │ #10   LOADING       │       │ #10   LOADING       │      ┃│ #10   LOADING       │┃     ┃│ #10                 │┃      │ #10                 │       │ #10                 │       │ #10                 │       │ #10                 │       │ #10                 │       │ #10                 │       │ #10                 │       │ #10                 │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #11   LOADING       │       │ #11   LOADING       │       │ #11   LOADING       │       │ #11   LOADING       │      ┃│ #11   LOADING       │┃     ┃│ #11                 │┃     ┃│ #11                 │┃     ┃│ #11                 │┃      │ #11                 │       │ #11                 │       │ #11                 │       │ #11                 │       │ #11                 │       │ #11                 │
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
 │ #12   LOADING       │       │ #12   LOADING       │       │ #12   LOADING       │       │ #12   LOADING       │       │ #12   LOADING       │       │ #12   LOADING       │      ┃│ #12   LOADING       │┃     ┃│ #12                 │┃      │ #12                 │       │ #12                 │       │ #12                 │       │ #12                 │      ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │      ┃│                     │┃     ┃│                     │┃
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
 │ #13   LOADING       │       │ #13   LOADING       │       │ #13   LOADING       │       │ #13   LOADING       │       │ #13   LOADING       │       │ #13   LOADING       │      ┃│ #13   LOADING       │┃     ┃│ #13                 │┃      │ #13                 │       │ #13                 │       │ #13                 │       │ #13                 │      ┃│ #13                 │┃     ┃│ #13                 │┃
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛      │                     │       │                     │       │                     │       │                     │      ┃│                     │┃     ┃│                     │┃
 ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
 │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │       │ #14   LOADING       │      ┃│ #14   LOADING       │┃     ┃│ #14                 │┃
 │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │       │     PLACEHOLDER     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃
 └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘      ┗┷━━━━━━━━━━━━━━━━━━━━━┷┛     ┗┷━━━━━━━━━━━━━━━━━━━━━┷┛
```

  </blockquote>
</details>

Let's implement the `RangedSearchResult` windowed component with finite items loading. Here is a [live demo][todo] with [source code][todo].

<details>
  <summary>
    Show a windowed range loading illustration.
  </summary>

  <blockquote>

Consider total count of 15 items and [`UseWindowedListOptions.overscanCount`][use-windowed-list-options.overscan-count] equals 0.

Compare it with the "range loading illustration" above to get more insights.

```
                  load items 0, 1, 2      ▶         scroll down         ▶       load items 3, 4       ▶         scroll down         ▶    load items 9, 10, 11     ▶         scroll down         ▶      load items 12, 13      ▶          scroll up          ▶     load items 5, 6, 7      ▶         scroll down         ▶         load item 8         ▶         scroll down         ▶         load item 14
┏┯━━━━━━━━━━━━━━━━━━━━━┯┓     ┏┯━━━━━━━━━━━━━━━━━━━━━┯┓      ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
┃│ #0    LOADING       │┃     ┃│ #0                  │┃      │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │       │ start space =       │
┃│     PLACEHOLDER     │┃     ┃│                     │┃      │ #0.size             │       │ #0.size             │       │ #0.size +           │       │ #0.size +           │       │ #0.size +           │       │ #0.size +           │       │ #0.size +           │       │ #0.size +           │       │ #0.size +           │       │ #0.size +           │       │ #0.size +           │       │ #0.size +           │
┃├─────────────────────┤┃     ┃├─────────────────────┤┃      ├─────────────────────┤       ├─────────────────────┤       │ #1.size +           │       │ #1.size +           │       │ #1.size +           │       │ #1.size +           │       │ #1.size +           │       │ #1.size +           │       │ #1.size +           │       │ #1.size +           │       │ #1.size +           │       │ #1.size +           │
┃│ #1    LOADING       │┃     ┃│ #1                  │┃      │ #1                  │       │ #1                  │       │ #2.size +           │       │ #2.size +           │       │ #2.size +           │       │ #2.size +           │       │ #2.size +           │       │ #2.size +           │       │ #2.size +           │       │ #2.size +           │       │ #2.size +           │       │ #2.size +           │
┃│     PLACEHOLDER     │┃     ┃│                     │┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      │ #3.size +           │       │ #3.size +           │       │ #3.size +           │       │ #3.size +           │       │ #3.size +           │       │ #3.size +           │       │ #3.size +           │       │ #3.size +           │       │ #3.size +           │       │ #3.size +           │
┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │ #4.size +           │       │ #4.size +           │       │ #4.size +           │       │ #4.size +           │       │ #4.size             │       │ #4.size             │       │ #4.size +           │       │ #4.size +           │       │ #4.size +           │       │ #4.size +           │
┃│ #2    LOADING       │┃     ┃│ #2                  │┃     ┃│ #2                  │┃     ┃│ #2                  │┃      │ 4 * loading.size    │       │ 4 * loading.size    │       │ 4 * loading.size +  │       │ 4 * loading.size +  │       │                     │       │                     │       │ #5.size +           │       │ #5.size +           │       │ #5.size +           │       │ #5.size +           │
┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃      │                     │       │                     │       │ #9.size +           │       │ #9.size +           │       │                     │       │                     │       │ #6.size             │       │ #6.size             │       │ #6.size +           │       │ #6.size +           │
 ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │                     │       │                     │       │ #10.size            │       │ #10.size            │       │                     │       │                     │       │                     │       │                     │       │ #7.size +           │       │ #7.size +           │
 │ end space =         │       │ end space =         │      ┃│ #3    LOADING       │┃     ┃│ #3                  │┃      │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │ #8.size +           │       │ #8.size +           │
 │ 12 * loading.size   │       │ 12 * loading.size   │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │ #9.size +           │       │ #9.size +           │
 │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │ #10.size +          │       │ #10.size +          │
 │                     │       │                     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛      │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │ #11.size            │       │ #11.size            │
 │                     │       │                     │       │   PLACEHOLDER       │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       ├─────────────────────┤       ├─────────────────────┤       │                     │       │                     │       │                     │       │                     │      ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │ end space =         │       │ end space =         │       │                     │       │                     │       │                     │       │                     │      ┃│ #5    LOADING       │┃     ┃│ #5                  │┃      │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │ 10 * loading.size   │       │ 10 * loading.size   │       │                     │       │                     │       │                     │       │                     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┃│ #6    LOADING       │┃     ┃│ #6                  │┃      │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┃│ #7    LOADING       │┃     ┃│ #7                  │┃     ┃│ #7                  │┃     ┃│ #7                  │┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │ end space =         │       │ end space =         │      ┃│ #8    LOADING       │┃     ┃│ #8                  │┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │ loading.size +      │       │ loading.size +      │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      │                     │       │                     │       │ #8.size +           │       │ #8.size +           │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃│ #9    LOADING       │┃     ┃│ #9                  │┃      │                     │       │                     │       │ #9.size +           │       │ #9.size +           │      ┃│ #9                  │┃     ┃│ #9                  │┃      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │ #10.size +          │       │ #10.size +          │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛      │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │                     │       │                     │       │ #11.size +          │       │ #11.size +          │       ├─────────────────────┤       ├─────────────────────┤       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃│ #10   LOADING       │┃     ┃│ #10                 │┃      │                     │       │                     │       │ #12.size +          │       │ #12.size +          │       │ end space =         │       │ end space =         │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │ #13.size +          │       │ #13.size +          │       │ #10.size +          │       │ #10.size +          │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓      │ loading.size        │       │ loading.size        │       │ #11.size +          │       │ #11.size +          │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┃│ #11   LOADING       │┃     ┃│ #11                 │┃     ┃│ #11                 │┃     ┃│ #11                 │┃      │                     │       │                     │       │ #12.size +          │       │ #12.size +          │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┃│                     │┃     ┃│                     │┃      │                     │       │                     │       │ #13.size +          │       │ #13.size +          │       │                     │       │                     │
 │                     │       │                     │       │                     │       │                     │       ├─────────────────────┤       ├─────────────────────┤      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │                     │       │                     │       │ loading.size        │       │ loading.size        │       ├─────────────────────┤       ├─────────────────────┤
 │                     │       │                     │       │                     │       │                     │       │ end space =         │       │ end space =         │      ┃│ #12   LOADING       │┃     ┃│ #12                 │┃      │                     │       │                     │       │                     │       │                     │      ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓     ┏┿━━━━━━━━━━━━━━━━━━━━━┿┓
 │                     │       │                     │       │                     │       │                     │       │ 3 * loading.size    │       │ 3 * loading.size    │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃      │                     │       │                     │       │                     │       │                     │      ┃│                     │┃     ┃│                     │┃
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃      │                     │       │                     │       │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┃│ #13   LOADING       │┃     ┃│ #13                 │┃      │                     │       │                     │       │                     │       │                     │      ┃│ #13                 │┃     ┃│ #13                 │┃
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │      ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛     ┗┿━━━━━━━━━━━━━━━━━━━━━┿┛      │                     │       │                     │       │                     │       │                     │      ┃│                     │┃     ┃│                     │┃
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       ├─────────────────────┤       ├─────────────────────┤       │                     │       │                     │       │                     │       │                     │      ┃├─────────────────────┤┃     ┃├─────────────────────┤┃
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │ end space =         │       │ end space =         │       │                     │       │                     │       │                     │       │                     │      ┃│ #14   LOADING       │┃     ┃│ #14                 │┃
 │                     │       │                     │       │                     │       │                     │       │                     │       │                     │       │ loading.size        │       │ loading.size        │       │                     │       │                     │       │                     │       │                     │      ┃│     PLACEHOLDER     │┃     ┃│                     │┃
 └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘      ┗┷━━━━━━━━━━━━━━━━━━━━━┷┛     ┗┷━━━━━━━━━━━━━━━━━━━━━┷┛
```

  </blockquote>
</details>

<!-- L I N K S -->

[todo]: #i-am-sorry-it-is-not-done-yet
[use-windowed-list-options.overscan-count]: ../use-windowed-list/README.md#usewindowedlistoptionsoverscancount
