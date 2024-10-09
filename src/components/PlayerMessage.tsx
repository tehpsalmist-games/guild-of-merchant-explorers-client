import React, { ComponentProps } from 'react'
import { PlayerMode } from '../game-logic/GameState'
import { useGameState } from '../hooks/useGameState'

const messages: Record<PlayerMode, string> = {
  'choosing-village': "You've explored the region! Choose where to build a village.",
  'choosing-trade-route': 'Pick two trading posts to trade between.',
  'choosing-investigate-card': 'Choose an Investigate Card',
  'choosing-investigate-card-reuse': 'Choose an Investigate Card',
  'clearing-history': 'Clearing move history...',
  exploring: 'Explore!',
  'free-exploring': 'Explore anywhere!',
  trading: 'Complete the trade by picking a trading post to permanently cover.',
  'user-prompting': 'Choose what to do next.',
  'treasure-to-draw': 'Draw a treasure card!',
}

export interface PlayerMessageProps extends ComponentProps<'div'> {}

export const PlayerMessage = ({ className = '', ...props }: PlayerMessageProps) => {
  const { gameState } = useGameState()

  const mode = gameState.activePlayer.mode

  return (
    <div className={`${className}`} {...props}>
      {mode === 'exploring'
        ? gameState.currentExplorerCard?.rules(gameState.activePlayer)?.[gameState.activePlayer.cardPhase]?.message ??
          'Explore!'
        : messages[mode]}
    </div>
  )
}
