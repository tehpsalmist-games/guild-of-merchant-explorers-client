import { getInitialExplorerList, getLaterExplorerList } from '../data/cards/explorer-cards'
import { Terrain } from './Board'
import { Player } from './GameState'

export class Deck<CardType extends { id: string }> {
  cards: CardType[]
  used: CardType[]

  constructor(cardData: CardType[]) {
    this.cards = cardData
  }

  drawCards({ quantity = 1, recycle = false } = {}) {
    // if deck is empty, and recycling is requested, shuffle used cards into the deck
    if (recycle && this.cards.length - quantity < 0) {
      this.cards = this.used
      this.used = []

      this.shuffle()
    }

    // simply give references to the callee. No need to remove from deck; the callee can be responsible
    // for subsequently calling useCard() and removeCard() according to their own proprietary logic
    return this.cards.slice(0, quantity)
  }

  useCard(id: string) {
    const card = this.cards.find((c) => c.id === id)

    // really shouldn't happen, but early exit if so
    if (!card) return

    this.used.push(card)
    this.cards = this.cards.filter((c) => c.id !== id)
  }

  removeCard(id: string) {
    this.cards = this.cards.filter((c) => c.id !== id)
    this.used = this.used.filter((c) => c.id !== id)
  }

  addCard(card: CardType) {
    this.cards.push(card)
    this.shuffle()
  }

  shuffle() {
    const newList: CardType[] = []

    while (this.cards.length) {
      newList.push(...this.cards.splice(Math.floor(Math.random() * this.cards.length), 1))
    }

    this.cards = newList
  }
}

export class Hand<CardType extends { id: string }> {
  player: Player
  cards: CardType[] = []
  used: CardType[] = []
  currentChoiceIndex = 0

  constructor(player: Player) {
    this.player = player
  }

  addCard(card: CardType) {
    this.cards.push(card)
    this.currentChoiceIndex = this.cards.length
  }

  /**
   * Useful for replaying former moves when reconstructing history
   */
  hasCardAlready() {
    return !!this.cards[this.currentChoiceIndex]
  }

  useCurrentCard() {
    const currentCard = this.cards[this.currentChoiceIndex]

    if (currentCard) {
      this.currentChoiceIndex++
    }

    return currentCard || null
  }
}

export interface CardPlacementRules {
  limit: number
  connectionRequired: boolean
  surrounding?: boolean
  straight: boolean
  terrains: { terrain: Terrain; count: number }[]
  regionBound: boolean
  initialTerrain?: Terrain[]
  // ad hoc rules for the special ones
}

export interface ExplorerCard {
  id: string
  rules: CardPlacementRules
}

export interface GlobalExplorerCard {
  id: string
  imageUrl: URL
  rules: CardPlacementRules | ((p: Player) => CardPlacementRules)
}

export class ExplorerDeck extends Deck<GlobalExplorerCard> {
  laterCards = getLaterExplorerList()

  constructor() {
    super(getInitialExplorerList())
  }

  prepareForNextEra() {
    if (this.cards.length) return

    const nextEraCard = this.laterCards.pop()

    if (nextEraCard) {
      this.cards = this.used
      this.cards.push(nextEraCard)
    }

    this.shuffle()
  }
}
