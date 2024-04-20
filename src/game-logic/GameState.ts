import { aghonData } from '../data/boards/aghon'
import { kazanData } from '../data/boards/kazan'
import { aveniaData } from '../data/boards/avenia'
import { cnidariaData } from '../data/boards/cnidaria'
import { Board, BoardData, Hex, Region } from './Board'
import { sleep } from '../utils'
import { CardPlacementRules, ExplorerCard, ExplorerDeck, GlobalExplorerCard, InvestigateDeck } from './Cards'

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

export class GameState extends EventTarget {
  era = 0
  currentTurn = 0

  activePlayer: Player
  turnHistory: TurnHistory

  explorerDeck: ExplorerDeck
  currentExplorerCard: GlobalExplorerCard

  investigateDeck: InvestigateDeck

  constructor(boardName: BoardName) {
    super()

    this.activePlayer = new Player(getBoardData(boardName), this)
    this.turnHistory = new TurnHistory(this)

    this.investigateDeck = new InvestigateDeck()
    this.investigateDeck.shuffle()

    this.explorerDeck = new ExplorerDeck()
    this.explorerDeck.shuffle()

    // start game!
    this.flipExplorerCard()
  }

  get currentCardRules() {
    return this.currentExplorerCard?.rules(this.activePlayer)
  }

  startNextAge() {
    this.era++
    if (this.era > 3) {
      // game is over, TODO: total points from treasure cards and display all results

      this.era-- // reset to a valid era
      this.activePlayer.mode = 'game-over'
      this.activePlayer.message = 'Game Over!'
    } else {
      // only wipe the board if we're going to a new era, otherwise leave it up for satisfactory reviewing
      this.currentTurn = 0
      this.activePlayer.board.wipe()
      this.explorerDeck.prepareForNextEra()

      this.flipExplorerCard()
    }

    this.emitStateChange()
  }

  flipExplorerCard() {
    this.activePlayer.moveHistory.saveState()
    this.activePlayer.cardPhase = 0

    // increment turn if we already have a card, otherwise, set to zero because it is start of an era
    this.currentTurn = this.currentExplorerCard ? this.currentTurn + 1 : 0

    const [nextCard] = this.explorerDeck.drawCards()
    this.currentExplorerCard = nextCard ?? null

    if (nextCard) {
      this.explorerDeck.useCard(nextCard.id)
      this.turnHistory.saveCardFlip(nextCard.id)

      // first era card flip, need to deal new ones to the player(s)
      if (this.currentExplorerCard.id === `era-${this.era + 1}`) {
        this.activePlayer.mode = 'choosing-investigate-card'

        this.dealInvestigateCards(this.activePlayer)
      }

      if (this.currentExplorerCard.id === 'era-any') {
        this.activePlayer.mode = 'choosing-investigate-card-reuse'
      }

      this.activePlayer.message =
        this.currentExplorerCard.rules(this.activePlayer)?.[0].message ?? 'Choose an Investigate Card'
    } else {
      this.startNextAge()
    }

    this.emitStateChange()
  }

  // pass in the player to deal to, kind of preparing this method for multiplayer
  dealInvestigateCards(player: Player) {
    const [candidate1, candidate2] = this.investigateDeck.drawCards({ quantity: 2, recycle: true })

    this.investigateDeck.removeCard(candidate1.id)
    this.investigateDeck.removeCard(candidate2.id)

    player.investigateCardCandidates = [candidate1, candidate2]
  }

  emitStateChange() {
    this.dispatchEvent(new CustomEvent('statechange'))
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
        return this.era1.push(id)
      case 1:
        return this.era2.push(id)
      case 2:
        return this.era3.push(id)
      case 3:
        return this.era4.push(id)
    }
  }
}

export type PlayerMode =
  | 'exploring'
  | 'free-exploring' // treasure card block is "free" because it defies all rules
  | 'choosing-village'
  | 'user-prompting'
  | 'choosing-investigate-card'
  | 'choosing-investigate-card-reuse'
  | 'choosing-trade-route'
  | 'trading'
  | 'drawing-treasure'
  | 'clearing-history'
  | 'game-over'

export class Player {
  gameState: GameState
  board: Board
  moveHistory: MoveHistory

  mode: PlayerMode = 'exploring'
  message = 'Explore!'

  coins = 0

  treasureCardHex?: Hex
  //treasureCardsToDraw = 0 // use this value to increment when cards are earned, and decrement when they are drawn
  // treasureCards: TreasureCard[] = [] // imagine for now

  connectedTradePosts: Hex[] = []
  chosenRoute: Hex[] = []

  regionForVillage?: Region

  investigateCardCandidates: [ExplorerCard, ExplorerCard] | null = null

  investigateCards: ExplorerCard[] = []
  discardedInvestigateCards: ExplorerCard[] = []
  era4SelectedInvestigateCard: ExplorerCard

  cardPhase = 0 // some cards have complex logic in 2 or more phases

  constructor(boardData: BoardData, gameState: GameState) {
    this.gameState = gameState
    this.board = new Board(boardData, this, gameState)
    this.moveHistory = new MoveHistory(this, gameState)
  }

  chooseInvestigateCard(chosenCard: ExplorerCard) {
    if (!this.investigateCardCandidates) return

    const discardedCard = this.investigateCardCandidates.find((ic) => ic !== chosenCard)

    if (!discardedCard) return

    this.moveHistory.doMove({ action: 'choose-investigate-card', chosenCard, discardedCard })
  }

  enterNextCardPhaseMode() {
    this.moveHistory.doMove({ action: 'advance-card-phase' })
    this.gameState.emitStateChange()
  }

  checkForUserDecision() {
    if (this.regionForVillage?.villageCandidates.length === 1) {
      this.enterVillageMode()
    }

    const hasTradePosts = this.connectedTradePosts.length > 1
    const hasVillage = !!this.regionForVillage
    const hasTreasureCards = !!this.treasureCardHex

    switch (true) {
      case !hasTradePosts && !hasVillage && !hasTreasureCards:
        this.enterExploringMode()
        break
      case hasTradePosts && !hasVillage && !hasTreasureCards:
        this.enterPickingTradeRouteMode()
        break
      case !hasTradePosts && hasVillage && !hasTreasureCards:
        this.enterVillageMode()
        break
      case !hasTradePosts && !hasVillage && hasTreasureCards:
        this.enterDrawTreasureMode()
        break
      default:
        this.mode = 'user-prompting'
        this.message = 'Choose what to do next.'
    }

    this.gameState.emitStateChange()
  }

  enterVillageMode() {
    this.mode = 'choosing-village'
    this.message = "You've explored the region! Choose where to build a village."

    // auto place the only option
    if (this.regionForVillage?.villageCandidates.length === 1) {
      this.moveHistory.doMove({ action: 'choose-village', hex: this.regionForVillage.villageCandidates[0] })
    } else {
      this.gameState.emitStateChange()
    }
  }

  enterPickingTradeRouteMode() {
    if (this.connectedTradePosts.length === 2) {
      this.chosenRoute.push(this.connectedTradePosts[0], this.connectedTradePosts[1])
      this.enterTradingMode()
      return
    }

    this.mode = 'choosing-trade-route'
    this.message = 'Pick two trading posts to trade between.'
    this.gameState.emitStateChange()
  }

  enterTradingMode() {
    this.mode = 'trading'
    this.message = 'Complete the trade by picking a trading post to permanently cover.'
    this.gameState.emitStateChange()
  }

  enterExploringMode() {
    this.mode = 'exploring'
    this.message = this.gameState.currentExplorerCard?.rules(this)?.[this.cardPhase]?.message ?? 'Explore!'
    this.gameState.emitStateChange()
  }

  enterDrawTreasureMode() {
    if (this.treasureCardHex) {
      this.mode = 'drawing-treasure'
      this.message = 'Draw a treasure card!'

      this.moveHistory.doMove({ action: 'draw-treasure', hex: this.treasureCardHex })
    } else {
      this.checkForUserDecision()
    }
  }
}

/**
 * a move represents the result of a decision
 */
type Move =
  | {
      action: 'advance-card-phase'
    }
  | {
      action: 'explore'
      hex: Hex
    }
  | {
      action: 'choose-trade-route'
      hex: Hex
    }
  | {
      action: 'cover-tradepost'
      hex: Hex
      tradingHex: Hex
    }
  | {
      action: 'choose-village'
      hex: Hex
    }
  | {
      action: 'draw-treasure'
      hex: Hex
    }
  | {
      action: 'choose-investigate-card'
      chosenCard: ExplorerCard
      discardedCard: ExplorerCard
    }

export class MoveHistory {
  currentMoves: Move[] = []
  historicalMoves: Move[][][] = [[], [], [], []] // initialize the 4 eras with their empty lists, ready for individual turns
  gameState: GameState
  player: Player

  constructor(player: Player, gameState: GameState) {
    this.player = player
    this.gameState = gameState
  }

  doMove(move: Move) {
    this.currentMoves.push(move)

    switch (move.action) {
      case 'advance-card-phase':
        this.player.cardPhase++
        break
      case 'explore':
        move.hex.explore()

        if (
          this.gameState.currentCardRules?.[this.player.cardPhase + 1] &&
          this.gameState.currentCardRules?.[this.player.cardPhase].limit ===
            this.getPlacedHexes()[this.player.cardPhase].length
        ) {
          this.doMove({ action: 'advance-card-phase' })
        } else {
          this.player.checkForUserDecision()
        }

        break
      case 'choose-trade-route':
        this.player.chosenRoute.push(move.hex)

        if (this.player.chosenRoute.length === 2) {
          this.player.enterTradingMode()
        } else {
          this.player.enterPickingTradeRouteMode()
        }

        break
      case 'cover-tradepost':
        move.hex.isCovered = true

        //records the trading hex for undoing purposes
        if (this.player.chosenRoute[0] === move.hex) {
          move.tradingHex = this.player.chosenRoute[1]
        } else {
          move.tradingHex = this.player.chosenRoute[0]
        }

        //Adds coins that were just collected
        const coins = this.player.chosenRoute[0].tradingPostValue * this.player.chosenRoute[1].tradingPostValue
        this.player.coins += coins

        //clears the chosen route
        this.player.chosenRoute = []

        //removes the hex that was just covered
        const index = this.player.connectedTradePosts.indexOf(move.hex)
        this.player.connectedTradePosts.splice(index, 1)

        //determines whether or not you should continue trading or continue the game
        if (this.player.connectedTradePosts.length > 1) {
          this.player.enterPickingTradeRouteMode()
        } else {
          this.player.connectedTradePosts = []
          this.player.checkForUserDecision()
        }

        break
      case 'choose-village':
        move.hex.isVillage = true
        this.player.coins += this.gameState.era + 1
        this.player.regionForVillage = undefined
        this.player.checkForUserDecision()
        break
      case 'draw-treasure':
        this.player.treasureCardHex = undefined
        //Completely blocks the ability to undo anything prior to drawing a treasure card
        this.saveState()
        //TODO add do-treasure mode instead of checkForUserDecision here
        this.player.checkForUserDecision()
        break
      case 'choose-investigate-card':
        this.player.investigateCards.push(move.chosenCard)
        this.player.discardedInvestigateCards.push(move.discardedCard)
        this.player.investigateCardCandidates = null
        this.player.enterExploringMode()
        break
    }

    this.gameState.emitStateChange()
  }

  undoMove() {
    const undoing = this.currentMoves.pop()

    if (undoing) {
      switch (undoing.action) {
        case 'advance-card-phase':
          this.player.cardPhase--
          if (
            this.gameState.currentCardRules?.[this.player.cardPhase].limit ===
            this.getPlacedHexes()[this.player.cardPhase].length
          )
            this.undoMove()
          break
        case 'explore':
          undoing.hex.unexplore()
          this.player.chosenRoute = []
          this.player.connectedTradePosts = []
          this.player.checkForUserDecision()
          break
        case 'choose-trade-route':
          this.player.connectedTradePosts = undoing.hex.getConnectedTradingPosts()

          if (this.currentMoves.length > 1) {
            const previousMove = this.currentMoves[this.currentMoves.length - 1]
            if (previousMove.action === 'choose-trade-route') {
              this.player.chosenRoute = [previousMove.hex]
              this.player.enterPickingTradeRouteMode()
              break
            }
          }

          this.player.chosenRoute = []
          this.player.checkForUserDecision()
          break
        case 'cover-tradepost':
          undoing.hex.isCovered = false
          if (undoing.tradingHex) {
            this.player.coins -= undoing.tradingHex.tradingPostValue * undoing.hex.tradingPostValue
            this.player.connectedTradePosts = undoing.hex.getConnectedTradingPosts()
            this.player.chosenRoute = [undoing.hex, undoing.tradingHex]
            if (this.player.connectedTradePosts.length > 2) this.player.enterTradingMode()
            else this.player.checkForUserDecision()
          }
          break
        case 'choose-village':
          undoing.hex.isVillage = false
          this.player.coins -= this.gameState.era + 1

          if (!undoing.hex.region) {
            // Theoretically, this should never happen
            this.player.checkForUserDecision()
            break
          }

          if (undoing.hex.region.villageCandidates.length === 1) {
            this.undoMove()
          } else {
            this.player.regionForVillage = undoing.hex.region
            this.player.checkForUserDecision()
          }

          break
        case 'draw-treasure':
          //You can't undo drawing a treasure card. Once you draw a treasure card, the history is cleared.
          //This means it's not technically possible to hit this switch case.
          //But if you do hit this case, there will be a funny error message in the console.
          console.error('How did we get here?!?')
          this.player.treasureCardHex = undoing.hex
          this.player.enterDrawTreasureMode()
          break
        case 'choose-investigate-card':
          this.player.investigateCardCandidates = [
            this.player.investigateCards.pop()!,
            this.player.discardedInvestigateCards.pop()!,
          ]
          this.player.mode = 'choosing-investigate-card'
          break
      }
    } else {
      this.player.checkForUserDecision()
    }

    this.gameState.emitStateChange()
  }

  async undoAllMoves() {
    while (this.currentMoves.length) {
      this.undoMove()

      // cool UI effect of undoing all the action visually in half-second increments
      // this mode blocks the user from doing anything while it happens
      if (this.currentMoves.length) this.player.mode = 'clearing-history'
      await sleep(100)
    }

    this.gameState.emitStateChange()
  }

  /**
   * deduce the placed hexes for the current turn from the move history
   */
  getPlacedHexes() {
    const relevantMoves = (this.historicalMoves[this.gameState.era][this.gameState.currentTurn] || [])
      .concat(this.currentMoves)
      .filter((m) => m.action === 'explore' || m.action === 'advance-card-phase')

    const placedHexes: Hex[][] = [[]]

    for (const move of relevantMoves) {
      if (move.action === 'explore') {
        placedHexes[placedHexes.length - 1].push(move.hex)
      }

      if (move.action === 'advance-card-phase') {
        placedHexes.push([])
      }
    }

    return placedHexes
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
  }
}
