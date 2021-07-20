```ts static
<E extends HTMLElement>(options: UseWindowedListOptions) => UseWindowedListResult<E>
```

The custom `useWindowedList` hook calculates a visible range of items in a given viewport. By rendering only part of large data sets, it might 1) speed up the initial render and 2) reduce memory allocation of not visible DOM nodes.

The hook creates zero additional DOM nodes, meaning that it provides unlimited customization freedom for both style preferenes and tags structure.

### `interface UseWindowedListOptions`

A set of options to configure the windowed list.

#### `UseWindowedListOptions.containerSize`

```tsx { "file": "./use-windowed-list/basic.md.tsx" }

```
