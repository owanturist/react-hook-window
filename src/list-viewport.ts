import { ListBoundaries } from './list-boundaries'
import { clamp } from './helpers'

export interface ListViewport {
  getSpaceBefore(index: number): number
  getSpaceAfter(index: number): number
  getItemSize(index: number): number
  calcBoundaries(containerSize: number, scrollStart: number): ListBoundaries
}

class FixedSizeListViewport implements ListViewport {
  public constructor(
    private readonly itemSize: number,
    private readonly itemCount: number
  ) {}

  public getSpaceBefore(index: number): number {
    return this.itemSize * index
  }

  public getSpaceAfter(index: number): number {
    const lastIndex = this.itemCount - 1

    if (index >= lastIndex) {
      return 0
    }

    return this.getSpaceBefore(lastIndex) - this.getSpaceBefore(index)
  }

  public getItemSize(): number {
    return this.itemSize
  }

  public calcBoundaries(
    containerSize: number,
    scrollStart: number
  ): ListBoundaries {
    if (this.itemSize <= 0) {
      return { start: 0, stop: 0 }
    }
    const start = clamp(
      0,
      this.itemCount,
      Math.floor(scrollStart / this.itemSize)
    )
    const stop = clamp(
      start,
      this.itemCount,
      Math.ceil((scrollStart + containerSize) / this.itemSize)
    )

    return { start, stop }
  }
}

class VariableSizeListViewport implements ListViewport {
  public constructor(
    private readonly itemsEndPositions: ReadonlyArray<number>
  ) {}

  public getSpaceBefore(index: number): number {
    if (index <= 0) {
      return 0
    }

    return this.itemsEndPositions[Math.min(this.itemCount - 1, index) - 1]
  }

  public getSpaceAfter(index: number): number {
    const lastIndex = this.itemCount - 1

    if (index >= lastIndex) {
      return 0
    }

    return this.itemsEndPositions[lastIndex] - this.itemsEndPositions[index]
  }

  public getItemSize(index: number): number {
    if (index <= 0) {
      return this.itemsEndPositions[0]
    }

    if (index >= this.itemCount) {
      return 0
    }

    return this.itemsEndPositions[index] - this.itemsEndPositions[index - 1]
  }

  public calcBoundaries(
    containerSize: number,
    scrollStart: number
  ): ListBoundaries {
    const start = this.findBoundariesStart(scrollStart)
    const stop = this.findBoundariesStop(scrollStart + containerSize)

    return { start, stop }
  }

  private get itemCount(): number {
    return this.itemsEndPositions.length
  }

  // #TODO use bindary search
  private findBoundariesStart(viewportStart: number): number {
    for (let index = 0; index < this.itemCount; index++) {
      if (this.itemsEndPositions[index] > viewportStart) {
        return index
      }
    }

    return this.itemCount
  }

  // #TODO use bindary search
  private findBoundariesStop(viewportEnd: number): number {
    for (let index = 0; index < this.itemCount; index++) {
      if (this.getSpaceBefore(index) >= viewportEnd) {
        return index
      }
    }

    return this.itemCount
  }

  // #TODO remove
  toString(): string {
    return this.itemsEndPositions.join(' ')
  }
}

export const initListViewport = (
  itemSize: number | ((index: number) => number),
  itemCount: number
): ListViewport => {
  if (typeof itemSize === 'number') {
    return new FixedSizeListViewport(itemSize, itemCount)
  }

  if (itemCount <= 0) {
    return new FixedSizeListViewport(0, 0)
  }

  const itemsEndPositions = new Array<number>(itemCount)

  itemsEndPositions[0] = itemSize(0)

  for (let index = 1; index < itemCount; index++) {
    const prev = itemsEndPositions[index - 1]

    itemsEndPositions[index] = prev + itemSize(index)
  }

  return new VariableSizeListViewport(itemsEndPositions)
}
