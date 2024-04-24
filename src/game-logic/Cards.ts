import { getInitialExplorerList, getLaterExplorerList } from '../data/cards/explorer-cards'
import { investigateCards } from '../data/cards/investigate-cards'
import { treasureCards } from '../data/cards/treasure-cards'
import { Terrain } from './Board'
import { Player } from './GameState'

export class Deck<CardType extends { id: string }> {
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
}

//Is this being used anywhere?
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

export interface ExplorerCard {
  id: string
  imageUrl: URL
  rules: CardPlacementRules[]
  bonus?: {
    type: 'treasure' | 'coin'
    multiplier: number
  }
}

export interface GlobalExplorerCard {
  id: string
  imageUrl: URL
  rules(p: Player): CardPlacementRules[] | null
  bonus(p: Player): Bonus | null
  isEraCard: boolean
  getInvestigateCard?(p: Player): ExplorerCard | null
}

export interface TreasureCard {
  id: string
  type?: string
  imageUrl: URL
  count: number
  //We can assume that if it needs to be discarded, it will be played immediately.
  //We can also assume that if it doesn't need to be discarded, it doesn't need to be played immediately.
  discard?: boolean
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

export class InvestigateDeck extends Deck<ExplorerCard> {
  constructor() {
    super([...investigateCards])
  }
}

export class TreasureDeck extends Deck<TreasureCard> {
  constructor() {
    //Adds coppies of the cards to the deck according to the count property.
    const deck: TreasureCard[] = [];
    for (const card of treasureCards) {
      for (let i = 0; i < card.count; i++) {
        const uniqueCard = { ...card };
        uniqueCard.type = card.id;
        uniqueCard.id = `${card.id}-${i}`;
        deck.push(uniqueCard);
      }
    }

    super([...deck])
  }

  addEndgameCoins(player: Player) {
    const villagesAndTowers = player.board.getFlatHexes().filter(hex => hex.isVillage || hex.isTower);

    const grassVillages = villagesAndTowers.filter(hex => hex.terrain === 'grass').length;
    const sandVillages = villagesAndTowers.filter(hex => hex.terrain === 'sand').length;
    const mountainVillages = villagesAndTowers.filter(hex => hex.terrain === 'mountain').length;
    const towers = villagesAndTowers.filter(hex => hex.isTower).length;

    let jarMultiplier = 0;

    for (const card of this.cards) {
      switch (card.type) {
        case 'grassVillageBonus':
          player.coins += grassVillages;
          break;
        case 'sandVillageBonus':
          player.coins += sandVillages;
          break;
        case 'mountainVillageBonus':
          player.coins += mountainVillages;
          break;
        case 'landVillageHalfBonus':
          player.coins += Math.floor((grassVillages + sandVillages + mountainVillages) / 2);
          player.coins += grassVillages + sandVillages + mountainVillages;
          break;
        case 'towerBonus':
          player.coins += towers;
          break;
        case 'jarMultiplier':
          //pattern is:
          //starting value = 1 (x1)
          //1+3 = 4 (x2)
          //4+5 = 9 (x3)
          //9+7 = 16 (x4)
          //restart after 4 jars
          // pattern of adding is 1, 3, 5, 7
          // equasion: 2i + 1
          //And now you know how the math here works!
          player.coins += 2 * jarMultiplier + 1;
          jarMultiplier++;
          if (jarMultiplier >= 4){
            jarMultiplier = 0;
          }
      }
    }
  }
}
