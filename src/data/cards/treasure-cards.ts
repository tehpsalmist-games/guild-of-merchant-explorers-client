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
    },

    jarValue(index: number) : { index: number; value: number } {
      //for jars, pattern is:
      //starting value = 1 (x1)
      //1+3 = 4 (x2)
      //4+5 = 9 (x3)
      //9+7 = 16 (x4)
      //restart after 4 jars
      //pattern for adding to the previous answer is 1, 3, 5, 7
      //equasion: 2i + 1
      //And now you know how the math here works!

      let value = 2 * index + 1

      index++
      if (index >= 4) {
        index = 0
      }

      return {index, value}
    }
  },
]
