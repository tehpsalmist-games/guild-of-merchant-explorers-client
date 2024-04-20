import { aghonData } from '../data/boards/aghon'
import { kazanData } from '../data/boards/kazan'
import { aveniaData } from '../data/boards/avenia'
import { cnidariaData } from '../data/boards/cnidaria'
import { Board, BoardData, Hex, Region } from './Board'
import { sleep } from '../utils'
import { ExplorerCard, ExplorerDeck } from './Cards'

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
  | 'user-prompt'
  | 'power-card'
  | 'picking-trade-route'
  | 'trading'
  | 'drawing-treasure'
  | 'clear-history'
  | 'wait-for-new-card'
  | 'game-over'

export class GameState {
  era = 0
  currentTurn = 0

  activePlayer: Player
  turnHistory: TurnHistory

  explorerDeck: ExplorerDeck

  constructor(boardName: BoardName) {
    this.activePlayer = new Player(getBoardData(boardName), this)
    this.turnHistory = new TurnHistory(this)

    this.explorerDeck = new ExplorerDeck()
    this.explorerDeck.shuffle()
  }

  startNextAge() {
    this.era++
    if (this.era > 3) {
      // game is over, total points from treasure cards and display all results
      this.era-- // reset to a valid era
      this.activePlayer.mode = 'game-over'
      this.activePlayer.message = 'Game Over!'
    } else {
      // only wipe the board if we're going to a new era, otherwise leave it up for satisfactory reviewing
      this.currentTurn = 0
      this.activePlayer.board.wipe()
      this.explorerDeck.prepareForNextEra()
    }
  }

  flipExplorerCard() {
    this.activePlayer.moveHistory.saveState()

    this.currentTurn++
    const [nextCard] = this.explorerDeck.drawCards()

    if (!nextCard) {
      this.startNextAge()
    } else {
      this.turnHistory.saveCardFlip(nextCard.id)
    }
  }
}

/**
 * represents the turn/flip of a single explorer card,
 * within which many indiviual moves (block placements) can be made
 */
export class TurnHistory {
  gameState: GameState

  // only storing the ids of the explorer cards because of the dynamic nature of the era cards
  era1: string[] = []
  era2: string[] = []
  era3: string[] = []
  era4: string[] = []

  constructor(gameState: GameState) {
    this.gameState = gameState
  }

  saveCardFlip(id: string) {
    switch (this.gameState.era) {
      case 0:
        this.era1.push(id)
      case 1:
        this.era2.push(id)
      case 2:
        this.era3.push(id)
      case 3:
        this.era4.push(id)
    }
  }
}

export class Player {
  gameState: GameState
  board: Board
  moveHistory: MoveHistory

  mode: GameMode = 'exploring'
  message = 'Explore!'

  coins = 0

  treasureCardsToDraw = 0 // use this value to increment when cards are earned, and decrement when they are drawn
  // treasureCards: TreasureCard[] = [] // imagine for now

  connectedTradePosts: Hex[] = []
  chosenRoute: Hex[] = []

  regionForVillage?: Region

  powerCards: ExplorerCard[] = []
  discardedPowerCards: ExplorerCard[] = []
  era4SelectedPowerCard: ExplorerCard

  constructor(boardData: BoardData, gameState: GameState) {
    this.board = new Board(boardData, this, gameState)
    this.moveHistory = new MoveHistory(this, gameState)
  }

  userPromptMode() {
    const hasTradePosts = this.connectedTradePosts.length > 1
    const hasVillage = this.regionForVillage
    const hasTreasureCards = this.treasureCardsToDraw > 0

    if (!hasTradePosts && !hasVillage && !hasTreasureCards) {
      this.exploringMode()
    }
    else if (hasTradePosts && !hasVillage && !hasTreasureCards) {
      this.pickingTradeRouteMode()
    }
    else if (!hasTradePosts && hasVillage && !hasTreasureCards) {
      this.villageMode()
    }
    else if (!hasTradePosts && !hasVillage && hasTreasureCards) {
      this.drawTreasureMode()
    }
    else {
      this.mode = 'user-prompt'
      this.message = 'Choose what to do next.'
    }
    
    this.moveHistory.recordState()
  }

  waitForNewCardMode() {
    this.mode = 'wait-for-new-card'
  }

  villageMode() {
    // auto place the only option
    if (this.regionForVillage?.villageCandidates.length === 1) {
      this.regionForVillage.villageCandidates[0].isVillage = true
      this.userPromptMode()
      return
    }

    this.mode = 'village'
    this.message = "You've explored the region! Choose where to build a village."
  }

  pickingTradeRouteMode() {
    if (this.connectedTradePosts.length === 2) {
      this.chosenRoute.push(this.connectedTradePosts[0], this.connectedTradePosts[1])
      this.tradingMode()
      return
    }

    this.mode = 'picking-trade-route'
    this.message = 'Pick two trading posts to trade between.'
    this.moveHistory.recordState()
  }

  tradingMode() {
    this.mode = 'trading'
    this.message = 'Complete the trade by picking a trading post to permanently cover.'
    this.moveHistory.recordState()
  }

  //TODO this will probably need to take a card as an argument at some point
  exploringMode() {
    this.mode = 'exploring'
    this.message = 'Explore!'
    this.moveHistory.recordState()
  }

  drawTreasureMode() {
    //this.mode = 'drawing-treasure'
    //this.message = 'Draw a treasure card!'
    this.treasureCardsToDraw--
    this.moveHistory.recordState()
    this.userPromptMode()
  }
}

/**
 * a move represents the result of a decision
 */
interface Move {
  hex: Hex
  action: GameMode
  tradingHex?: Hex
}

export class MoveHistory extends EventTarget {
  currentMoves: Move[] = []
  historicalMoves: Move[][][] = [[], [], [], []] // initialize the 4 eras with their empty lists, ready for individual turns
  gameState: GameState
  player: Player

  constructor(player: Player, gameState: GameState) {
    super()

    this.player = player
    this.gameState = gameState
  }

  doMove(hex: Hex) {
    const move: Move = { hex, action: this.player.mode }

    this.currentMoves.push(move)

    switch (move.action) {
      case 'exploring':
        hex.explore()
        this.player.userPromptMode()
        break
      case 'picking-trade-route':
        this.player.chosenRoute.push(hex)
        if (this.player.chosenRoute.length === 2) this.player.tradingMode()
        else this.player.pickingTradeRouteMode()
        break
      case 'trading':
        hex.isCovered = true

        //records the trading hex for undoing purposes
        if (this.player.chosenRoute[0] === hex) move.tradingHex = this.player.chosenRoute[1]
        else move.tradingHex = this.player.chosenRoute[0]

        //Adds coins that were just collected
        const coins = this.player.chosenRoute[0].tradingPostValue * this.player.chosenRoute[1].tradingPostValue
        this.player.coins += coins

        //clears the chosen route
        this.player.chosenRoute = []

        //removes the hex that was just covered
        const index = this.player.connectedTradePosts.indexOf(hex)
        this.player.connectedTradePosts.splice(index, 1)

        //determines whether or not you should continue trading or continue the game
        if (this.player.connectedTradePosts.length > 1) this.player.pickingTradeRouteMode()
        else {
          this.player.connectedTradePosts = []
          this.player.userPromptMode()
        }
        break
      case 'village':
        hex.isVillage = true
        this.player.coins += this.gameState.era + 1
        this.player.regionForVillage = undefined
        this.player.userPromptMode()
        break
      case 'drawing-treasure':
        //TODO add draw treasure logic
        hex.isCovered = true
        this.player.treasureCardsToDraw++
        //Completely blocks the ability to undo anything prior to drawing a treasure card
        this.currentMoves = []
        this.player.userPromptMode()
        break
    }

    this.recordState()
  }

  undoMove() {
    const undoing = this.currentMoves.pop()

    if (undoing) {
      switch (undoing.action) {
        case 'exploring':
          undoing.hex.unexplore()
          this.player.chosenRoute = []
          this.player.connectedTradePosts = []
          this.player.exploringMode()
          break
        case 'picking-trade-route':
          this.player.connectedTradePosts = undoing.hex.getConnectedTradingPosts()

          if (this.currentMoves.length > 1) {
            const previousMove = this.currentMoves[this.currentMoves.length - 1]
            if (previousMove.action === 'picking-trade-route') {
              this.player.chosenRoute = [previousMove.hex]
              this.player.pickingTradeRouteMode()
              break
            }
          }

          this.player.chosenRoute = []
          this.player.pickingTradeRouteMode()
          break
        case 'trading':
          undoing.hex.isCovered = false
          if (undoing.tradingHex) {
            this.player.coins -= undoing.tradingHex.tradingPostValue * undoing.hex.tradingPostValue
            this.player.connectedTradePosts = undoing.hex.getConnectedTradingPosts()
            this.player.chosenRoute = [undoing.hex, undoing.tradingHex]
            this.player.tradingMode()
          }
          break
        case 'village':
          undoing.hex.isVillage = false
          this.player.coins -= this.gameState.era + 1

          if (undoing.hex.region) {
            this.player.regionForVillage = undoing.hex.region
            this.player.villageMode()
          } else {
            //Theoretically, this else statement should never happen
            this.player.exploringMode()
          }
          break
        case 'drawing-treasure':
          //You can't undo drawing a treasure card. Once you draw a treasure card, the history is cleared.
          //This means it's not technically possible to hit this switch case.
          //But if you do hit this case, there will be a funny error message in the console.
          console.error('How did we get here?!?')
          this.player.drawTreasureMode()
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
      if (this.currentMoves.length) this.player.mode = 'clear-history'
      await sleep(100)
    }

    this.recordState()
  }

  get size() {
    return this.currentMoves.length
  }

  saveState() {
    // get any pre-existing moves (prior to treasure card draw, for example)
    const preexistingTurnMoves = this.historicalMoves[this.gameState.era][this.gameState.currentTurn] || []

    // insert these moves in the corresponding era/turn slot of the historical state for replay purposes
    this.historicalMoves[this.gameState.era][this.gameState.currentTurn] = preexistingTurnMoves.concat(
      this.currentMoves,
    )

    // clear move state
    this.currentMoves = []

    this.recordState()
  }

  recordState() {
    this.dispatchEvent(new CustomEvent('statechange'))
  }
}
