import { aghonData } from '../data/boards/aghon'
import { kazanData } from '../data/boards/kazan'
import { aveniaData } from '../data/boards/avenia'
import { cnidariaData } from '../data/boards/cnidaria'
import { Board, Hex, Region, SerializedHex } from './Board'
import { randomSelection, sleep } from '../utils'
import {
  ExplorerCard,
  ExplorerDeck,
  InvestigateCard,
  InvestigateDeck,
  InvestigateHand,
  SerializedCard,
  SerializedDeck,
  SerializedExplorerDeck,
  SerializedHand,
  TreasureCard,
  TreasureDeck,
  TreasureHand,
} from './Cards'
import { objectives } from '../data/objectives'
import { Objective, SerializedObjective } from './Objective'
import { ScoreBoard } from './ScoreBoard'
import { northProyliaData } from '../data/boards/north-proylia'
import { xawskilData } from '../data/boards/xawskil'
import { investigateCardDataLookup } from '../data/cards/investigate-cards'
import { cardFlipSFX, crystalSFX, placeBlockSFX, towerSFX, tradeSFX, treasureSFX, villageSFX } from '../audio'
import { explorerCardDataMapping } from '../data/cards/explorer-cards'

export type BoardName = 'aghon' | 'avenia' | 'kazan' | 'cnidaria' | 'northProylia' | 'xawskil'

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
    case 'northProylia':
      return northProyliaData
    case 'xawskil':
      return xawskilData
  }
}

export interface SerializedGameState {
  boardName: BoardName
  activePlayer: string
  players: SerializedPlayer[]
  turnHistory: SerializedTurnHistory
  objectives: SerializedObjective[]
  explorerDeck: SerializedExplorerDeck
  investigateDeck: SerializedDeck
  treasureDeck: SerializedDeck
  era: number
  currentTurn: number
  soloMode: boolean
  currentExplorerCard: SerializedCard | null
}

export class GameState extends EventTarget {
  boardName: BoardName

  era = 0
  currentTurn = 0

  players: Player[]
  activePlayer: Player

  turnHistory: TurnHistory

  explorerDeck: ExplorerDeck
  currentExplorerCard: ExplorerCard | null

  objectives: Objective[] = []

  investigateDeck: InvestigateDeck

  treasureDeck: TreasureDeck

  scoreBoard?: ScoreBoard

  serializationTimeout = 0
  lastEmittedSerializedState = ''

  soloMode = true

  constructor(boardName: BoardName, numberOfPlayers = 1, serializedData?: SerializedGameState) {
    super()

    if (serializedData) {
      this.boardName = serializedData.boardName
      this.fromJSON(serializedData)
    } else {
      this.boardName = boardName
      this.newGame()
    }
  }

  newGame(numberOfPlayers = 1) {
    this.objectives = randomSelection(objectives[this.boardName], 3).map((algorithm) => new Objective(algorithm, this))

    // make this dynamic for actual multiplayer
    this.players = [new Player('solo', this)]
    this.activePlayer = this.players[0]

    this.turnHistory = new TurnHistory(this)

    this.investigateDeck = new InvestigateDeck()
    this.investigateDeck.shuffle()

    this.explorerDeck = new ExplorerDeck()
    this.explorerDeck.shuffle()

    this.treasureDeck = new TreasureDeck()
    this.treasureDeck.shuffle()

    // start game!
    this.flipExplorerCard()
  }

  startNextAge() {
    this.era++
    if (this.era > 3) {
      this.activePlayer.addEndgameCoins()

      this.scoreBoard = new ScoreBoard(this.activePlayer)
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

  playerReady(p: Player) {
    // for multiplayer, iterate over all players to verify they are ready
    if (this.activePlayer === p) {
      this.flipExplorerCard()
    }
  }

  flipExplorerCard() {
    // first things first: check objectives from last move now that all players have confirmed and are ready to advance
    this.checkObjectives()

    // increment turn if we already have a card, otherwise, set to zero because it is start of an era
    this.currentTurn = this.currentExplorerCard ? this.currentTurn + 1 : 0

    const [nextCard] = this.explorerDeck.drawCards()
    this.currentExplorerCard = nextCard ?? null

    if (this.currentExplorerCard) {
      this.explorerDeck.discard(nextCard)
      this.turnHistory.saveCardFlip(nextCard.id)

      // first era card flip, need to deal new ones to the player(s)
      if (this.currentExplorerCard.id === `era-${this.era + 1}`) {
        this.dealInvestigateCards(this.activePlayer)
        this.activePlayer.determinePlayerMode()
      }

      this.blockObjectives()
    } else {
      this.startNextAge()
    }

    this.emitStateChange()
  }

  checkObjectives() {
    for (const objective of this.objectives) {
      // in multiplayer we will obviously loop over all the players
      objective.checkAndScoreForPlayer(this.activePlayer)
    }
  }

  blockObjectives() {
    if (!this.soloMode || !this.currentExplorerCard) return

    if (this.currentExplorerCard.id === 'era-2') {
      this.objectives[0].isFirstBlocked = true
    }

    if (this.currentExplorerCard.id === 'era-3') {
      this.objectives[0].isSecondBlocked = true
      this.objectives[1].isFirstBlocked = true
    }

    if (this.currentExplorerCard.id === 'era-any') {
      this.objectives[1].isSecondBlocked = true
      this.objectives[2].isFirstBlocked = true
    }
  }

  // pass in the player to deal to, kind of preparing this method for multiplayer
  dealInvestigateCards(player: Player) {
    const [candidate1, candidate2] = this.investigateDeck.drawCards({ quantity: 2, recycle: true })

    player.investigateCardCandidates = [candidate1, candidate2]
  }

  emitStateChange() {
    this.dispatchEvent(new CustomEvent('onstatechange'))
    this.enqueueSerialization()
  }

  emitSerializationUpdate(serializedData: string) {
    this.dispatchEvent(new CustomEvent('onserialize', { detail: { serializedData } }))
  }

  enqueueSerialization() {
    clearTimeout(this.serializationTimeout)

    this.serializationTimeout = setTimeout(
      () => {
        const savedState = JSON.stringify(this)

        if (savedState !== this.lastEmittedSerializedState) {
          this.lastEmittedSerializedState = savedState
          this.emitSerializationUpdate(savedState)
        }
      },
      // wait, but not too long, really just want to let the stack clear to avoid unnecessary serializations.
      // to be honest, 0 could do the trick too, because of how the event loop works.
      16,
    )
  }

  /**
   * JSON.stringify will use this method if available
   */
  toJSON(): SerializedGameState {
    return {
      boardName: this.boardName,
      activePlayer: this.activePlayer.id,
      players: this.players as SerializedPlayer[],
      turnHistory: this.turnHistory,
      objectives: this.objectives,
      explorerDeck: this.explorerDeck,
      investigateDeck: this.investigateDeck,
      treasureDeck: this.treasureDeck,
      era: this.era,
      currentTurn: this.currentTurn,
      soloMode: this.soloMode,
      currentExplorerCard: this.currentExplorerCard,
    }
  }

  fromJSON(data: SerializedGameState) {
    this.turnHistory = new TurnHistory(this, data.turnHistory)
    this.objectives = data.objectives.map(
      (od) => new Objective(objectives[this.boardName].find((o) => od.id === o.id)!, this, od),
    )
    this.explorerDeck = new ExplorerDeck(data.explorerDeck)
    this.investigateDeck = new InvestigateDeck(data.investigateDeck)
    this.treasureDeck = new TreasureDeck(data.treasureDeck)

    this.era = data.era
    this.currentTurn = data.currentTurn
    this.soloMode = data.soloMode

    this.currentExplorerCard = data.currentExplorerCard
      ? new ExplorerCard(explorerCardDataMapping[data.currentExplorerCard.id])
      : null

    // must do this last to replay state properly
    this.players = data.players.map((d) => new Player(d.id, this, d.moveHistory))
    const activePlayer = this.players.find((p) => p.id === data.activePlayer)

    if (!activePlayer) throw new Error('Player data out of sync:')

    this.activePlayer = activePlayer
  }
}

export interface SerializedTurnHistory {
  era1: string[]
  era2: string[]
  era3: string[]
  era4: string[]
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

  constructor(gameState: GameState, serializedData?: SerializedTurnHistory) {
    this.gameState = gameState

    if (serializedData) {
      this.era1 = serializedData.era1
      this.era2 = serializedData.era2
      this.era3 = serializedData.era3
      this.era4 = serializedData.era4
    }
  }

  saveCardFlip(explorerCardId: string) {
    switch (this.gameState.era) {
      case 0:
        return this.era1.push(explorerCardId)
      case 1:
        return this.era2.push(explorerCardId)
      case 2:
        return this.era3.push(explorerCardId)
      case 3:
        return this.era4.push(explorerCardId)
    }
  }

  toJSON(): SerializedTurnHistory {
    return {
      era1: this.era1,
      era2: this.era2,
      era3: this.era3,
      era4: this.era4,
    }
  }
}

export interface SerializedPlayer {
  id: string
  moveHistory: SerializedMoveHistory
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
  | 'treasure-to-draw'

export class Player extends EventTarget {
  id: string
  gameState: GameState
  board: Board
  moveHistory: MoveHistory

  replayableMoveHistory?: MoveHistory
  replaying = false
  replayingExplorerCard?: ExplorerCard

  mode: PlayerMode = 'exploring'

  coins = 0

  treasureCardsToDraw = 0 // use this value to increment when cards are earned, and decrement when they are drawn
  treasureCards: TreasureHand

  connectedTradePosts: Hex[] = []
  chosenRoute: Hex[] = []
  finalizedTradingRoutes: Hex[][] = []

  regionForVillage?: Region

  investigateCardCandidates: [InvestigateCard, InvestigateCard] | null = null

  investigateCards: InvestigateHand
  era4SelectedInvestigateCard: InvestigateCard | null = null

  cardPhase = 0 // some cards have complex logic in 2 or more phases

  freeExploreQuantity = 0

  constructor(id: string, gameState: GameState, serializedMoveHistory?: SerializedMoveHistory) {
    super()

    this.id = id

    this.gameState = gameState
    this.board = new Board(getBoardData(this.gameState.boardName), this, this.gameState)

    this.replayableMoveHistory = new MoveHistory(this, this.gameState, serializedMoveHistory)

    this.newGame()
  }

  setMode(mode: PlayerMode) {
    this.mode = mode
    this.gameState.emitStateChange()
  }

  newGame() {
    this.moveHistory = new MoveHistory(this, this.gameState)

    this.treasureCards = new TreasureHand(this)
    this.investigateCards = new InvestigateHand(this)
  }

  get currentExplorerCard(): ExplorerCard | null {
    if (this.replaying && this.replayingExplorerCard) {
      return this.replayingExplorerCard
    }

    return this.gameState.currentExplorerCard
  }

  get currentCardRules() {
    return this.currentExplorerCard?.rules(this)
  }

  replayMoves() {
    this.replaying = true

    // iterate through moves
    this.replayableMoveHistory?.historicalMoves.forEach((era, i) => {
      era.forEach((turn, j) => {
        const cardId = this.gameState.turnHistory[`era${i + 1}`]?.[j]

        if (!cardId) {
          throw new Error('corrupted data')
        }

        this.replayingExplorerCard = new ExplorerCard(explorerCardDataMapping[cardId])

        turn.forEach((move) => {
          this.moveHistory.doMove(move)
        })
      })
    })

    this.replayingExplorerCard = undefined

    this.replayableMoveHistory?.currentMoves.forEach((move) => {
      this.moveHistory.doMove(move)
    })

    // add up treasure card coins earned
    this.coins = this.treasureCards.cards.filter((c) => c.card.type === 'twoCoins').length * 2

    // add up objectives earned
    this.gameState.objectives.forEach((objective) => {
      if (objective.firstPlayers.includes(this)) {
        this.coins += objective.firstPlaceReward
      }

      if (objective.secondPlayers.includes(this)) {
        this.coins += objective.secondPlaceReward
      }
    })

    this.replaying = false
    this.replayableMoveHistory = undefined

    this.gameState.emitStateChange()
  }

  reportDone() {
    if (!this.replaying) {
      this.gameState.playerReady(this)
    }
  }

  determinePlayerMode() {
    const hasTradePosts = this.connectedTradePosts.length > 1
    const needsVillage = !!this.regionForVillage
    const hasTreasureCards = this.treasureCardsToDraw > 0

    switch (true) {
      case this.gameState.era > 3:
        return this.setMode('game-over')
      case !!this.investigateCardCandidates:
        return this.setMode('choosing-investigate-card')
      case this.currentExplorerCard?.id === 'era-any' && !this.era4SelectedInvestigateCard:
        return this.setMode('choosing-investigate-card-reuse')
      case this.chosenRoute.length === 2:
        return this.setMode('trading')
      case !!this.freeExploreQuantity:
        return this.setMode('free-exploring')
      case !hasTradePosts && !needsVillage && !hasTreasureCards:
        return this.setMode('exploring')
      case hasTradePosts && !needsVillage && !hasTreasureCards:
        if (this.connectedTradePosts.length === 2) {
          this.chosenRoute.push(this.connectedTradePosts[0], this.connectedTradePosts[1])
          return this.setMode('trading')
        }

        return this.setMode('choosing-trade-route')
      case !hasTradePosts && needsVillage && !hasTreasureCards:
        return this.setMode('choosing-village')
      case !hasTradePosts && !needsVillage && hasTreasureCards:
        return this.setMode('treasure-to-draw')
      default:
        return this.setMode('user-prompting')
    }
  }

  selectMove(move: Move, recursive = false) {
    const autoMoves = this.moveHistory.doMove(move)

    for (const am of autoMoves) {
      this.selectMove(am, true)
    }

    if (!recursive) {
      this.determinePlayerMode()
    }
  }

  selectUndo(all = false) {
    if (all) {
      this.moveHistory.undoAllMoves()
    } else {
      while (this.moveHistory.undoMove()) {}
    }

    this.determinePlayerMode()
    this.gameState.emitStateChange()
  }

  addEndgameCoins() {
    this.coins += this.treasureCards.getCoinTotal()

    this.coins += this.board.getXawskilCoins()
  }

  toJSON(): SerializedPlayer {
    return {
      id: this.id,
      moveHistory: this.moveHistory as SerializedMoveHistory,
    }
  }
}

export interface SerializedMove {
  action: Move['action']
  hex?: SerializedHex
  tradingHex?: SerializedHex
  era?: number
  chosenCard?: SerializedCard
  discardedCard?: SerializedCard
}

/**
 * a move represents the result of a decision
 */
type Move =
  | {
      action: 'advance-card-phase'
      auto?: boolean
    }
  | {
      action: 'explore'
      hex: Hex
      auto?: boolean
    }
  | {
      action: 'freely-explore'
      hex: Hex
    }
  | {
      action: 'choose-trade-route'
      hex: Hex
      auto?: boolean
    }
  | {
      action: 'cover-tradepost'
      hex: Hex
      tradingHex: Hex
    }
  | {
      action: 'choose-village'
      hex: Hex
      auto?: boolean
    }
  | {
      action: 'draw-treasure'
      treasureCard: TreasureCard
    }
  | {
      action: 'choose-investigate-card'
      chosenCard: InvestigateCard
      discardedCard: InvestigateCard
    }
  | {
      action: 'choose-investigate-card-reuse'
      era: number
    }
  | {
      action: 'discover-tower'
      hex: Hex
      auto?: boolean
    }
  | {
      action: 'discover-ruin'
      hex: Hex
      auto?: boolean
    }
  | {
      action: 'discover-crystal'
      hex: Hex
      auto?: boolean
    }
  | {
      action: 'discover-land'
      hex: Hex
      auto?: boolean
    }
  | {
      action: 'confirm-turn'
    }

export interface SerializedMoveHistory {
  historicalMoves: SerializedMove[][][]
  currentMoves: SerializedMove[]
}

export class MoveHistory {
  currentMoves: Move[] = []
  historicalMoves: Move[][][] = [[], [], [], []] // initialize the 4 eras with their empty lists, ready for individual turns
  gameState: GameState
  player: Player

  constructor(player: Player, gameState: GameState, serializedData?: SerializedMoveHistory) {
    this.player = player
    this.gameState = gameState

    if (serializedData) {
      this.historicalMoves = serializedData.historicalMoves.map((hm) =>
        hm.map((t) => t.map((sm) => this.moveFromJSON(sm))),
      )
      this.currentMoves = serializedData.currentMoves.map((sm) => this.moveFromJSON(sm))
    }
  }

  moveFromJSON(sm: SerializedMove) {
    const move = {
      action: sm.action,
    } as Move

    switch (move.action) {
      case 'cover-tradepost':
        if (sm.tradingHex) {
          move.tradingHex = this.player.board.getHex(sm.tradingHex.row, sm.tradingHex.column)!
        }
      case 'explore':
      case 'freely-explore':
      case 'choose-trade-route':
      case 'choose-village':
      case 'discover-tower':
      case 'discover-crystal':
      case 'discover-land':
      case 'discover-ruin':
        if (sm.hex) {
          move.hex = this.player.board.getHex(sm.hex.row, sm.hex.column)!
        }
        break
      case 'choose-investigate-card-reuse':
        if (sm.era != null) {
          move.era = sm.era
        }
        break
      case 'choose-investigate-card':
        if (sm.chosenCard) {
          move.chosenCard = new InvestigateCard(investigateCardDataLookup[sm.chosenCard.id])
        }
        if (sm.discardedCard) {
          move.discardedCard = new InvestigateCard(investigateCardDataLookup[sm.discardedCard.id])
        }
        break
      case 'draw-treasure':
        // should take in the card drawn
        break
      case 'advance-card-phase':

      default:
        break
    }

    return move
  }

  doMove(move: Move) {
    this.currentMoves.push(move)

    const nextMoves: Move[] = []

    switch (move.action) {
      case 'advance-card-phase':
        this.player.cardPhase++

        break
      case 'explore':
        move.hex.explore()
        this.playAudio(placeBlockSFX)

        if (
          this.player.currentCardRules?.[this.player.cardPhase + 1] &&
          this.player.currentCardRules?.[this.player.cardPhase].limit ===
            this.getPlacedHexes()[this.player.cardPhase].size
        ) {
          nextMoves.push({ action: 'advance-card-phase', auto: true })
        }

        // auto-handle actions that don't require user decisions
        if (!move.hex.isCovered) {
          if (move.hex.isTower) {
            nextMoves.push({ action: 'discover-tower', hex: move.hex, auto: true })
          }

          if (move.hex.crystalValue) {
            nextMoves.push({ action: 'discover-crystal', hex: move.hex, auto: true })
          }

          if (move.hex.isRuin) {
            nextMoves.push({ action: 'discover-ruin', hex: move.hex, auto: true })
          }
        }

        if (move.hex.land && !move.hex.land.hasBeenReached) {
          nextMoves.push({ action: 'discover-land', hex: move.hex, auto: true })
        }

        //If there is only one village candidate, auto place the village
        if (this.player.regionForVillage?.villageCandidates.length === 1) {
          nextMoves.push({
            action: 'choose-village',
            hex: this.player.regionForVillage.villageCandidates[0],
            auto: true,
          })
        }

        break
      case 'freely-explore':
        if (this.player.freeExploreQuantity > 0) {
          this.player.freeExploreQuantity--
        }

        nextMoves.push({ action: 'explore', hex: move.hex, auto: true })

        break
      case 'discover-tower':
        move.hex.isCovered = true
        const towers = this.player.board.getFlatHexes().filter((h) => h.isTower && h.isCovered)

        if (towers.length === 1) {
          this.player.coins += 6
        } else if (towers.length === 2) {
          this.player.coins += 8
        } else if (towers.length === 3) {
          this.player.coins += 10
        } else if (towers.length === 4) {
          this.player.coins += 14
        }

        this.playAudio(towerSFX)
        break
      case 'discover-ruin':
        move.hex.isCovered = true

        // Apply the bonus from certain investigate cards
        const bonus = this.player.currentExplorerCard?.bonus(this.player)
        const multiplier = bonus?.type === 'treasure' ? bonus.multiplier : 1

        this.player.treasureCardsToDraw += multiplier

        break
      case 'discover-crystal':
        move.hex.isCovered = true

        const crystalValueSum = this.player.board
          .getFlatHexes()
          .filter((h) => h.crystalValue && h.isCovered)
          .reduce((sum, h) => sum + h.crystalValue, 0)

        this.player.coins += crystalValueSum

        this.playAudio(crystalSFX)

        break
      case 'discover-land':
        if (move.hex.land) {
          move.hex.land.hasBeenReached = true
        }

        break
      case 'choose-trade-route':
        this.player.chosenRoute.push(move.hex)

        break
      case 'cover-tradepost':
        move.hex.isCovered = true

        // Add coins that were just collected
        this.player.coins += this.player.chosenRoute[0].tradingPostValue * this.player.chosenRoute[1].tradingPostValue

        // clear the chosen route
        this.player.finalizedTradingRoutes.push(this.player.chosenRoute)
        this.player.chosenRoute = []
        this.playAudio(tradeSFX)

        // removes the hex that was just covered
        const index = this.player.connectedTradePosts.indexOf(move.hex)
        this.player.connectedTradePosts.splice(index, 1)

        // not enough connected trading posts left, discard the remaining one
        if (this.player.connectedTradePosts.length === 1) {
          this.player.connectedTradePosts = []
        }

        break
      case 'choose-village':
        move.hex.isVillage = true

        this.player.coins += this.gameState.era + 1
        this.player.regionForVillage = undefined

        break
      case 'draw-treasure':
        this.player.treasureCards.addCard(move.treasureCard, move.treasureCard.discard)

        if (move.treasureCard.type === 'twoCoins') {
          this.player.coins += move.treasureCard.value(this.player.board)
        }

        if (move.treasureCard.type === 'placeBlock') {
          this.player.freeExploreQuantity++
        }

        this.player.treasureCardsToDraw--
        //Completely blocks the ability to undo anything prior to drawing a treasure card
        this.lockInMoveState()

        this.player.dispatchEvent(new CustomEvent('treasure-gained'))

        break
      case 'choose-investigate-card':
        this.player.investigateCards.addCard(move.chosenCard, false)
        this.player.investigateCards.addCard(move.discardedCard, true)
        this.player.investigateCardCandidates = null

        break
      case 'choose-investigate-card-reuse':
        this.player.era4SelectedInvestigateCard = this.player.investigateCards.keptCards[move.era]

        break
      case 'confirm-turn':
        this.lockInMoveState()
        this.player.cardPhase = 0

        this.player.reportDone()

        break
    }

    this.gameState.emitStateChange()

    return nextMoves
  }

  undoMove(): boolean {
    const undoing = this.currentMoves.pop()

    if (undoing) {
      switch (undoing.action) {
        case 'advance-card-phase':
          this.player.cardPhase--

          break
        case 'explore':
          undoing.hex.unexplore()

          this.player.chosenRoute = []
          this.player.connectedTradePosts = []

          break
        case 'freely-explore':
          undoing.hex.unexplore()
          this.player.freeExploreQuantity++

          break
        case 'discover-tower':
          const towers = undoing.hex.board.getFlatHexes().filter((h) => h.isTower && h.isCovered)

          if (towers.length === 1) {
            this.player.coins -= 6
          } else if (towers.length === 2) {
            this.player.coins -= 8
          } else if (towers.length === 3) {
            this.player.coins -= 10
          } else if (towers.length === 4) {
            this.player.coins -= 14
          }

          undoing.hex.isCovered = false

          break
        case 'discover-crystal':
          const crystalValueSum = this.player.board
            .getFlatHexes()
            .filter((h) => h.crystalValue && h.isCovered)
            .reduce((sum, h) => sum + h.crystalValue, 0)

          this.player.board.player.coins -= crystalValueSum

          undoing.hex.isCovered = false

          break
        case 'discover-ruin':
          // un-apply based on the bonus from certain investigate cards
          const bonus = this.player.currentExplorerCard?.bonus(this.player)
          const multiplier = bonus?.type === 'treasure' ? bonus.multiplier : 1

          this.player.treasureCardsToDraw -= multiplier

          undoing.hex.isCovered = false
          break
        case 'discover-land':
          if (undoing.hex.land) {
            undoing.hex.land.hasBeenReached = false
          }

          break
        case 'choose-trade-route':
          this.player.connectedTradePosts = undoing.hex.getConnectedTradingPosts()

          this.player.chosenRoute = this.player.chosenRoute.filter((h) => h !== undoing.hex)

          break
        case 'cover-tradepost':
          undoing.hex.isCovered = false
          if (undoing.tradingHex) {
            this.player.coins -= undoing.tradingHex.tradingPostValue * undoing.hex.tradingPostValue
            this.player.connectedTradePosts = undoing.hex.getConnectedTradingPosts()
            this.player.chosenRoute = [undoing.hex, undoing.tradingHex]
            this.player.finalizedTradingRoutes.pop()
          }

          break
        case 'choose-village':
          undoing.hex.isVillage = false
          this.player.coins -= this.gameState.era + 1

          //If there was only one village candidate, undoing the village placement should undo the explore action as well
          if (undoing.hex.region && undoing.hex.region.villageCandidates.length !== 1) {
            this.player.regionForVillage = undoing.hex.region
          }

          break
        case 'draw-treasure':
          //You can't undo drawing a treasure card. Once you draw a treasure card, the history is cleared.
          //This means it's not technically possible to hit this switch case.
          //But if you do hit this case, there will be a funny error message in the console.
          console.error("Sorry! You can't undraw a treasure card!")

          break
        case 'choose-investigate-card':
          this.player.investigateCardCandidates = this.player.investigateCards.undoCardSelection()

          break
        case 'choose-investigate-card-reuse':
          this.player.era4SelectedInvestigateCard = null

          break
        case 'confirm-turn':
          console.error("Sorry! You've crossed the point of no return!")

          break
      }
    }

    return !!(undoing as any)?.auto
  }

  async undoAllMoves() {
    while (this.currentMoves.length) {
      this.undoMove()

      // cool UI effect of undoing all the action visually in half-second increments
      // this mode blocks the user from doing anything while it happens
      if (this.currentMoves.length) {
        this.player.setMode('clearing-history')
      }

      await sleep(100)
    }
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

    return placedHexes.map((hexes, i) => {
      const iceCount = hexes.filter((h) => h.isIce).length

      const totalSize = hexes.length
      const iceSize = hexes.length + iceCount

      const ruleIsWild = this.player.currentCardRules?.[i].terrains.some((t) => t.terrain === 'wild')

      return { hexes, size: ruleIsWild ? totalSize : iceSize, affectedByIce: !ruleIsWild }
    })
  }

  get size() {
    return this.currentMoves.length
  }

  playAudio(sfx: HTMLAudioElement) {
    if (this.player.replaying) {
      return
    }

    //restarts the audio if it's already playing
    sfx.currentTime = 0

    sfx.play()
  }

  lockInMoveState() {
    // make sure to properly select and discard the two newly dealt investigate cards
    // if they are still in play in the current moves
    const investigateCardChoice = this.currentMoves.find((m) => m.action === 'choose-investigate-card')

    if (investigateCardChoice?.action === 'choose-investigate-card') {
      this.gameState.investigateDeck.discard(investigateCardChoice.discardedCard)
    }

    // get any pre-existing moves (prior to treasure card draw, for example)
    const preexistingTurnMoves = this.historicalMoves[this.gameState.era][this.gameState.currentTurn] || []

    // insert these moves in the corresponding era/turn slot of the historical state for replay purposes
    this.historicalMoves[this.gameState.era][this.gameState.currentTurn] = preexistingTurnMoves.concat(
      this.currentMoves,
    )

    // clear move state
    this.currentMoves = []
  }

  toJSON(): SerializedMoveHistory {
    return {
      historicalMoves: this.historicalMoves as SerializedMove[][][],
      currentMoves: this.currentMoves as SerializedMove[],
    }
  }
}
