import React, { ReactNode, createContext, useContext, useMemo } from 'react'
import { BoardName, GameState, PlayerInputs } from '../game-logic/GameState'

const GameStateContext = createContext<{ resetGame(): void; gameState: GameState }>({} as any)

export interface GameStateProviderProps {
  children: ReactNode
  name: BoardName
  playerData: PlayerInputs[]
  resetGame(): void
}

export const GameStateProvider = ({ children, name, playerData, resetGame }: GameStateProviderProps) => {
  const gameState = useMemo(() => {
    const savedState = localStorage.getItem('gome-serialized-game-state')

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        console.log(parsedState)
        const restoredGameState = new GameState({ boardName: parsedState.boardName }, parsedState)
        restoredGameState.players.forEach((p) => p.replayMoves())

        if (restoredGameState.gameOver) restoredGameState.tallyScores()

        return restoredGameState
      } catch (e) {
        console.error('bad game state:', e, savedState)
        // localStorage.removeItem('gome-serialized-game-state')
      }
    }

    return new GameState({ boardName: name, playerData })
  }, [name, playerData])

  if (!gameState) return null

  return <GameStateContext.Provider value={{ gameState, resetGame }}>{children}</GameStateContext.Provider>
}

export const useGameState = () => useContext(GameStateContext)
