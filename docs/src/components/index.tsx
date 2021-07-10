import React from 'react'
import styles from './styles.module.css'

export const Container = React.forwardRef<
  HTMLDivElement,
  {
    width?: number
    height?: number
  }
>(({ width, height, ...props }, ref) => (
  <div
    ref={ref}
    className={styles.container}
    style={{ width, height }}
    {...props}
  />
))

export const Item: React.FC<{
  width?: number
  height?: number
}> = ({ width, height, ...props }) => (
  <div className={styles.item} style={{ width, height }} {...props} />
)
