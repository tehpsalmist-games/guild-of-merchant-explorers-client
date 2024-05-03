import { aghonData } from '../data/boards/aghon'
import { kazanData } from '../data/boards/kazan'
import { aveniaData } from '../data/boards/avenia'
import { cnidariaData } from '../data/boards/cnidaria'
import { Board, BoardData, Hex, Region } from './Board'
import { randomSelection, sleep } from '../utils'
import { ExplorerCard, ExplorerDeck, GlobalExplorerCard, InvestigateDeck, TreasureCard, TreasureDeck } from './Cards'
import { objectives } from '../data/objectives'
import { Objective } from './Objective'
import { ScoreBoard } from './ScoreBoard'

export type BoardName = 'aghon' | 'avenia' | 'kazan' | 'cnidaria'

const getBoardData = (boardName: BoardName) => {
  switch (boardName) {
    case 'aghon':
      return { boardData: aghonData, objectives: randomSelection(objectives.aghon, 3) }
    case 'avenia':
      return { boardData: aveniaData, objectives: randomSelection(objectives.avenia, 3) }
    case 'kazan':
      return { boardData: kazanData, objectives: randomSelection(objectives.kazan, 3) }
    case 'cnidaria':
      return { boardData: cnidariaData, objectives: randomSelection(objectives.cnidaria, 3) }
  }
}

export class GameState extends EventTarget {
  boardName: string
  era = 0
  currentTurn = 0

  activePlayer: Player
  turnHistory: TurnHistory

  explorerDeck: ExplorerDeck
  currentExplorerCard: GlobalExplorerCard

  objectives: Objective[] = []

  investigateDeck: InvestigateDeck

  treasureDeck: TreasureDeck

  scoreBoard?: ScoreBoard

  constructor(boardName: BoardName) {
    super()

    this.boardName = boardName
    const setupData = getBoardData(boardName)

    this.objectives = setupData.objectives.map((algorithm) => new Objective(algorithm, this))

    this.activePlayer = new Player(setupData.boardData, this)
    this.turnHistory = new TurnHistory(this)

    this.investigateDeck = new InvestigateDeck()

    this.explorerDeck = new ExplorerDeck()

    this.treasureDeck = new TreasureDeck(this.activePlayer.board)

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
      this.activePlayer.addEndgameCoins()
      
      this.era-- // reset to a valid era
      this.activePlayer.mode = 'game-over'
      this.activePlayer.message = 'Game Over!'

      this.scoreBoard = new ScoreBoard(this)
    } else {
      // only wipe the board if we're going to a new era, otherwise leave it up for satisfactory reviewing
      this.currentTurn = 0
      this.activePlayer.board.wipe()
      this.activePlayer.freeExploreQuantity = 0
      this.explorerDeck.prepareForNextEra()

      this.flipExplorerCard()
    }

    this.emitStateChange()
  }

  flipExplorerCard() {
    // first things first: check objectives from last move now that all players have confirmed and are ready to advance
    for (const objective of this.objectives) {
      // in multiplayer we will obviously loop over all the players
      objective.checkAndScoreForPlayer(this.activePlayer)
    }

    this.activePlayer.moveHistory.saveState()
    this.activePlayer.cardPhase = 0

    // increment turn if we already have a card, otherwise, set to zero because it is start of an era
    this.currentTurn = this.currentExplorerCard ? this.currentTurn + 1 : 0

    const [nextCard] = this.explorerDeck.drawCards()
    this.currentExplorerCard = nextCard ?? null

    if (nextCard) {
      this.explorerDeck.useCard(nextCard.id)
      this.turnHistory.saveCardFlip(nextCard.id)
      this.activePlayer.freeExploreQuantity = 0

      // first era card flip, need to deal new ones to the player(s)
      if (this.currentExplorerCard.id === `era-${this.era + 1}`) {
        this.activePlayer.mode = 'choosing-investigate-card'

        this.dealInvestigateCards(this.activePlayer)
      }

      if (this.currentExplorerCard.id === 'era-2') {
        this.objectives[0].isFirstBlocked = true
      }

      if (this.currentExplorerCard.id === 'era-3') {
        this.objectives[0].isSecondBlocked = true
        this.objectives[1].isFirstBlocked = true
      }

      if (this.currentExplorerCard.id === 'era-any') {
        this.activePlayer.mode = 'choosing-investigate-card-reuse'
        this.objectives[1].isSecondBlocked = true
        this.objectives[2].isFirstBlocked = true
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
  | 'clearing-history'
  | 'game-over'

export class Player extends EventTarget {
  gameState: GameState
  board: Board
  moveHistory: MoveHistory

  mode: PlayerMode = 'exploring'
  message = 'Explore!'

  coins = 0

  treasureCardHex?: Hex
  treasureCardsToDraw = 0 // use this value to increment when cards are earned, and decrement when they are drawn
  treasureCards: TreasureCard[] = []

  connectedTradePosts: Hex[] = []
  chosenRoute: Hex[] = []
  finalizedTradingRoutes: Hex[][] = []

  regionForVillage?: Region

  investigateCardCandidates: [ExplorerCard, ExplorerCard] | null = null

  investigateCards: ExplorerCard[] = []
  discardedInvestigateCards: ExplorerCard[] = []
  era4SelectedInvestigateCard: ExplorerCard | null = null

  cardPhase = 0 // some cards have complex logic in 2 or more phases

  freeExploreQuantity = 0 //-1 means infinite

  constructor(boardData: BoardData, gameState: GameState) {
    super()

    this.gameState = gameState
    this.board = new Board(boardData, this, gameState)
    this.moveHistory = new MoveHistory(this, gameState)
  }

  addEndgameCoins() {
    let jarIndex = 0

    for (const card of this.treasureCards.filter((card) => !card.discard)) {
      this.coins += card.value(this.board)
      
      if (card.jarValue) {
        const data = card.jarValue(jarIndex)
        jarIndex = data.index
        this.coins += data.value
      }
    }
  }

  getTreasureJarValue() : number {
    let value = 0
    let index = 0
    
    for (const card of this.treasureCards.filter((c) => c.type === 'jarMultiplier')) {
      if (card.jarValue) {
        const data = card.jarValue(index)
        index = data.index
        value += data.value
      }
    }

    return value
  }

  chooseInvestigateCard(chosenCard: ExplorerCard) {
    if (!this.investigateCardCandidates) return

    const discardedCard = this.investigateCardCandidates.find((ic) => ic !== chosenCard)

    if (!discardedCard) return

    this.moveHistory.doMove({ action: 'choose-investigate-card', chosenCard, discardedCard })
  }

  chooseInvestigateCardForReuse(era: number) {
    this.moveHistory.doMove({ action: 'choose-investigate-card-reuse', era })
  }

  enterNextCardPhaseMode() {
    this.moveHistory.doMove({ action: 'advance-card-phase' })
    this.gameState.emitStateChange()
  }

  checkForUserDecision() {
    if (this.treasureCardsToDraw > 0) {
      this.enterDrawTreasureMode()
      return
    }

    //If there is only one village candidate, auto place the village, then check for user decision again
    if (this.regionForVillage?.villageCandidates.length === 1) {
      this.enterVillageMode()
      return
    }

    const hasTradePosts = this.connectedTradePosts.length > 1
    const needsVillage = !!this.regionForVillage
    const hasTreasureCards = !!this.treasureCardHex

    switch (true) {
      case !hasTradePosts && !needsVillage && !hasTreasureCards:
        this.enterExploringMode()
        break
      case hasTradePosts && !needsVillage && !hasTreasureCards:
        this.enterPickingTradeRouteMode()
        break
      case !hasTradePosts && needsVillage && !hasTreasureCards:
        this.enterVillageMode()
        break
      case !hasTradePosts && !needsVillage && hasTreasureCards:
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
    if (this.freeExploreQuantity > 0 || this.freeExploreQuantity === -1) {
      this.enterFreeExploringMode()
    }

    this.mode = 'exploring'
    this.message = this.gameState.currentExplorerCard?.rules(this)?.[this.cardPhase]?.message ?? 'Explore!'
    this.gameState.emitStateChange()
  }

  enterDrawTreasureMode() {
    if (this.treasureCardHex) {
      this.mode = 'user-prompting'
      this.message = 'Draw a treasure card!'
    } else {
      this.checkForUserDecision()
    }
  }

  enterFreeExploringMode() {
    this.mode = 'free-exploring'
    this.message = 'Explore anywhere!'
    this.gameState.emitStateChange()
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
      action: 'freely-explore'
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
      drawnTreasureID?: string
    }
  | {
      action: 'choose-investigate-card'
      chosenCard: ExplorerCard
      discardedCard: ExplorerCard
    }
  | {
      action: 'choose-investigate-card-reuse'
      era: number
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
        this.player.message =
          this.gameState.currentExplorerCard?.rules(this.player)?.[this.player.cardPhase]?.message ?? 'Explore!'
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
      case 'freely-explore':
        move.hex.explore()
        if (this.player.freeExploreQuantity > 0) {
          this.player.freeExploreQuantity--
        }
        this.player.checkForUserDecision()
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
        this.player.finalizedTradingRoutes.push(this.player.chosenRoute)
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
        //Applies the bonus from certain investigate cards
        if (this.player.treasureCardsToDraw === 0) {
          const bonus = this.gameState.currentExplorerCard.bonus(this.player)
          const multiplier = bonus?.type === 'treasure' ? bonus.multiplier : 1

          this.player.treasureCardsToDraw = multiplier
        }

        //Draws a treasure card and saves it's id to history
        const [treasureCard] = this.gameState.treasureDeck.drawCards()
        move.drawnTreasureID = treasureCard.id
        this.player.treasureCards.push(treasureCard)

        this.player.dispatchEvent(new CustomEvent('treasure-gained'))

        if (treasureCard.discard) {
          this.player.coins += treasureCard.value(this.player.board)
          this.gameState.treasureDeck.useCard(treasureCard.id)
        } else {
          this.gameState.treasureDeck.removeCard(treasureCard.id)
        }

        this.player.treasureCardsToDraw--
        //Completely blocks the ability to undo anything prior to drawing a treasure card
        this.saveState()

        //Unassigns the treasure card hex when all treasure cards have been drawn
        if (this.player.treasureCardsToDraw === 0) {
          this.player.treasureCardHex = undefined
        }

        //Performs immediate actions based on the treasure card drawn
        if (treasureCard.type === 'placeBlock') {
          this.player.enterFreeExploringMode()
          break
        }

        this.player.checkForUserDecision()
        break
      case 'choose-investigate-card':
        this.player.investigateCards.push(move.chosenCard)
        this.player.discardedInvestigateCards.push(move.discardedCard)
        this.player.investigateCardCandidates = null
        this.player.enterExploringMode()
        break
      case 'choose-investigate-card-reuse':
        this.player.era4SelectedInvestigateCard = this.player.investigateCards[move.era]
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
          this.gameState.currentExplorerCard?.rules(this.player)?.[this.player.cardPhase]?.message ?? 'Explore!'

          if (
            this.gameState.currentCardRules?.[this.player.cardPhase].limit ===
            this.getPlacedHexes()[this.player.cardPhase].length
          )
            this.undoMove()
          break
        case 'explore':
          undoing.hex.unexplore()
          this.player.checkForUserDecision()
          break
        case 'freely-explore':
          undoing.hex.unexplore()
          if (this.player.freeExploreQuantity > -1) {
            this.player.freeExploreQuantity++
          }
          this.player.enterFreeExploringMode()
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
            this.player.finalizedTradingRoutes.pop()
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

          //If there was only one village candidate, undoing the village placement should undo the explore action as well
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
          this.player.message = 'Choose an Investigate Card'
          break
        case 'choose-investigate-card-reuse':
          this.player.era4SelectedInvestigateCard = null
          this.player.mode = 'choosing-investigate-card-reuse'
          this.player.message = 'Choose an Investigate Card'
          break
      }
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
