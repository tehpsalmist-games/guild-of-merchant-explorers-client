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
  straight: boolean
  terrains: { terrain: Terrain; count: number }[]
  regionBound: boolean
  initialTerrain?: Terrain[]
}

export interface ExplorerCard {
  id: string
  rules: CardPlacementRules
}

export interface GlobalExplorerCard {
  id: string
  rules: CardPlacementRules | ((p: Player) => CardPlacementRules)
}

export class ExplorerDeck extends Deck<GlobalExplorerCard> {
  laterCards: GlobalExplorerCard[] = [
    {
      id: 'era-any',
      rules(p) {
        return p.era4SelectedPowerCard.rules
      },
    },
    {
      id: 'era-3',
      rules(p) {
        return p.powerCards[2].rules
      },
    },
    {
      id: 'era-2',
      rules(p) {
        return p.powerCards[1].rules
      },
    },
  ]

  constructor() {
    super([
      {
        id: 'mountain-1',
        rules: {
          limit: 1,
          straight: false,
          connectionRequired: false,
          terrains: [{ terrain: 'mountain', count: 1 }],
          regionBound: false,
        },
      },
      {
        id: 'grass-2',
        rules: {
          limit: 2,
          connectionRequired: false,
          straight: false,
          terrains: [{ terrain: 'grass', count: 2 }],
          regionBound: false,
        },
      },
      {
        id: 'sand-2',
        rules: {
          limit: 2,
          connectionRequired: false,
          straight: false,
          terrains: [{ terrain: 'sand', count: 2 }],
          regionBound: false,
        },
      },
      {
        id: 'water-3',
        rules: {
          limit: 3,
          connectionRequired: true,
          straight: true,
          terrains: [{ terrain: 'water', count: 3 }],
          regionBound: false,
        },
      },
      {
        id: 'wild-2',
        rules: {
          limit: 2,
          connectionRequired: true,
          straight: false,
          terrains: [{ terrain: 'wild', count: 2 }],
          regionBound: false,
        },
      },
      {
        id: 'era-1',
        rules(p) {
          return p.powerCards[0].rules
        },
      },
    ])
  }
}
