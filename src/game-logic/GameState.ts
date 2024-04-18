import { aghonData } from '../data/boards/aghon'
import { kazanData } from '../data/boards/kazan'
import { aveniaData } from '../data/boards/avenia'
import { cnidariaData } from '../data/boards/cnidaria'
import { Board, BoardData, Hex, Region, TradeRoute } from './Board'
import { sleep } from '../utils'

export type BoardName = 'aghon' | 'avenia' | 'kazan' | 'cnidaria'

const getBoardData = (boardName: BoardName) => {
  switch (boardName) {
    case 'aghon':
      return aghonData
    case 'avenia':
      return aveniaData
    case 'kazan':
      return kazanData
    case 'cnidaria':
      return cnidariaData
  }
}

export type GameMode =
  | 'exploring'
  | 'treasure-exploring'
  | 'village'
  | 'power-card'
  | 'picking-trade-start'
  | 'trading'
  | 'clear-history'
  | 'wait-for-new-card'
  | 'game-over'

export class GameState {
  mode: GameMode = 'exploring'
  era = 1
  message = 'Explore!'
  moveHistory: MoveHistory
  activePlayer: Player
  regionForVillage?: Region
  tradeRoute?: TradeRoute

  constructor(boardName: BoardName) {
    this.moveHistory = new MoveHistory(this)

    this.activePlayer = new Player(getBoardData(boardName), this)
  }

  startNextAge() {
    this.activePlayer.board.wipe()
    //TODO undraw all cards here
    //TODO add next age card to the deck

    this.era++

    if (this.era > 4) {
      // game is over, total points from treasure cards and display all results
      this.mode = 'game-over'
      this.message = 'Game Over!'
    }

    //You shouldn't be able to undo things in the previous ages, so we clear the history here.
    this.moveHistory.currentMoves = []
    this.moveHistory.recordState()
  }

  //TODO this will probably need to be the default mode at some point
  waitForNewCardMode() {
    this.mode = 'wait-for-new-card'
  }

  villageMode(region: Region) {
    this.mode = 'village'
    this.regionForVillage = region
    this.message = "You've explored the region! Choose where to build a village."
  }

  pickingTradeStartMode(tradingRoute: TradeRoute) {
    if (tradingRoute.tradingPosts.length === 2) {
      this.tradingMode(tradingRoute)
    } else {
      this.mode = 'picking-trade-start'
      this.tradeRoute = tradingRoute
      this.message = 'Pick the first trading post to trade with.'
    }
  }

  tradingMode(tradingRoute: TradeRoute) {
    this.mode = 'trading'
    this.tradeRoute = tradingRoute
    this.message = 'Pick a trading post to permanently cover.'
  }

  //TODO this will probably need to take a card as an argument at some point
  exploringMode() {
    this.mode = 'exploring'
    this.message = 'Explore!'
  }
}

interface Move {
  hex: Hex
  action: 'explored' | 'pick-trade-start' | 'do-trade' | 'village' | 'draw-treasure' | 'do-treasure'
}

export class MoveHistory extends EventTarget {
  currentMoves: Move[] = []
  gameState: GameState

  constructor(gameState: GameState) {
    super()

    this.gameState = gameState
  }

  doMove(move: Move) {
    this.currentMoves.push(move)

    switch (move.action) {
      case 'explored':
        move.hex.explore()
        break
      case 'pick-trade-start':
        //this.gameState.tradeRoute?.tradeStart = move.hex
        //TODO still working on this
        //if (this.gameState.tradeRoute) {
        //this.gameState.tradingMode(this.gameState.tradeRoute)
        //}
        break
      case 'do-trade':
        this.gameState.tradeRoute?.coverTradingPost(move.hex)

        if (this.gameState.tradeRoute?.isTradable) {
          this.gameState.pickingTradeStartMode(this.gameState.tradeRoute)
        } else {
          this.gameState.tradeRoute = undefined
          this.gameState.exploringMode()
        }
        break
      case 'village':
        move.hex.isVillage = true
        this.gameState.activePlayer.coins += this.gameState.era
        this.gameState.exploringMode()
        break
      case 'draw-treasure':
        //TODO add draw treasure logic
        move.hex.isCovered = true
        //Completely blocks the ability to undo anything prior to drawing a treasure card
        this.currentMoves = []
        break
    }

    this.recordState()
  }

  undoMove() {
    const undoing = this.currentMoves.pop()

    if (undoing) {
      switch (undoing.action) {
        case 'explored':
          undoing.hex.unexplore()
          this.gameState.exploringMode()
          break
        case 'do-trade':
          undoing.hex.isCovered = false
          //TODO add undo trade logic
          this.gameState.exploringMode()
          break
        case 'village':
          undoing.hex.isVillage = false
          this.gameState.activePlayer.coins -= this.gameState.era

          if (undoing.hex.region) {
            this.gameState.villageMode(undoing.hex.region)
          } else {
            this.gameState.exploringMode()
          }
          break
        case 'draw-treasure':
          //You can't undo drawing a treasure card. Once you draw a treasure card, the history is cleared.
          //This means it's not technically possible to hit this switch case.
          console.error('How did we get here?!?')
          break
      }
    }

    this.recordState()
  }

  async undoAllMoves() {
    while (this.currentMoves.length) {
      this.undoMove()

      // cool UI effect of undoing all the action visually in half-second increments
      // this mode blocks the user from doing anything while it happens
      if (this.currentMoves.length) this.gameState.mode = 'clear-history'
      await sleep(100)
    }

    this.recordState()
  }

  get size() {
    return this.currentMoves.length
  }

  saveState() {}

  recordState() {
    this.dispatchEvent(new CustomEvent('statechange'))
  }
}

export class Player {
  gameState: GameState
  board: Board
  coins = 0
  // treasureCards: TreasureCard[] = [] // imagine for now

  constructor(boardData: BoardData, gameState: GameState) {
    this.board = new Board(boardData, this, gameState)
  }
}
