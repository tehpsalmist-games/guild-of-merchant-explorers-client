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
      <Button
        variant="destructive"
        className="!absolute right-2 top-2"
        onClick={() => gameState.moveHistory.undoMove()}
      >
        Undo Move
      </Button>
    </main>
  )
}
