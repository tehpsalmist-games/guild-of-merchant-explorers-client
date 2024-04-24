import React, { ComponentProps, useMemo } from 'react'
import { useGameState } from '../hooks/useGameState'
import clsx from 'clsx'

const explorerIds = ['mountain-1', 'sand-2', 'grass-2', 'wild-2', 'water-3', 'era-1', 'era-2', 'era-3', 'era-any']

export interface ExplorerCardMatProps extends ComponentProps<'div'> {}

export const ExplorerCardMat = ({ className = '', ...props }: ExplorerCardMatProps) => {
  const { gameState } = useGameState()

  const mapping = gameState.explorerDeck.cards.reduce<Record<string, { id: string; imageUrl: URL; isUsed: boolean }>>(
    (map, { imageUrl, id }) => ({ ...map, [id]: { imageUrl, id, isUsed: false } }),
    gameState.explorerDeck.used.reduce(
      (usedMap, { imageUrl, id }) => ({ ...usedMap, [id]: { imageUrl, id, isUsed: true } }),
      {},
    ),
  )

  return (
    <div className={`${className} flex h-16 justify-between gap-2 py-0.5`} {...props}>
      {explorerIds.map(
        (id) =>
          mapping[id] && (
            <img
              key={id}
              src={mapping[id].imageUrl.href}
              className={clsx(
                'rounded border-2 duration-500',
                mapping[id].isUsed ? 'opacity-100' : 'opacity-40',
                id === gameState.currentExplorerCard?.id ? 'border-primary-400' : 'border-transparent',
              )}
            />
          ),
      )}
    </div>
  )
}
