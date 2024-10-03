import React, { ComponentProps, useRef } from 'react'
import { HexPath } from './HexPath'
import { useGameState } from '../hooks/useGameState'
import { useResizeObserver } from '@8thday/react'
import { EraCards } from './EraCards'
import { plankPanelHorizontal } from '../images'
import { Player } from '../game-logic/GameState'
import clsx from 'clsx'
import { ExplorerBlock } from './ExplorerBlock'

const MAGIC_OFFSET_VALUE_X = 25
const MAGIC_OFFSET_VALUE_Y = 43.3

const HEX_WIDTH = 75
const HEX_HEIGHT = 86.6

export interface ExplorerMapProps extends ComponentProps<'div'> {
  player: Player
  isActive: boolean
}

export const ExplorerMap = ({ className = '', player, isActive, ...props }: ExplorerMapProps) => {
  const [dimX, dimY] = player.board.dimensions

  const boardRef = useRef<HTMLDivElement>(null)
  const containerRef = useResizeObserver<HTMLDivElement>((e) => {
    if (!boardRef.current) return

    const boardRatio = player.board.width / player.board.height

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
    <div
      ref={containerRef}
      className={clsx(className, `relative h-full max-h-full w-full max-w-full overflow-hidden bg-left bg-repeat-y`, {
        'opacity-70': !isActive,
      })}
      style={{ backgroundImage: `url(${plankPanelHorizontal.href})` }}
      {...props}
    >
      <div
        id={`explorer-map-${player.id.toLowerCase()}`}
        ref={boardRef}
        className="relative mx-auto bg-cover"
        style={{
          backgroundImage: `url(${player.board.imageURL})`,
          aspectRatio: `${player.board.width}/${player.board.height}`,
        }}
      >
        <svg
          viewBox={`0 0 ${dimX * HEX_WIDTH + MAGIC_OFFSET_VALUE_X} ${dimY * HEX_HEIGHT + MAGIC_OFFSET_VALUE_Y}`}
          className={`absolute`}
          style={player.board.svgStyle}
        >
          {player.board.hexes.map((cols, colId) =>
            cols.map(
              (hex, rowId) =>
                hex && (
                  <HexPath
                    player={player}
                    isActive={isActive}
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
        <EraCards player={player} />
      </div>
      <span className="text-shadow-lg absolute right-[5%] top-[5%] font-bold text-primary-500 shadow-white sm:text-lg md:text-4xl">
        {player.id} <ExplorerBlock color={player.color} className="inline h-8" />
      </span>
    </div>
  )
}
