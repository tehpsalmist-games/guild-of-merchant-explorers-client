import React, { ComponentProps, useEffect, useState } from 'react'
import { ExplorerMap } from './ExplorerMap'
import { Button } from '@8thday/react'
import { useGameState } from './hooks/useGameState'
import clsx from 'clsx'

const bgImage = new URL('/src/images/Aghon.jpeg', import.meta.url)

export interface AppProps extends ComponentProps<'main'> {}

export const App = ({ className = '', ...props }: AppProps) => {
  const updateState = useState(false)[1]

  const gameState = useGameState()

  useEffect(() => {
    gameState.moveHistory.addEventListener('statechange', () => updateState((s) => !s))
  }, [])

  return (
    <main className={`${className} flex-center h-screen max-h-screen`} {...props}>
      <div
        className="aghon relative m-auto aspect-[1416/990] w-full max-w-full bg-cover"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <ExplorerMap
          board={gameState.board}
          className="absolute"
          style={{ top: `${(105 / 990) * 100}%`, left: `${(101 / 1416) * 100}%`, width: `${(1229 / 1416) * 100}%` }}
        />
        <Button
          variant="destructive"
          className="absolute right-2 top-2"
          onClick={() => gameState.moveHistory.undoMove()}
        >
          Undo Move
        </Button>
      </div>
    </main>
  )
}
