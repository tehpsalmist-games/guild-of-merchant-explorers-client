import React, { ComponentProps, useEffect, useState } from 'react'
import { ExplorerMap } from './ExplorerMap'
import { Button } from '@8thday/react'
import { useGameState } from './hooks/useGameState'

export interface AppProps extends ComponentProps<'main'> {}

export const App = ({ className = '', ...props }: AppProps) => {
  const updateState = useState(false)[1]

  const gameState = useGameState()

  useEffect(() => {
    gameState.moveHistory.addEventListener('statechange', () => updateState((s) => !s))
  }, [])

  return (
    <main className={`${className} flex-center relative h-screen max-h-screen`} {...props}>
      <ExplorerMap />
      <div className="absolute right-2 top-2 flex gap-2">
        {gameState.moveHistory.moveHistory.length > 1 && (
          <Button onClick={() => gameState.moveHistory.undoAllMoves()}>
            Reset Moves
          </Button>
        )}
        {gameState.moveHistory.moveHistory.length > 0 && (
          <Button onClick={() => gameState.moveHistory.undoMove()}>Undo Move</Button>
        )}
        {gameState.moveHistory.moveHistory.length > 0 && (
          <Button variant="destructive" onClick={() => gameState.startNextAge()}>Next Age</Button>
        )}
      </div>
    </main>
    //TODO we need some sort of tooltip in the corner that prompts the player to do various things.
    //ex: you just got a block from a treasure card. please place it on the board.
    //ex: you just made a trading route. please pick a trading post to cover so that it can't be used again.
    //ex for weird situations: you just created multiple trading routes at once. please pick two trading posts to score.
    //most of the time, it would probably not be needed because everything is pretty self-explanatory.
  )
}
