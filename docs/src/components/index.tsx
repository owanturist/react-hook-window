import React from 'react'
import styles from './styles.module.css'

export const Container = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{ style?: React.CSSProperties }>
>((props, ref) => <div ref={ref} className={styles.container} {...props} />)

export const Item: React.FC<{ style?: React.CSSProperties }> = props => (
  <div className={styles.item} {...props} />
)
