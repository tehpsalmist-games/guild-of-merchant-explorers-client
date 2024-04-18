import React, { ComponentProps, useMemo } from 'react'
import { Hex } from '../game-logic/Board'
import clsx from 'clsx'
import { useGameState } from '../hooks/useGameState'
import { blockImage, towerImage, villageImage, treasureChestImage, crystalImage } from '../images'
import { UseFloatingOptions, autoUpdate, offset, size, useFloating } from '@floating-ui/react-dom'
import { createPortal } from 'react-dom'
import { useMergeRefs } from '@floating-ui/react'

const floatingOptions: UseFloatingOptions = {
  whileElementsMounted: autoUpdate,
  placement: 'bottom',
  middleware: [
    offset(({ rects }) => {
      if (rects.reference.height > rects.floating.height) {
        return { mainAxis: -(rects.floating.height + (rects.reference.height - rects.floating.height) / 2) }
      }

      return -rects.floating.height
    }),
    size({
      apply({ rects, elements }) {
        elements.floating.style.width = `${rects.reference.width / 2}px`
      },
    }),
  ],
}

export interface HexProps extends ComponentProps<'path'> {
  x: number
  y: number
  hex: Hex
}

export const HexPath = ({ className = '', id, x, y, hex, ...props }: HexProps) => {
  const { gameState } = useGameState()

  // show/hide logic for game pieces
  const isVillageCandidate =
    gameState.activePlayer.mode === 'village' &&
    hex.region === gameState.activePlayer.board.regionForVillage &&
    hex.isVillageCandidate
  const showBlock = hex.isExplored && !hex.isCity && !hex.isVillage && !isVillageCandidate
  const coverImage = hex.crystalValue ? crystalImage : hex.isRuin ? treasureChestImage : towerImage

  // floating elements (blocks, towers, covered ruins, etc.)
  const floatingTower = useFloating(floatingOptions)
  const floatingBlock = useFloating(floatingOptions)
  const floatingVillage = useFloating(floatingOptions)
  const pathRef = useMergeRefs([
    floatingTower.refs.setReference,
    floatingBlock.refs.setReference,
    floatingVillage.refs.setReference,
  ])

  return (
    <>
      <path
        ref={pathRef}
        id={id}
        d={`M${x},${y} h50 l25,43.3 l-25,43.3 h-50 l-25,-43.3 z`}
        className={clsx(className, 'fill-transparent', {
          'cursor-pointer hover:fill-red-500/15': gameState.activePlayer.mode === 'exploring' && hex.isExplorable(),
          'cursor-pointer !fill-blue-500/15 hover:!fill-blue-500/25': isVillageCandidate,
        })}
        onClick={() => {
          console.log(hex)

          switch (gameState.activePlayer.mode) {
            case 'exploring':
              if (!hex.isExplorable()) return

              return gameState.activePlayer.moveHistory.doMove({ hex, action: 'explored' })
            case 'village':
              if (!isVillageCandidate) return

              return gameState.activePlayer.moveHistory.doMove({ hex, action: 'village' })
            case 'picking-trade-start':
              return gameState.activePlayer.moveHistory.doMove({ hex, action: 'pick-trade-start' })
            case 'trading':
              return gameState.activePlayer.moveHistory.doMove({ hex, action: 'do-trade' })
          }
        }}
        {...props}
      />
      {/* Floating Elements */}
      {hex.isCovered &&
        createPortal(
          <img ref={floatingTower.refs.setFloating} src={coverImage.href} style={floatingTower.floatingStyles} />,
          document.getElementById('explorer-map')!,
        )}
      {showBlock &&
        createPortal(
          <img
            ref={floatingBlock.refs.setFloating}
            src={blockImage.href}
            style={{ ...floatingBlock.floatingStyles, filter: 'hue-rotate(120deg) saturate(200%)' }}
          />,
          document.getElementById('explorer-map')!,
        )}
      {hex.isVillage &&
        createPortal(
          <img
            ref={floatingVillage.refs.setFloating}
            src={villageImage.href}
            style={{ ...floatingVillage.floatingStyles, filter: 'hue-rotate(120deg) saturate(200%)' }}
          />,
          document.getElementById('explorer-map')!,
        )}
    </>
  )
}
