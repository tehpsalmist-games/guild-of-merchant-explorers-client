import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { GameStateProvider } from './hooks/useGameState'
import { GameState } from './game-logic/GameState'

const root = createRoot(document.getElementById('app')!)

root.render(
  <GameStateProvider value={new GameState()}>
    <App />
  </GameStateProvider>,
)
