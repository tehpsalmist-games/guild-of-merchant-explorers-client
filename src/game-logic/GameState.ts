import { aghonData } from '../data/boards/aghon'
import { Board, Hex, Region } from './Board'
import { sleep } from '../utils'

export type GameMode = 'exploring' | 'treasure-exploring' | 'village' | 'power-card' | 'trading' | 'clear-history'

export class GameState {
  mode: GameMode = 'exploring'
  currentExplorerCard: 0
  moveHistory: MoveHistory
  board: Board
  regionForVillage?: Region

  constructor() {
    this.moveHistory = new MoveHistory()
    this.board = new Board(aghonData)

    this.moveHistory.gameState = this
    this.board.gameState = this
  }

  villageMode(region: Region) {
    this.mode = 'village'
    this.regionForVillage = region
  }
}

interface Move {
  hex: Hex
  action: 'explored' | 'traded' | 'village' | 'draw-treasure' | 'do-treasure'
}

export class MoveHistory extends EventTarget {
  moveHistory: Move[] = []
  gameState: GameState

  addMove(move: Move) {
    this.moveHistory.push(move)

    switch (move.action) {
      case 'explored':
        move.hex.explore()
        break
      case 'traded':
        move.hex.isCovered = true
        //TODO add trade logic
        break
      case 'village':
        move.hex.isVillage = true
        this.gameState.mode = 'exploring'
        break
      case 'draw-treasure':
        //draw treasure
        move.hex.isCovered = true
        this.clearHistory()
        break
    }

    this.recordState()
  }

  undoMove() {
    const undoing = this.moveHistory.pop()

    if (undoing) {
      switch (undoing.action) {
        case 'explored':
          undoing.hex.isExplored = false
          this.gameState.mode = 'exploring'
          break
        case 'traded':
          undoing.hex.isCovered = false
          break
        case 'village':
          undoing.hex.isVillage = false
          if (undoing.hex.region) this.gameState.villageMode(undoing.hex.region)
          break
        case 'draw-treasure':
          console.log('how did we get here?!?')
          break
      }
    }

    this.recordState()
  }

  async clearHistory() {
    while (this.moveHistory.length) {
      this.undoMove()

      // cool UI effect of undoing all the action visually in half-second increments
      // this mode blocks the user from doing anything while it happens
      this.gameState.mode = 'clear-history'
      await sleep(500)
    }

    // this will always be the mode we return to, I'm 99% sure of it.
    this.gameState.mode = 'exploring'
    this.recordState()
  }

  recordState() {
    this.dispatchEvent(new CustomEvent('statechange'))
  }
}
