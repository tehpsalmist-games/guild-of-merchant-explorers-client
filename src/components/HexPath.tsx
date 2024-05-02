import React, { ComponentProps } from 'react'
import { Hex } from '../game-logic/Board'
import clsx from 'clsx'
import { useGameState } from '../hooks/useGameState'
import {
  blockImage,
  towerImage,
  villageImage,
  treasureChestImage,
  crystalImage,
  tradingPostGrass,
  tradingPostMountain,
  tradingPostSand,
} from '../images'
import { UseFloatingOptions, autoUpdate, offset, size, useFloating } from '@floating-ui/react-dom'
import { createPortal } from 'react-dom'
import { useMergeRefs } from '@floating-ui/react'

const floatingOptions = (sizeRatio: number): UseFloatingOptions => ({
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
        elements.floating.style.width = `${rects.reference.width * sizeRatio}px`
      },
    }),
  ],
})

export interface HexProps extends ComponentProps<'path'> {
  x: number
  y: number
  hex: Hex
}

export const HexPath = ({ className = '', id, x, y, hex, ...props }: HexProps) => {
  const { gameState } = useGameState()

  // show/hide logic for game pieces
  const isVillageCandidate =
    gameState.activePlayer.mode === 'choosing-village' &&
    hex.region === gameState.activePlayer.regionForVillage &&
    hex.isVillageCandidate
  const isTradeRouteCandidate =
    gameState.activePlayer.mode === 'choosing-trade-route' &&
    gameState.activePlayer.connectedTradePosts.includes(hex) &&
    !gameState.activePlayer.chosenRoute.includes(hex)
  const isSelectedTradeRoute =
    gameState.activePlayer.mode === 'choosing-trade-route' && gameState.activePlayer.chosenRoute.includes(hex)
  const isTradeCandidate = gameState.activePlayer.mode === 'trading' && gameState.activePlayer.chosenRoute.includes(hex)
  const showBlock =
    hex.isExplored &&
    !hex.isCity &&
    !hex.isVillage &&
    !isVillageCandidate &&
    !isTradeCandidate &&
    !isTradeRouteCandidate &&
    !isSelectedTradeRoute
  const coverImage = hex.crystalValue
    ? crystalImage
    : hex.isRuin
      ? treasureChestImage
      : hex.isTower
        ? towerImage
        : hex.terrain === 'sand'
          ? tradingPostSand
          : hex.terrain === 'grass'
            ? tradingPostGrass
            : tradingPostMountain

  const handleClick = () => {
    console.log(hex)

    switch (gameState.activePlayer.mode) {
      case 'exploring':
        if (!hex.isExplorable()) return

        return gameState.activePlayer.moveHistory.doMove({ action: 'explore', hex })
      case 'free-exploring':
        if (!hex.isExplorable()) return

        return gameState.activePlayer.moveHistory.doMove({ action: 'freely-explore', hex })
      case 'choosing-village':
        if (!isVillageCandidate) return

        return gameState.activePlayer.moveHistory.doMove({ action: 'choose-village', hex })
      case 'choosing-trade-route':
        if (!isTradeRouteCandidate) return

        return gameState.activePlayer.moveHistory.doMove({ action: 'choose-trade-route', hex })
      case 'trading':
        if (!isTradeCandidate) return

        const tradingHex = gameState.activePlayer.chosenRoute.find((h) => h !== hex)

        if (!tradingHex) return

        return gameState.activePlayer.moveHistory.doMove({
          action: 'cover-tradepost',
          hex,
          tradingHex,
        })
    }
  }

  // floating elements (blocks, towers, covered ruins, etc.)
  const coverSizeRatio = hex.isTower || hex.crystalValue ? 0.5 : hex.isRuin ? 0.7 : 0.9

  const floatingCoverToken = useFloating(floatingOptions(coverSizeRatio))
  const floatingBlock = useFloating(floatingOptions(0.5))
  const floatingVillage = useFloating(floatingOptions(0.5))

  const pathRef = useMergeRefs([
    floatingCoverToken.refs.setReference,
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
          'cursor-pointer hover:fill-red-500/15':
            (gameState.activePlayer.mode === 'exploring' || gameState.activePlayer.mode === 'free-exploring') &&
            hex.isExplorable(),
          'cursor-pointer !fill-blue-500/15 hover:!fill-blue-500/25': isVillageCandidate || isTradeCandidate,
          'cursor-pointer !fill-yellow-500/15 hover:!fill-yellow-500/25': isTradeRouteCandidate,
          'cursor-pointer !fill-green-500/15 hover:!fill-green-500/25': isSelectedTradeRoute,
        })}
        onClick={handleClick}
        {...props}
      />
      {/* Floating Elements */}
      {hex.isCovered &&
        createPortal(
          <img
            ref={floatingCoverToken.refs.setFloating}
            src={coverImage?.href}
            style={floatingCoverToken.floatingStyles}
            onClick={handleClick}
            className="cursor-pointer"
          />,
          document.getElementById('explorer-map')!,
        )}
      {showBlock &&
        createPortal(
          <img
            ref={floatingBlock.refs.setFloating}
            src={blockImage.href}
            style={{ ...floatingBlock.floatingStyles, filter: 'hue-rotate(120deg) saturate(200%)' }}
            onClick={handleClick}
            className="cursor-pointer"
          />,
          document.getElementById('explorer-map')!,
        )}
      {hex.isVillage &&
        createPortal(
          <img
            ref={floatingVillage.refs.setFloating}
            src={villageImage.href}
            style={{ ...floatingVillage.floatingStyles, filter: 'hue-rotate(120deg) saturate(200%)' }}
            onClick={handleClick}
            className="cursor-pointer"
          />,
          document.getElementById('explorer-map')!,
        )}
    </>
  )
}
