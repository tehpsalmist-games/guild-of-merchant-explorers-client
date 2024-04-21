import React, { ComponentProps, useEffect, useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { ExplorerMap } from './ExplorerMap'
import { Button, Modal, useEventListener } from '@8thday/react'
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon'
import ChevronLeftIcon from '@heroicons/react/24/solid/ChevronLeftIcon'
import clsx from 'clsx'
import { coinImage, romanNumeral } from '../images'
import { EraLabel } from './EraLabel'
import { ExplorerCardMat } from './ExplorerCardMat'

export interface GameBoardProps extends ComponentProps<'main'> {}

export const GameBoard = ({ className = '', ...props }: GameBoardProps) => {
  const [sideBarOpen, setSideBarOpen] = useState(false)
  const [investigateModalOpen, setInvestigateModalOpen] = useState(false)
  const [userPromptOpen, setUserPromptOpen] = useState(false)
  const updateState = useState(0)[1]

  const { gameState, resetGame } = useGameState()

  const rules = gameState.currentCardRules
  const investigateCard = gameState.currentExplorerCard?.isEraCard
    ? gameState.currentExplorerCard.getInvestigateCard?.(gameState.activePlayer)
    : null

  useEventListener('keydown', (e) => {
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      gameState.activePlayer.moveHistory.undoMove()
    }
  })

  useEffect(() => {
    const listener = () => updateState((s) => ++s)
    gameState.addEventListener('statechange', listener)

    return () => gameState.removeEventListener('statechange', listener)
  }, [gameState])

  useEffect(() => {
    if (
      gameState.activePlayer.mode === 'choosing-investigate-card' ||
      gameState.activePlayer.mode === 'choosing-investigate-card-reuse'
    ) {
      setInvestigateModalOpen(true)
    }

    if (gameState.activePlayer.mode === 'user-prompting') {
      setUserPromptOpen(true)
    }
  }, [gameState.activePlayer.mode])

  return (
    <>
      <div className="fixed top-0 z-40 h-16 w-full bg-white px-4">
        <div className="grid h-full grid-cols-[1fr,auto,1fr] grid-rows-1">
          <div className="flex h-16 items-center py-0.5">
            <EraLabel className="mr-4" />
            {gameState.currentExplorerCard && (
              <button className="mx-4 flex h-full" onClick={() => setSideBarOpen((o) => !o)}>
                {!investigateCard && (
                  <img
                    className="max-h-full rounded border-2 border-transparent"
                    src={gameState.currentExplorerCard.imageUrl.href}
                  />
                )}
                {investigateCard && (
                  <img className="max-h-full rounded border-2 border-primary-400" src={investigateCard.imageUrl.href} />
                )}
              </button>
            )}
            {(gameState.activePlayer.mode === 'choosing-investigate-card' ||
              gameState.activePlayer.mode === 'choosing-investigate-card-reuse') && (
              <button
                className="flex-center mr-4 h-full gap-4 rounded border-2 border-primary-400"
                onClick={() => setInvestigateModalOpen(true)}
              >
                {(gameState.era < 3
                  ? gameState.activePlayer.investigateCardCandidates
                  : gameState.activePlayer.investigateCards
                )?.map((candidate) => (
                  <img
                    key={candidate.id}
                    className="-z-10 max-h-full"
                    src={candidate.imageUrl.href}
                    alt="Investigate Card"
                  />
                ))}
              </button>
            )}
            {gameState.currentCardRules &&
              (!gameState.currentExplorerCard ||
                (gameState.currentCardRules?.length ?? 1) - 1 === gameState.activePlayer.cardPhase) && (
                <Button
                  className="mr-4"
                  variant={
                    gameState.activePlayer.moveHistory.getPlacedHexes()[gameState.activePlayer.cardPhase]?.length ===
                    gameState.currentCardRules[gameState.activePlayer.cardPhase]?.limit
                      ? 'primary'
                      : 'dismissive'
                  }
                  onClick={() => gameState.flipExplorerCard()}
                >
                  Next Card
                </Button>
              )}
            {gameState.currentCardRules &&
              (gameState.currentCardRules?.length ?? 1) - 1 !== gameState.activePlayer.cardPhase && (
                <Button
                  className="mr-4"
                  variant={
                    gameState.activePlayer.moveHistory.getPlacedHexes()[gameState.activePlayer.cardPhase]?.length ===
                    gameState.currentCardRules[gameState.activePlayer.cardPhase]?.limit
                      ? 'primary'
                      : 'dismissive'
                  }
                  onClick={() => gameState.activePlayer.enterNextCardPhaseMode()}
                >
                  Next Phase
                </Button>
              )}
            {!userPromptOpen && gameState.activePlayer.mode === 'user-prompting' && (
              <Button onClick={() => setUserPromptOpen(true)}>View Choices</Button>
            )}
          </div>
          <ExplorerCardMat className="mx-auto" />
          <div className="flex justify-end gap-2">
            <img className="max-h-16" src={coinImage.href} alt="coin" />
            <span className="text-6xl font-bold leading-[1em] text-primary-500 [text-shadow:_0_0_6px_rgba(255_255_255)]">
              {gameState.activePlayer.coins}
            </span>
          </div>
        </div>
      </div>
      <div className="fixed left-1/2 top-16 z-50 mt-2 w-max max-w-[95vw] -translate-x-1/2 rounded bg-slate-900/50 p-2 text-lg font-bold text-white">
        {gameState.activePlayer.message}
      </div>
      <main className={`${className} game-board-grid relative min-h-screen w-full`} {...props}>
        <ExplorerMap className="row-start-2" />

        <div
          className={clsx(
            'fixed right-0 top-0 z-50 h-screen w-sm bg-gray-700/60 transition-all duration-300',
            sideBarOpen ? 'translate-x-0' : 'translate-x-sm',
          )}
        >
          <div className="flex-center relative h-full flex-wrap items-start gap-2 p-2">
            <div className="absolute left-0 top-0 flex w-full p-2">
              {gameState.activePlayer.moveHistory.size > 1 && (
                <Button onClick={() => gameState.activePlayer.moveHistory.undoAllMoves()}>Reset Moves</Button>
              )}
              {gameState.activePlayer.moveHistory.size > 0 && (
                <Button className="ml-auto" onClick={() => gameState.activePlayer.moveHistory.undoMove()}>
                  Undo Move
                </Button>
              )}
            </div>
            <Button variant="destructive" className="!absolute bottom-2 left-1/2 -translate-x-1/2" onClick={resetGame}>
              Quit Game
            </Button>
            <div className="flex-center w-full flex-col gap-y-2">
              {gameState.currentExplorerCard && (
                <img
                  className={clsx(gameState.currentExplorerCard.isEraCard ? 'mb-2 w-1/3 rounded-lg' : 'rounded-3xl')}
                  src={gameState.currentExplorerCard.imageUrl.href}
                />
              )}
              {investigateCard && <img className="ml-2 w-full rounded-3xl" src={investigateCard.imageUrl.href} />}
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
      {gameState.activePlayer.mode === 'user-prompting' && userPromptOpen && (
        <Modal onClose={() => setUserPromptOpen(false)}>
          <p>Pick which action you want to handle next.</p>
          {gameState.activePlayer.treasureCardHex && (
            <Button onClick={() => gameState.activePlayer.enterDrawTreasureMode()}>Draw Treasure (No Undo)</Button>
          )}
          {gameState.activePlayer.connectedTradePosts.length > 1 && (
            <Button onClick={() => gameState.activePlayer.enterPickingTradeRouteMode()}>Trade</Button>
          )}
          {gameState.activePlayer.regionForVillage && (
            <Button onClick={() => gameState.activePlayer.enterVillageMode()}>Place Village</Button>
          )}
          {gameState.activePlayer.moveHistory.currentMoves.length > 0 && (
            <Button variant="destructive" onClick={() => gameState.activePlayer.moveHistory.undoMove()}>
              Undo
            </Button>
          )}
        </Modal>
      )}
      {(gameState.activePlayer.mode === 'choosing-investigate-card' ||
        gameState.activePlayer.mode === 'choosing-investigate-card-reuse') &&
        investigateModalOpen && (
          <Modal onClose={() => setInvestigateModalOpen(false)}>
            <p className="mb-4 text-center">
              Choose an Investigate Card for Era {gameState.era > 2 ? 'IV' : 'I'.repeat(gameState.era + 1)}.
            </p>
            {
              <div className="flex-center gap-4">
                {(gameState.era < 3
                  ? gameState.activePlayer.investigateCardCandidates
                  : gameState.activePlayer.investigateCards
                )?.map((candidate, index) => (
                  <button
                    key={candidate.id}
                    onClick={() => {
                      if (gameState.era < 3) {
                        gameState.activePlayer.chooseInvestigateCard(candidate)
                      } else {
                        gameState.activePlayer.chooseInvestigateCardForReuse(index)
                      }
                    }}
                  >
                    <img src={candidate.imageUrl.href} alt="Investigate Card" />
                  </button>
                ))}
              </div>
            }
          </Modal>
        )}
    </>
  )
}
