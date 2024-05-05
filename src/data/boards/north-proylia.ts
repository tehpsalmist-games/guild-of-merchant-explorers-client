import { BoardData } from '../../game-logic/Board'
import { northProyliaBoard } from '../../images'

export const northProyliaData: BoardData = {
  imageURL: northProyliaBoard,
  dimensions: {
    height: 978,
    width: 1147,
    innerWidth: 1029,
    innerHeight: 731,
    paddingLeft: 61,
    paddingTop: 89,
  },
  hexData: [
    [
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      null,
      null,
      null,
    ],
  ],
}
