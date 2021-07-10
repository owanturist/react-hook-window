Here is an usage example.

```jsx
import { useInfiniteLoader } from 'react-hook-window'

const Component = () => {
  const foo = useInfiniteLoader({
    containerSize: 100,
    itemSize: 20,
    itemCount: 100
  })

  return <div>Content</div>
}

;<Component />
```
