import React, { ComponentProps, useRef } from 'react'
import { HexPath } from './HexPath'
import { useGameState } from './hooks/useGameState'
import { useResizeObserver } from '@8thday/react'

const blockImage = new URL('/src/images/block.png', import.meta.url)

const MAGIC_OFFSET_VALUE_X = 25
const MAGIC_OFFSET_VALUE_Y = 43.3

const HEX_WIDTH = 75
const HEX_HEIGHT = 86.6

export interface ExplorerMapProps extends ComponentProps<'div'> {}

export const ExplorerMap = ({ className = '', ...props }: ExplorerMapProps) => {
  const gameState = useGameState()

  const [dimX, dimY] = gameState.board.dimensions

  const boardRef = useRef<HTMLDivElement>(null)
  const containerRef = useResizeObserver<HTMLDivElement>((e) => {
    if (!boardRef.current) return

    const boardRatio = gameState.board.width / gameState.board.height

    const { width, height } = containerRef.current.getBoundingClientRect()
    const containerRatio = width / height

    if (containerRatio > boardRatio) {
      boardRef.current.style.height = '100%'
      boardRef.current.style.width = 'auto'
    } else {
      boardRef.current.style.height = 'auto'
      boardRef.current.style.width = '100%'
    }
  })

  return (
    <div ref={containerRef} className={`${className} h-full max-h-full w-full max-w-full overflow-hidden`} {...props}>
      <div
        ref={boardRef}
        className="aghon relative mx-auto bg-cover"
        style={{
          backgroundImage: `url(${gameState.board.imageURL})`,
          aspectRatio: `${gameState.board.width}/${gameState.board.height}`,
        }}
      >
        <svg
          viewBox={`0 0 ${dimX * HEX_WIDTH + MAGIC_OFFSET_VALUE_X} ${dimY * HEX_HEIGHT + MAGIC_OFFSET_VALUE_Y}`}
          className={`absolute`}
          style={gameState.board.svgStyle}
        >
          <defs>
            <pattern id="block-pattern" patternUnits="objectBoundingBox" width="50" height="50">
              <image href={blockImage.href} x="23" y="21" width="50" height="50" />
            </pattern>
          </defs>
          {gameState.board.hexes.map((cols, colId) =>
            cols.map(
              (hex, rowId) =>
                hex && (
                  <HexPath
                    hex={hex}
                    key={`${rowId}-${colId}`}
                    id={`${rowId}-${colId}`}
                    y={HEX_HEIGHT * rowId + (colId % 2 === 0 ? MAGIC_OFFSET_VALUE_Y : 0)}
                    x={HEX_WIDTH * colId + MAGIC_OFFSET_VALUE_X}
                  />
                ),
            ),
          )}
        </svg>
      </div>
    </div>
  )
}
