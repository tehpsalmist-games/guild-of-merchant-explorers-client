import React, { ComponentProps, useEffect, useState } from 'react'
import { ExplorerMap } from './ExplorerMap'
import { Button, useRememberedState } from '@8thday/react'
import { useGameState } from './hooks/useGameState'
import { getFilter } from './images'

export interface AppProps extends ComponentProps<'main'> {}

export const App = ({ className = '', ...props }: AppProps) => {
  const [color, setColor] = useRememberedState('gome-block-color', () => ({
    color: '#bada55',
    filter: getFilter('#bada55'),
  }))

  const updateState = useState(false)[1]

  const gameState = useGameState()

  useEffect(() => {
    gameState.moveHistory.addEventListener('statechange', () => updateState((s) => !s))
  }, [])

  return (
    <main className={`${className} flex-center relative h-screen max-h-screen`} {...props}>
      <ExplorerMap blockColor={color.filter} />
      <div className="absolute right-2 top-2 flex gap-2">
        {gameState.moveHistory.moveHistory.length > 1 && (
          <Button onClick={() => gameState.moveHistory.undoAllMoves()}>Reset Moves</Button>
        )}
        {gameState.moveHistory.moveHistory.length > 0 && (
          <Button onClick={() => gameState.moveHistory.undoMove()}>Undo Move</Button>
        )}
        {gameState.moveHistory.moveHistory.length > 0 && (
          <Button variant="destructive" onClick={() => gameState.startNextAge()}>
            Next Age
          </Button>
        )}
        <input
          type="color"
          value={color.color}
          onChange={(e) => setColor({ color: e.target.value, filter: getFilter(e.target.value) })}
        />
      </div>
      <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded bg-slate-900/50 p-2 text-lg font-bold text-white">
        {gameState.message}
      </div>
    </main>
  )
}
