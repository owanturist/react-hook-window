/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from 'react'

export const useRefCallback = <T extends (...args: Array<any>) => any>(
  callback: T,
  deps: ReadonlyArray<any>
): T => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
    // custom hook with deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return useRef(((...args) => callbackRef.current(...args)) as T).current
}
