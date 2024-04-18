import { aghonData } from '../data/boards/aghon'
import { kazanData } from '../data/boards/kazan'
import { aveniaData } from '../data/boards/avenia'
import { cnidariaData } from '../data/boards/cnidaria'
import { Board, Hex, Region, TradeRoute } from './Board'
import { sleep } from '../utils'

export type GameMode =
  | 'exploring'
  | 'treasure-exploring'
  | 'village'
  | 'power-card'
  | 'picking-trade-start'
  | 'trading'
  | 'clear-history'
  | 'wait-for-new-card'

export class GameState {
  mode: GameMode = 'exploring'
  currentExplorerCard: 0
  message = 'Explore!'
  moveHistory: MoveHistory
  board: Board
  regionForVillage?: Region
  tradeRoute?: TradeRoute

  constructor() {
    this.moveHistory = new MoveHistory()
    this.board = new Board(cnidariaData)

    this.moveHistory.gameState = this
    this.board.gameState = this
  }

  startNextAge() {
    this.board.wipe()
    //TODO undraw all cards here
    //TODO add next age card to the deck
    //TODO finish the game if age 5

    //You shouldn't be able to undo things in the previous ages, so we clear the history here.
    this.moveHistory.moveHistory = []
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
    }
    else {
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
  action:
  | 'explored'
  | 'pick-trade-start'
  | 'do-trade'
  | 'village'
  | 'draw-treasure'
  | 'do-treasure'
}

export class MoveHistory extends EventTarget {
  moveHistory: Move[] = []
  gameState: GameState

  doMove(move: Move) {
    this.moveHistory.push(move)

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
        }
        else{
          this.gameState.tradeRoute = undefined
          this.gameState.exploringMode()
        }
        break
      case 'village':
        move.hex.isVillage = true
        this.gameState.exploringMode()
        break
      case 'draw-treasure':
        //TODO add draw treasure logic
        move.hex.isCovered = true
        //Completely blocks the ability to undo anything prior to drawing a treasure card
        this.moveHistory = []
        break
    }

    this.recordState()
  }

  undoMove() {
    const undoing = this.moveHistory.pop()

    if (undoing) {
      switch (undoing.action) {
        case 'explored':
          // TODO: we have a bug where auto-placed villages don't undo. We'd need to handle that here.
          // something like hex.unexplore(), which can trigger region.unexplore() and land.unexplore(), I think?
          undoing.hex.isExplored = false
          this.gameState.exploringMode()
          break
        case 'do-trade':
          undoing.hex.isCovered = false
          //TODO add undo trade logic
          this.gameState.exploringMode()
          break
        case 'village':
          undoing.hex.isVillage = false
          if (undoing.hex.region) this.gameState.villageMode(undoing.hex.region)
          else this.gameState.exploringMode()
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
    while (this.moveHistory.length) {
      this.undoMove()

      // cool UI effect of undoing all the action visually in half-second increments
      // this mode blocks the user from doing anything while it happens
      if (this.moveHistory.length) this.gameState.mode = 'clear-history'
      await sleep(100)
    }

    // this will always be the mode we return to, I'm 99% sure of it.
    //TODO does this account for treasure cards clearing history? The if statement I added would let undoMove set it to what the last item in history was.
    //this.gameState.exploringMode()
    this.recordState()
  }

  recordState() {
    this.dispatchEvent(new CustomEvent('statechange'))
  }
}
