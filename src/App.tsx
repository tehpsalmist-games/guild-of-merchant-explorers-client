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
          <Button variant="destructive" onClick={() => gameState.moveHistory.clearHistory()}>
            Reset Moves
          </Button>
        )}
        {gameState.moveHistory.moveHistory.length > 0 && (
          <Button onClick={() => gameState.moveHistory.undoMove()}>Undo Move</Button>
        )}
      </div>
    </main>
  )
}
