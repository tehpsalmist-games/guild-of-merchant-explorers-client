import { getInitialExplorerList, getLaterExplorerList } from '../data/cards/explorer-cards'
import { investigateCards } from '../data/cards/investigate-cards'
import { treasureCards } from '../data/cards/treasure-cards'
import { Board, Terrain } from './Board'
import { Player } from './GameState'

export class Card {
  id: string

  constructor({ id }: { id: string }) {
    this.id = id
  }

  toJSON() {
    return {
      id: this.id,
    }
  }
}

export class Deck<CardType extends Card> {
  cards: CardType[]
  used: CardType[] = []

  constructor(cardData: CardType[]) {
    this.cards = cardData
    this.shuffle()
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

  toJSON() {
    return {
      cards: this.cards,
      used: this.used,
    }
  }
}

export interface CardPlacementRules {
  message: string
  limit: number
  connectionRequired: boolean
  connectionToPreviousRequired: boolean
  straight: boolean
  consecutive: boolean
  terrains: { terrain: Terrain; isTradingPost?: boolean; hasCoins?: boolean; count: number }[]
  regionBound: boolean
  // ad hoc rules for the special ones
  is2VillageSpecial?: boolean
}

export interface Bonus {
  type: 'treasure' | 'coin'
  multiplier: number
}

export interface ExplorerCardData {
  id: string
  imageUrl: URL
  isEraCard: boolean
  rules(p: Player): CardPlacementRules[] | null
  bonus?(p: Player): Bonus | null
  getInvestigateCard?(p: Player): InvestigateCard | null
}

export class ExplorerCard extends Card {
  imageUrl: URL
  isEraCard: boolean

  getRules: (p: Player) => CardPlacementRules[] | null
  getBonus: (p: Player) => Bonus | null
  getInvestigateCard: (p: Player) => InvestigateCard | null

  constructor(data: ExplorerCardData) {
    super(data)

    this.imageUrl = data.imageUrl
    this.isEraCard = data.isEraCard

    this.getRules = data.rules
    this.getBonus = data.bonus ?? (() => null)
    this.getInvestigateCard = data.getInvestigateCard ?? (() => null)
  }

  rules(p: Player): CardPlacementRules[] | null {
    return this.getRules(p)
  }

  bonus(p: Player): Bonus | null {
    return this.getBonus(p)
  }

  investigateCard?(p: Player): InvestigateCard | null {
    return this.getInvestigateCard(p)
  }
}

export class ExplorerDeck extends Deck<ExplorerCard> {
  laterCards = getLaterExplorerList().map((c) => new ExplorerCard(c))

  constructor() {
    const cards = getInitialExplorerList().map((c) => new ExplorerCard(c))

    super(cards)
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

export interface InvestigateCardData {
  id: string
  imageUrl: URL
  rules: CardPlacementRules[]
  bonus?: Bonus
}

export class InvestigateCard extends Card {
  imageUrl: URL
  rules: CardPlacementRules[]
  bonus: Bonus | null = null

  constructor(data: InvestigateCardData) {
    super(data)

    this.imageUrl = data.imageUrl
    this.rules = data.rules

    if (data.bonus) {
      this.bonus = data.bonus
    }
  }
}

export class InvestigateDeck extends Deck<InvestigateCard> {
  constructor() {
    super(investigateCards.map((c) => new InvestigateCard(c)))
  }
}

export interface TreasureCardData {
  type: string
  imageUrl: URL
  count: number
  //We can assume that if it needs to be discarded, it will be played immediately.
  //We can also assume that if it doesn't need to be discarded, it doesn't need to be played immediately.
  discard: boolean
  value(board: Board): number
  jarValue?(index: number): { index: number; value: number }
}

export class TreasureCard extends Card {
  type: string
  imageUrl: URL
  //We can assume that if it needs to be discarded, it will be played immediately.
  //We can also assume that if it doesn't need to be discarded, it doesn't need to be played immediately.
  discard: boolean
  calculateValue: (board: Board) => number
  calculateJarValue?: (index: number) => { index: number; value: number }

  constructor(data: TreasureCardData & { id: string }) {
    super(data)

    this.type = data.type
    this.imageUrl = data.imageUrl
    this.discard = data.discard

    this.calculateValue = data.value

    if (data.jarValue) {
      this.calculateJarValue = data.jarValue
    }
  }

  value(board: Board) {
    return this.calculateValue(board)
  }

  jarValue(index: number) {
    return this.calculateJarValue?.(index) ?? { index: -1, value: 0 }
  }
}

export class TreasureDeck extends Deck<TreasureCard> {
  constructor() {
    super(
      treasureCards.flatMap((c) =>
        Array(c.count)
          .fill(1)
          .map((n, i) => new TreasureCard({ ...c, id: `${c.type}-${i}` })),
      ),
    )
  }
}

interface CardInHand<CardType extends { id: string }> {
  /**
   * answers: did this card pass through the player's hand (true) or is it still in the hand (false)?
   */
  discarded: boolean
  card: CardType
}

export class Hand<CardType extends { id: string }> {
  player: Player
  cards: CardInHand<CardType>[] = []
  currentChoiceIndex = 0

  constructor(player: Player) {
    this.player = player
  }

  addCard(card: CardType, discarded: boolean) {
    this.cards.push({ card, discarded })
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

  toJSON() {
    return {
      cards: this.cards,
    }
  }
}
