import { clamp, positive } from './helpers'

export abstract class ListBoundaries {
  public abstract readonly start: number
  public abstract readonly stop: number

  public static replace(
    prev: ListBoundaries,
    next: ListBoundaries
  ): ListBoundaries {
    if (prev.start === next.start && prev.stop === next.stop) {
      return prev
    }

    return next
  }

  // checks if scroll position is much further than current boundaries
  // and if so assume accurate boundaries based on previous distance
  public static limitOverScroll(
    boundaries: ListBoundaries,
    itemCount: number
  ): ListBoundaries {
    if (boundaries.start > itemCount && boundaries.stop > itemCount) {
      const start = itemCount - (boundaries.stop - boundaries.start)

      return {
        start: positive(start),
        stop: itemCount
      }
    }

    return ListBoundaries.limit(boundaries, itemCount)
  }

  public static limit(
    { start, stop }: ListBoundaries,
    itemCount: number,
    overscanCount = 0
  ): ListBoundaries {
    return {
      start: clamp(0, start - overscanCount, itemCount),
      stop: clamp(start, stop + overscanCount, itemCount)
    }
  }
}
