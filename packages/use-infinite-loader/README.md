# `use-infinite-loader`

React hook to manage infinite loading of a windowed list items.

## Getting started

Install with Yarn:

```bash
yarn add @react-hook-window/use-infinite-loader
```

Install with NPM:

```bash
npm install @react-hook-window/use-infinite-loader --save
```

## Usage

Consider an infinite loading list with an unknown items count. You can see such lists in a social network feeds like Instagram, Facebook, YouTube, etc. That case is a literal infinite loader, where an application can pre-render the loading interface while the next chunk is loading.

```tsx
interface UserPost {
  id: string
  title: string
  content: string
}

const FaceTubeFeed: React.VFC<{
  loadNextPage(): void
}> = () => {}
```
