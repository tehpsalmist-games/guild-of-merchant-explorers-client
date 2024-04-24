import { TreasureCard } from '../../game-logic/Cards'
import {
  grassVillageBonus,
  jarMultiplier,
  landVillageHalfBonus,
  mountainVillageBonus,
  placeBlock,
  sandVillageBonus,
  towerBonus,
  twoCoins,
} from '../../images'

export const cardList: TreasureCard[] = [
  {
    id: 'sandVillageBonus',
    imageUrl: sandVillageBonus,
    count: 2,
  },
  {
    id: 'grassVillageBonus',
    imageUrl: grassVillageBonus,
    count: 2,
  },
  {
    id: 'mountainVillageBonus',
    imageUrl: mountainVillageBonus,
    count: 2,
  },
  {
    id: 'landVillageHalfBonus',
    imageUrl: landVillageHalfBonus,
    count: 2,
  },
  {
    id: 'towerBonus',
    imageUrl: towerBonus,
    count: 6,
  },
  {
    id: 'placeBlock',
    imageUrl: placeBlock,
    count: 8,
    discard: true,
  },
  {
    id: 'twoCoins',
    imageUrl: twoCoins,
    count: 8,
    discard: true,
  },
  {
    id: 'jarMultiplier',
    imageUrl: jarMultiplier,
    count: 10,
  },
]
