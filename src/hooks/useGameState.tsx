import React, { ReactNode, createContext, useContext, useMemo } from 'react'
import { BoardName, GameState } from '../game-logic/GameState'

const GameStateContext = createContext<{ resetGame(): void; gameState: GameState }>({
  resetGame() {},
  gameState: new GameState('aghon'),
})

export interface GameStateProviderProps {
  children: ReactNode
  name: BoardName
  resetGame(): void
}

export const GameStateProvider = ({ children, name, resetGame }: GameStateProviderProps) => {
  const gameState = useMemo(() => new GameState(name), [name])
  return <GameStateContext.Provider value={{ gameState, resetGame }}>{children}</GameStateContext.Provider>
}

export const useGameState = () => useContext(GameStateContext)
