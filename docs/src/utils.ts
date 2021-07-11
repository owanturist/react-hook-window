export const range = (start: number, end?: number): ReadonlyArray<number> => {
  const [lo, hi] = end == null ? [0, start] : [start, end]
  const N = hi - lo
  const arr = new Array<number>(N)

  for (let index = 0; index < N; index++) {
    arr[index] = lo + index
  }

  return arr
}
