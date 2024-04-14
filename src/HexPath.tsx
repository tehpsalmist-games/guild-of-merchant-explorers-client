import React, { ComponentProps } from 'react'
import { Hex } from './game-logic/Board'

export interface HexProps extends ComponentProps<'path'> {
  x: number
  y: number
  hex: Hex
}

export const HexPath = ({ className = '', id, x, y, hex, ...props }: HexProps) => {
  return (
    <path
      id={id}
      d={`M${x},${y} h50 l25,43.3 l-25,43.3 h-50 l-25,-43.3 z`}
      className={`${className} ${hex.isExplored ? 'fill-[url(#block-pattern)]' : 'fill-transparent hover:fill-red-500/15'} cursor-pointer`}
      {...props}
    />
  )
}
