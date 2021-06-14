import { useEffect } from 'react'

const createObserver = (): ((
  handler: (node: Element) => void,
  node: null | Element
) => void) => {
  const handlers = new WeakMap<Element, (node: Element) => void>()
  const obs = new ResizeObserver(entities => {
    for (const { target } of entities) {
      const handler = handlers.get(target)

      if (handler != null) {
        handler(target)
      }
    }
  })

  return (handler, node) => {
    useEffect(() => {
      if (node == null) {
        return
      }

      obs.observe(node)

      return () => {
        obs.unobserve(node)
      }
    }, [node])

    useEffect(() => {
      if (node == null) {
        return
      }

      handlers.set(node, handler)

      return () => {
        handlers.delete(node)
      }
    }, [node, handler])
  }
}

export const useResizeObserver = createObserver()
