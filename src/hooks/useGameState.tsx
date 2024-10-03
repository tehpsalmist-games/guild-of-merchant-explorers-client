import React, { ReactNode, createContext, useContext, useMemo } from 'react'
import { BoardName, GameState } from '../game-logic/GameState'

const GameStateContext = createContext<{ resetGame(): void; gameState: GameState }>({} as any)

export interface GameStateProviderProps {
  children: ReactNode
  name: BoardName
  resetGame(): void
}

export const GameStateProvider = ({ children, name, resetGame }: GameStateProviderProps) => {
  const gameState = useMemo(() => {
    const savedState = localStorage.getItem('gome-serialized-game-state')

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        console.log(parsedState)
        const restoredGameState = new GameState({ boardName: parsedState.boardName }, parsedState)
        restoredGameState.activePlayer.replayMoves()

        if (restoredGameState.gameOver) restoredGameState.tallyScores()

        return restoredGameState
      } catch (e) {
        console.error('bad game state:', e, savedState)
        // localStorage.removeItem('gome-serialized-game-state')
      }
    }

    return new GameState({ boardName: name, playerIds: ['solo'], activePlayerId: 'solo' })
  }, [name])

  if (!gameState) return null

  return <GameStateContext.Provider value={{ gameState, resetGame }}>{children}</GameStateContext.Provider>
}

export const useGameState = () => useContext(GameStateContext)
