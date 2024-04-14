import React, { ComponentProps } from 'react'
import { HexPath } from './HexPath'
import { Board } from './game-logic/Board'

const bgImage = new URL('/src/images/Aghon.jpeg', import.meta.url)
const blockImage = new URL('/src/images/block.png', import.meta.url)

const MAGIC_OFFSET_VALUE_X = 25
const MAGIC_OFFSET_VALUE_Y = 43.3

const HEX_WIDTH = 75
const HEX_HEIGHT = 86.6

export interface ExplorerMapProps extends ComponentProps<'svg'> {
  board: Board
}

export const ExplorerMap = ({ className = '', board, ...props }: ExplorerMapProps) => {
  const [dimX, dimY] = board.dimensions

  return (
    <svg
      viewBox={`0 0 ${dimX * HEX_WIDTH + MAGIC_OFFSET_VALUE_X} ${dimY * HEX_HEIGHT + MAGIC_OFFSET_VALUE_Y}`}
      className={`${className} max-h-full w-full max-w-full`}
      {...props}
    >
      <defs>
        <pattern id="block-pattern" patternUnits="objectBoundingBox" width="50" height="50">
          <image href={blockImage.href} x="23" y="21" width="50" height="50" />
        </pattern>
      </defs>
      {board.hexes.map((cols, colId) =>
        cols.map(
          (hex, rowId) =>
            hex && (
              <HexPath
                hex={hex}
                key={`${rowId}-${colId}`}
                id={`${rowId}-${colId}`}
                y={HEX_HEIGHT * rowId + (colId % 2 === 0 ? MAGIC_OFFSET_VALUE_Y : 0)}
                x={HEX_WIDTH * colId + MAGIC_OFFSET_VALUE_X}
                onClick={() => {
                  hex.explore()
                  console.log(hex)
                }}
              />
            ),
        ),
      )}
    </svg>
  )
}
