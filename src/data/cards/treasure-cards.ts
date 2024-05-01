import { Board } from '../../game-logic/Board'
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

export const treasureCards: TreasureCard[] = [
  {
    id: 'sandVillageBonus',
    imageUrl: sandVillageBonus,
    count: 2,
    
    value(board: Board) : number {
      return board.getFlatHexes().filter((hex) => hex.isVillage && hex.terrain === 'sand').length
    }
  },
  {
    id: 'grassVillageBonus',
    imageUrl: grassVillageBonus,
    count: 2,

    value(board: Board) : number {
      return board.getFlatHexes().filter((hex) => hex.isVillage && hex.terrain === 'grass').length
    }
  },
  {
    id: 'mountainVillageBonus',
    imageUrl: mountainVillageBonus,
    count: 2,

    value(board: Board) : number {
      return board.getFlatHexes().filter((hex) => hex.isVillage && hex.terrain === 'mountain').length 
    }
  },
  {
    id: 'landVillageHalfBonus',
    imageUrl: landVillageHalfBonus,
    count: 2,

    value(board: Board) : number {
      return Math.floor((board.getFlatHexes().filter((hex) => hex.isVillage).length) / 2)
    }
  },
  {
    id: 'towerBonus',
    imageUrl: towerBonus,
    count: 6,

    value(board: Board) : number {
      return board.getFlatHexes().filter((hex) => hex.isTower && hex.isCovered).length
    }
  },
  {
    id: 'placeBlock',
    imageUrl: placeBlock,
    count: 8,
    discard: true,

    value() : number {
      //This card has a special use case and doesn't have a value.
      return 0 
    }
  },
  {
    id: 'twoCoins',
    imageUrl: twoCoins,
    count: 8,
    discard: true,

    value() : number {
      return 2 
    }
  },
  {
    id: 'jarMultiplier',
    imageUrl: jarMultiplier,
    count: 10,

    value() : number {
      //Jar value is calculated elsewhere due to the need to know the total number of jars.
      return 0 
    }
  },
]
