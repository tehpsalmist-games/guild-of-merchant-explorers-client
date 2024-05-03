import React, { ComponentProps, useEffect, useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { ExplorerMap } from './ExplorerMap'
import { Button, Modal, useEventListener } from '@8thday/react'
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon'
import ChevronLeftIcon from '@heroicons/react/24/solid/ChevronLeftIcon'
import UTurnIcon from '@heroicons/react/24/solid/ArrowUturnLeftIcon'
import clsx from 'clsx'
import { coinImage, placeBlock, plankPanelHorizontal, plankPanelVertical, treasureChestImage } from '../images'
import { EraLabel } from './EraLabel'
import { ExplorerCardMat } from './ExplorerCardMat'
import { ObjectiveCards } from './ObjectiveCards'
import { TreasureCard } from '../game-logic/Cards'

export interface GameBoardProps extends ComponentProps<'main'> {}

export const GameBoard = ({ className = '', ...props }: GameBoardProps) => {
  const [sideBarOpen, setSideBarOpen] = useState(false)
  const [investigateModalOpen, setInvestigateModalOpen] = useState(false)
  const [newTreasureCard, setNewTreasureCard] = useState(0)
  const [userPromptOpen, setUserPromptOpen] = useState(false)
  const updateState = useState(0)[1]

  const { gameState, resetGame } = useGameState()

  const treasureCards: TreasureCard[] = gameState.activePlayer.treasureCards.filter(
    (c) => !c.discard && c.type !== 'jarMultiplier',
  )
  const treasureJars: TreasureCard[] = gameState.activePlayer.treasureCards.filter((c) => c.type === 'jarMultiplier')

  const investigateCard = gameState.currentExplorerCard?.isEraCard
    ? gameState.currentExplorerCard.getInvestigateCard?.(gameState.activePlayer)
    : null

  useEventListener('keydown', (e) => {
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      gameState.activePlayer.moveHistory.undoMove()
    }
    if (e.key === 'd') {
      setSideBarOpen((o) => !o)
    }
  })

  useEffect(() => {
    const listener = () => updateState((s) => ++s)
    gameState.addEventListener('statechange', listener)

    return () => gameState.removeEventListener('statechange', listener)
  }, [gameState])

  useEffect(() => {
    const treasureListener = () => setNewTreasureCard((nt) => nt + 1)
    gameState.activePlayer.addEventListener('treasure-gained', treasureListener)

    return () => gameState.activePlayer.removeEventListener('treasure-gained', treasureListener)
  }, [gameState.activePlayer])

  useEffect(() => {
    if (
      gameState.activePlayer.mode === 'choosing-investigate-card' ||
      gameState.activePlayer.mode === 'choosing-investigate-card-reuse'
    ) {
      setInvestigateModalOpen(true)
    }

    if (gameState.activePlayer.mode === 'user-prompting' || gameState.activePlayer.mode === 'game-over') {
      setUserPromptOpen(true)
    }
  }, [gameState.activePlayer.mode])

  return (
    <>
      <div className="fixed top-0 z-30 h-16 w-full">
        <ObjectiveCards />
      </div>
      <div
        className="fixed top-0 z-40 h-16 w-full px-4"
        style={{ backgroundImage: `url(${plankPanelHorizontal.href})` }}
      >
        <div className="grid h-full grid-cols-[1fr,auto,1fr] grid-rows-1">
          <div className="flex h-16 items-center py-0.5">
            <EraLabel className="mr-4" />
            {gameState.currentExplorerCard && (
              <button className="mx-4 flex h-full" onClick={() => setSideBarOpen((o) => !o)}>
                {!investigateCard && (
                  <img
                    className="max-h-full max-w-12 rounded border-2 border-transparent"
                    src={gameState.currentExplorerCard.imageUrl.href}
                  />
                )}
                {investigateCard && (
                  <img
                    className="max-h-full max-w-12 rounded border-2 border-primary-400"
                    src={investigateCard.imageUrl.href}
                  />
                )}
                {gameState.activePlayer.mode === 'free-exploring' && (
                  <img className="max-h-full max-w-32 rounded border-2 border-primary-400" src={placeBlock.href} />
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
                    className="-z-10 max-h-full max-w-12"
                    src={candidate.imageUrl.href}
                    alt="Investigate Card"
                  />
                ))}
              </button>
            )}
            {gameState.activePlayer.mode === 'exploring' &&
              gameState.currentCardRules &&
              (!gameState.currentExplorerCard ||
                (gameState.currentCardRules?.length ?? 1) - 1 === gameState.activePlayer.cardPhase) && (
                <Button
                  className="mr-4 whitespace-nowrap"
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
            {gameState.activePlayer.mode === 'exploring' &&
              gameState.currentCardRules &&
              (gameState.currentCardRules?.length ?? 1) - 1 !== gameState.activePlayer.cardPhase && (
                <Button
                  className="mr-4 whitespace-nowrap"
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
            {gameState.activePlayer.mode === 'game-over' && (
              <Button className="mr-4 whitespace-nowrap" variant="primary" onClick={() => setUserPromptOpen(true)}>
                Score Board
              </Button>
            )}
            {!userPromptOpen && gameState.activePlayer.mode === 'user-prompting' && (
              <Button className="mr-2" variant="primary" onClick={() => setUserPromptOpen(true)}>
                View Choices
              </Button>
            )}
            {gameState.activePlayer.moveHistory.size > 0 && (
              <Button
                className="mr-4"
                variant="dismissive"
                PreIcon={UTurnIcon}
                onClick={() => gameState.activePlayer.moveHistory.undoMove()}
              >
                Undo
              </Button>
            )}
          </div>
          <ExplorerCardMat />
          <div className="flex justify-end gap-2">
            <img className="max-h-16 max-w-32" src={coinImage.href} alt="coin" />
            <span className="text-6xl font-bold leading-[1em] text-primary-500 [text-shadow:_0_0_6px_rgba(255_255_255)]">
              {gameState.activePlayer.coins}
            </span>
            <img className="max-h-16 max-w-32" src={treasureChestImage.href} alt="treasure" />
            <span className="text-6xl font-bold leading-[1em] text-primary-500 [text-shadow:_0_0_6px_rgba(255_255_255)]">
              {treasureCards.length + treasureJars.length}
            </span>
          </div>
        </div>
      </div>
      <div className="fixed bottom-24 left-1/2 z-50 mt-2 w-max max-w-[95vw] -translate-x-1/2 rounded bg-slate-900/50 p-2 text-lg font-bold text-white">
        {gameState.activePlayer.message}
      </div>
      <main className={`${className} game-board-grid relative min-h-screen w-full`} {...props}>
        <ExplorerMap className="row-start-2" />
        <div
          className={clsx(
            'fixed right-0 top-0 z-30 h-screen w-sm bg-gray-700/60 pt-16 transition-all duration-300',
            sideBarOpen ? 'translate-x-0' : 'translate-x-sm',
          )}
          style={{ backgroundImage: `url(${plankPanelHorizontal.href})` }}
        >
          <div className="relative flex h-full flex-col items-center gap-2 overflow-y-auto p-2 text-white">
            <div className="flex-center sticky top-0 min-h-12 w-full gap-2 py-2">
              {gameState.activePlayer.moveHistory.size > 1 && (
                <Button onClick={() => gameState.activePlayer.moveHistory.undoAllMoves()}>Reset Moves</Button>
              )}
              {gameState.activePlayer.moveHistory.size > 0 && (
                <Button onClick={() => gameState.activePlayer.moveHistory.undoMove()}>Undo Move</Button>
              )}
            </div>
            <div className="flex-center w-full flex-col gap-y-2">
              <h3 className="mb-2">Current Explorer Card</h3>
              {gameState.currentExplorerCard && (
                <img
                  className={clsx(
                    gameState.currentExplorerCard.isEraCard ? 'mb-2 w-1/3 rounded-lg' : 'w-4/5 rounded-3xl',
                  )}
                  src={gameState.currentExplorerCard.imageUrl.href}
                />
              )}
              {investigateCard && <img className="ml-2 w-4/5 rounded-3xl" src={investigateCard.imageUrl.href} />}
              <h3 className="mb-2 mt-4">Acquired Treasure Cards</h3>
              {treasureCards.length === 0 && treasureJars.length === 0 && <em>(None)</em>}
              {treasureJars.length > 0 && (
                <div className="flex-center flex-col">
                  <img className="mb-2 w-4/5 rounded-2xl" src={treasureJars[0].imageUrl.href} />
                  <div className="flex-center flex-row">
                    <h2>x{treasureJars.length}≈</h2>
                    <img className="w-8" src={coinImage.href} />
                    <p>{gameState.activePlayer.getTreasureJarValue()}</p>
                  </div>
                </div>
              )}
              {treasureCards.map((tc) => (
                <div className="flex-center flex-col">
                  <img className="mb-2 w-4/5 rounded-2xl" src={tc.imageUrl.href} />
                  <div className="flex-center flex-row">
                    <h2>≈</h2>
                    <img className="w-8" src={coinImage.href} />
                    <p>{tc.value(gameState.activePlayer.board)}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-8" variant="destructive" onClick={resetGame}>
              Quit Game
            </Button>
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
          <div
            className="flex-center flex-col gap-4 p-2 text-white"
            style={{ backgroundImage: `url(${plankPanelHorizontal.href})` }}
          >
            <p>How would you like to proceed?</p>
            {gameState.activePlayer.treasureCardHex && (
              <div className="flex-center flex-col">
                <Button
                  variant="primary"
                  onClick={() =>
                    gameState.activePlayer.moveHistory.doMove({
                      action: 'draw-treasure',
                      hex: gameState.activePlayer.treasureCardHex!,
                    })
                  }
                >
                  Draw Treasure
                </Button>
                <p>Drawing a treasure card cannot be undone!</p>
              </div>
            )}
            {gameState.activePlayer.connectedTradePosts.length > 1 && (
              <Button variant="primary" onClick={() => gameState.activePlayer.enterPickingTradeRouteMode()}>
                Trade
              </Button>
            )}
            {gameState.activePlayer.regionForVillage && (
              <Button variant="primary" onClick={() => gameState.activePlayer.enterVillageMode()}>
                Place Village
              </Button>
            )}
            {gameState.activePlayer.moveHistory.currentMoves.length > 0 && (
              <Button
                variant={gameState.activePlayer.treasureCardHex ? 'destructive' : 'dismissive'}
                onClick={() => gameState.activePlayer.moveHistory.undoMove()}
              >
                Undo
              </Button>
            )}
          </div>
        </Modal>
      )}
      {['choosing-investigate-card', 'choosing-investigate-card-reuse', ''].includes(gameState.activePlayer.mode) &&
        investigateModalOpen && (
          <Modal onClose={() => setInvestigateModalOpen(false)}>
            <p className="mb-4 text-center">
              Choose an Investigate Card for Era {gameState.era > 2 ? 'IV' : 'I'.repeat(gameState.era + 1)}.
            </p>
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
          </Modal>
        )}
      {newTreasureCard > 0 && (
        <Modal onClose={() => setNewTreasureCard((t) => t - 1)}>
          <p className="mb-4 text-center">You drew a treasure card:</p>
          <img
            className="block max-w-md rounded-2xl"
            src={
              gameState.activePlayer.treasureCards[gameState.activePlayer.treasureCards.length - newTreasureCard]
                ?.imageUrl.href
            }
          />
          <Button variant="primary" onClick={() => setNewTreasureCard((t) => t - 1)}>
            OK
          </Button>
        </Modal>
      )}
      {gameState.activePlayer.mode === 'game-over' && userPromptOpen && gameState.scoreBoard && (
        <Modal onClose={() => setUserPromptOpen(false)}>
          <div
            className="flex-center flex-col gap-4 p-2 text-white"
            style={{ backgroundImage: `url(${plankPanelHorizontal.href})` }}
          >
            <h1>All Eras Complete!</h1>

            {gameState.scoreBoard.stats.map((stat) => (
              <div>
                <div className="flex-center gap-4">
                  {stat.image && <img className="max-h-8 max-w-8" src={stat.image.href} />}
                  {stat.name && <p>{stat.name}</p>}
                </div>
                <div className="flex-center gap-4">
                  <p>
                    {stat.visibleScore >= 0 ? stat.visibleScore : '-'}
                    {stat.visibleScore >= 0 && stat.maxScore ? ` / ${stat.maxScore}` : ''}
                  </p>
                </div>
              </div>
            ))}

            {gameState.scoreBoard.doneRevealing && (
              <Button className="mt-8" variant="destructive" onClick={resetGame}>
                Quit Game
              </Button>
            )}
            {!gameState.scoreBoard.doneRevealing && <Button className="mt-8">Quit Game</Button>}
          </div>
        </Modal>
      )}
    </>
  )
}
