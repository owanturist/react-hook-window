export const noop = (): void => {
  // do nothing
}

export const positive = (x: number): number => Math.max(0, x)

export const clamp = (min: number, max: number, value: number): number => {
  return Math.max(min, Math.min(value, max))
}

export const range = (from: number, to: number): Array<number> => {
  const N = Math.max(0, to - from)
  const acc = new Array<number>(N)

  for (let index = 0; index < N; index++) {
    acc[index] = index + from
  }

  return acc
}

export const onPassiveScroll = (
  node: HTMLElement,
  listener: () => void
): VoidFunction => {
  node.addEventListener('scroll', listener, { passive: true })

  return () => {
    node.removeEventListener('scroll', listener)
  }
}
