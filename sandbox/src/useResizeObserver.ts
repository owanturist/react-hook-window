import { useRef, useEffect } from 'react'

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
    const handlerRef = useRef(handler)

    useEffect(() => {
      handlerRef.current = handler
    }, [handler])

    useEffect(() => {
      if (node == null) {
        return
      }

      obs.observe(node)
      handlers.set(node, target => handlerRef.current(target))

      return () => {
        obs.unobserve(node)
        handlers.delete(node)
      }
    }, [node])
  }
}

export const useResizeObserver = createObserver()
