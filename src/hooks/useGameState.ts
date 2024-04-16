import { createContext, useContext } from 'react'
import { GameState } from '../game-logic/GameState'

const gameStateContext = createContext<GameState>(new GameState())

export const GameStateProvider = gameStateContext.Provider

export const useGameState = () => useContext(gameStateContext)
