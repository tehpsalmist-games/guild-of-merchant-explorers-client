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

export const cardList = [
  {
    imageUrl: sandVillageBonus,
    count: 2,
  },
  {
    imageUrl: grassVillageBonus,
    count: 2,
  },
  {
    imageUrl: mountainVillageBonus,
    count: 2,
  },
  {
    imageUrl: landVillageHalfBonus,
    count: 2,
  },
  {
    imageUrl: towerBonus,
    count: 6,
  },
  {
    imageUrl: placeBlock,
    count: 8,
    discard: true,
  },
  {
    imageUrl: twoCoins,
    count: 8,
    discard: true,
  },
  {
    imageUrl: jarMultiplier,
    count: 10,
  },
]
