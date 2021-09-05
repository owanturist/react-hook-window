import { useRef } from 'react'

export const usePermanent = <T>(init: () => T): T => {
  const valueRef = useRef<null | T>(null)

  if (valueRef.current === null) {
    valueRef.current = init()
  }

  return valueRef.current
}
