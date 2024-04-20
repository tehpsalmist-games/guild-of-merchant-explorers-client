import React, { ComponentProps, useEffect, useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { ExplorerMap } from './ExplorerMap'
import { Button, Modal } from '@8thday/react'
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon'
import ChevronLeftIcon from '@heroicons/react/24/solid/ChevronLeftIcon'
import clsx from 'clsx'
import { coinImage, romanNumeral } from '../images'

export interface GameBoardProps extends ComponentProps<'main'> {}

export const GameBoard = ({ className = '', ...props }: GameBoardProps) => {
  const [sideBarOpen, setSideBarOpen] = useState(false)
  const updateState = useState(0)[1]

  const { gameState, resetGame } = useGameState()

  useEffect(() => {
    const listener = () => updateState((s) => ++s)
    gameState.addEventListener('statechange', listener)

    return () => gameState.removeEventListener('statechange', listener)
  }, [gameState])

  return (
    <>
      <div className="fixed top-0 z-40 h-16 w-full bg-white px-4">
        <div className="flex h-full items-center">
          <div className="mr-4 flex items-center gap-2">
            <img className="h-14" src={romanNumeral.href} />
            {gameState.era > 0 && (
              <img
                className={clsx('h-14', gameState.era === 3 && 'translate-x-1 -rotate-12')}
                src={romanNumeral.href}
              />
            )}
            {gameState.era > 1 && (
              <img
                className={clsx('h-14', gameState.era === 3 && '-translate-x-1 rotate-12')}
                src={romanNumeral.href}
              />
            )}
          </div>
          {gameState.currentExplorerCard && (
            <button className="mx-4 h-full p-1" onClick={() => setSideBarOpen((o) => !o)}>
              <img className="max-h-full" src={gameState.currentExplorerCard.imageUrl.href} />
            </button>
          )}
          <Button className="mr-4" variant="primary" onClick={() => gameState.flipExplorerCard()}>
            Next Card
          </Button>
          <img className="ml-auto max-h-16" src={coinImage.href} alt="coin" />
          <span className="text-6xl font-bold leading-[1em] text-primary-500 [text-shadow:_0_0_6px_rgba(255_255_255)]">
            {gameState.activePlayer.coins}
          </span>
        </div>
      </div>
      <div className="fixed left-1/2 top-16 z-50 mt-2 -translate-x-1/2 rounded bg-slate-900/50 p-2 text-lg font-bold text-white">
        {gameState.activePlayer.message}
      </div>
      <main className={`${className} game-board-grid relative min-h-screen w-full`} {...props}>
        <ExplorerMap className="row-start-2" />

        <div
          className={clsx(
            'fixed right-0 top-0 h-screen z-50 w-sm bg-gray-700/60 transition-all duration-300',
            sideBarOpen ? 'translate-x-0' : 'translate-x-sm',
          )}
        >
          <div className="relative flex h-full flex-wrap items-start gap-2 p-2">
            {gameState.activePlayer.moveHistory.size > 1 && (
              <Button onClick={() => gameState.activePlayer.moveHistory.undoAllMoves()}>Reset Moves</Button>
            )}
            {gameState.activePlayer.moveHistory.size > 0 && (
              <Button onClick={() => gameState.activePlayer.moveHistory.undoMove()}>Undo Move</Button>
            )}
            <Button variant="destructive" className="!absolute bottom-2 left-1/2 -translate-x-1/2" onClick={resetGame}>
              Quit Game
            </Button>
            <div className="flex-center w-full">
              {gameState.currentExplorerCard && <img src={gameState.currentExplorerCard.imageUrl.href} />}
            </div>
          </div>
        </div>
        <div
          className={clsx(
            'fixed top-1/2 -translate-y-1/2 opacity-40 transition-all duration-300 focus-within:opacity-100 hover:opacity-100',
            sideBarOpen ? 'right-[calc(theme(spacing.sm)+theme(spacing.2))]' : 'right-2',
          )}
        >
          <Button
            PreIcon={sideBarOpen ? ChevronRightIcon : ChevronLeftIcon}
            onClick={() => setSideBarOpen((o) => !o)}
          ></Button>
        </div>
      </main>
      //TODO this needs to be styled
      {gameState.activePlayer.mode === 'user-prompt' && (
        <Modal onClose={() => {/* you can't close this unless you choose something */}}>
          <p>Pick which action you want to handle next.</p>
          {gameState.activePlayer.treasureCardsToDraw > 0 && (
            <Button onClick={() => gameState.activePlayer.drawTreasureMode()}>Draw Treasure (No Undo)</Button>
          )}
          {gameState.activePlayer.connectedTradePosts.length > 1 && (
            <Button onClick={() => gameState.activePlayer.pickingTradeRouteMode()}>Trade</Button>
          )}
          {gameState.activePlayer.regionForVillage && (
            <Button onClick={() => gameState.activePlayer.villageMode()}>Place Village</Button>
          )}
          <Button variant="destructive" onClick={() => gameState.activePlayer.moveHistory.undoMove()}>Undo</Button>
          <p>
            <a
              href="https://react.dev/learn/writing-markup-with-jsx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 hover:underline"
            >
              React-flavored JSX Documentation
            </a>
          </p>
        </Modal>
      )}
    </>
  )
}
