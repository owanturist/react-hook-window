import React from 'react'
import { x } from '@xstyled/styled-components'

export const Container = React.forwardRef(
  ({ width, height, ...props }, ref) => (
    <x.div
      ref={ref}
      ring={1}
      ringColor="cool-gray-200"
      fontSize="lg"
      w={width}
      h={height}
      {...props}
    />
  )
)

export const Item = ({ width, height, ...props }) => (
  <x.div
    display="flex"
    alignItems="center"
    justifyContent="center"
    w={width}
    h={height}
    {...props}
  />
)
