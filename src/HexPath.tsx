import React, { ComponentProps } from 'react'
import { Hex } from './game-logic/Board'
import clsx from 'clsx'
import { useGameState } from './hooks/useGameState'

export interface HexProps extends ComponentProps<'path'> {
  x: number
  y: number
  hex: Hex
}

export const HexPath = ({ className = '', id, x, y, hex, ...props }: HexProps) => {
  const gameState = useGameState()

  const showBlock = hex.isExplored && !hex.isCity
  const visuallyBlank = !hex.isExplored || hex.isCity

  const isVillageCandidate =
    gameState.mode === 'village' && hex.region === gameState.regionForVillage && hex.isVillageCandidate

  return (
    <path
      id={id}
      d={`M${x},${y} h50 l25,43.3 l-25,43.3 h-50 l-25,-43.3 z`}
      className={clsx(className, {
        'cursor-pointer hover:fill-red-500/15': gameState.mode === 'exploring' && hex.isExplorable(),
        'fill-[url(#block-pattern)]': showBlock,
        'fill-transparent': visuallyBlank,
        'cursor-pointer fill-blue-500/15 hover:fill-blue-500/25': isVillageCandidate,
        'fill-[url(#village-pattern)]': hex.isVillage,
      })}
      onClick={() => {
        console.log(hex)

        switch (gameState.mode) {
          case 'exploring':
            if (!hex.isExplorable()) return

            return gameState.moveHistory.addMove({ hex, action: 'explored' })
          case 'village':
            if (!isVillageCandidate) return

            return gameState.moveHistory.addMove({ hex, action: 'village' })
        }
      }}
      {...props}
    />
  )
}
