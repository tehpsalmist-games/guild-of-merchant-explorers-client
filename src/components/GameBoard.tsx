import React, { ComponentProps, useEffect, useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { ExplorerMap } from './ExplorerMap'
import { Button } from '@8thday/react'
import BarsIcon from '@heroicons/react/24/solid/Bars3Icon'
import clsx from 'clsx'

export interface GameBoardProps extends ComponentProps<'main'> {}

export const GameBoard = ({ className = '', ...props }: GameBoardProps) => {
  const [sideBarOpen, setSideBarOpen] = useState(false)
  const updateState = useState(false)[1]

  const { gameState, resetGame } = useGameState()

  useEffect(() => {
    gameState.moveHistory.addEventListener('statechange', () => updateState((s) => !s))
  }, [])

  return (
    <main className={`${className} relative min-h-screen w-full`} {...props}>
      <ExplorerMap />
      <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded bg-slate-900/50 p-2 text-lg font-bold text-white">
        {gameState.message}
      </div>
      <div
        className={clsx(
          'absolute right-0 top-0 h-full w-sm bg-gray-700/60 transition-all duration-300',
          sideBarOpen ? 'translate-x-0' : 'translate-x-sm',
        )}
      >
        <div className="relative flex h-full items-start gap-2 p-2">
          {gameState.moveHistory.size > 1 && (
            <Button onClick={() => gameState.moveHistory.undoAllMoves()}>Reset Moves</Button>
          )}
          {gameState.moveHistory.size > 0 && (
            <Button onClick={() => gameState.moveHistory.undoMove()}>Undo Move</Button>
          )}
          {gameState.moveHistory.size > 0 && (
            <Button variant="primary" onClick={() => gameState.startNextAge()}>
              Next Age
            </Button>
          )}
          <Button variant="destructive" className="!absolute bottom-2 left-1/2 -translate-x-1/2" onClick={resetGame}>
            Quit Game
          </Button>
        </div>
      </div>
      <div
        className={clsx(
          'absolute top-2 opacity-40 transition-all duration-300 focus-within:opacity-100 hover:opacity-100',
          sideBarOpen ? 'right-[calc(theme(spacing.sm)+theme(spacing.2))]' : 'right-2',
        )}
      >
        <Button PreIcon={BarsIcon} variant="primary" onClick={() => setSideBarOpen((o) => !o)}></Button>
      </div>
    </main>
  )
}