import { useRef, useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useRefCallback = <T extends (...args: Array<any>) => any>(
  callback: T
): T => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  })

  return useRef(((...args) => callbackRef.current(...args)) as T).current
}
