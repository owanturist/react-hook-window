export const calcUnloadedRanges = (
  shouldLoad: (index: number) => boolean,
  overscanFromIndex: number,
  overscanBeforeIndex: number
): ReadonlyArray<[number, number]> => {
  const ranges = new Array<[number, number]>(0)

  for (let index = overscanFromIndex; index < overscanBeforeIndex; index++) {
    // skip loaded
    while (shouldLoad(index)) {
      if (++index >= overscanBeforeIndex) {
        return ranges
      }
    }

    const start = index

    // skip unloaded
    while (!shouldLoad(index)) {
      if (++index >= overscanBeforeIndex) {
        ranges.push([start, overscanBeforeIndex])

        return ranges
      }
    }

    ranges.push([start, index])
  }

  return ranges
}
