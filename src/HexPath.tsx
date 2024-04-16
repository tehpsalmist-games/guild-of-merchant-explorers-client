import React, { ComponentProps } from 'react'
import { Hex } from './game-logic/Board'
import clsx from 'clsx'

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
      className={clsx(
        className,
        hex.isExplored ? 'fill-[url(#block-pattern)]' : 'fill-transparent',
        hex.isExplorable() && 'cursor-pointer hover:fill-red-500/15',
      )}
      onClick={() => {
        if (!hex.isExplorable()) return

        hex.explore()
        console.log(hex)
      }}
      {...props}
    />
  )
}
