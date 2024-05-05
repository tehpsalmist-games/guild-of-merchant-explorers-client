import React, { ComponentProps } from 'react'
import { BoardName } from '../game-logic/GameState'
import { GameStateProvider } from '../hooks/useGameState'
import { GameBoard } from './GameBoard'
import { useRememberedState } from '@8thday/react'
import { aghonBoard, aveniaBoard, cnidariaBoard, kazanBoard, northProyliaBoard, xawskilBaseBoard } from '../images'

export interface AppProps extends ComponentProps<'main'> {}

export const App = ({ className = '', ...props }: AppProps) => {
  const [boardName, setBoardName] = useRememberedState<BoardName | ''>('gome-board-name', '')

  if (!boardName)
    return (
      <main className={`${className} grid grid-cols-auto-2 gap-4 p-4`} {...props}>
        <h2 className="col-span-full text-center">Choose A Board To Play</h2>
        <button
          className="opacity-100 hover:opacity-70 focus:opacity-70 focus:outline-none"
          onClick={() => setBoardName('aghon')}
        >
          <img className="h-full w-full" src={aghonBoard.href} />
        </button>
        <button
          className="opacity-100 hover:opacity-70 focus:opacity-70 focus:outline-none"
          onClick={() => setBoardName('avenia')}
        >
          <img className="h-full w-full" src={aveniaBoard.href} />
        </button>
        <button
          className="opacity-100 hover:opacity-70 focus:opacity-70 focus:outline-none"
          onClick={() => setBoardName('kazan')}
        >
          <img className="h-full w-full" src={kazanBoard.href} />
        </button>
        <button
          className="opacity-100 hover:opacity-70 focus:opacity-70 focus:outline-none"
          onClick={() => setBoardName('cnidaria')}
        >
          <img className="h-full w-full" src={cnidariaBoard.href} />
        </button>
        <button
          className="opacity-100 hover:opacity-70 focus:opacity-70 focus:outline-none"
          onClick={() => setBoardName('northProylia')}
        >
          <img className="h-full w-full" src={northProyliaBoard.href} />
        </button>
        <button
          className="opacity-100 hover:opacity-70 focus:opacity-70 focus:outline-none"
          onClick={() => setBoardName('xawskil')}
        >
          <img className="h-full w-full" src={xawskilBaseBoard.href} />
        </button>
      </main>
    )

  return (
    <GameStateProvider resetGame={() => setBoardName('')} name={boardName}>
      <GameBoard className={`${className}`} {...props} />
    </GameStateProvider>
  )
}
