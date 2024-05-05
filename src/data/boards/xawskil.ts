import { BoardData } from '../../game-logic/Board'
import { xawskilBoard } from '../../images'

export const xawskilData: BoardData = {
  imageURL: xawskilBoard,
  dimensions: {
    height: 989,
    width: 1391,
    innerWidth: 1311,
    innerHeight: 803,
    paddingLeft: 48,
    paddingTop: 49,
  },

  hexData: [
    [
      null,
      null,
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'wild', isTower: true },
      { terrain: 'grass' },
      { terrain: 'grass' },
      null,
      null,
      null,
    ],
    [
      null,
      null,
      { terrain: 'mountain', tradingPostQuantity: 4 },
      { terrain: 'mountain' },
      { terrain: 'grass' },
      { terrain: 'sand' },
      { terrain: 'mountain' },
      { terrain: 'mountain' },
      { terrain: 'mountain' },
      { terrain: 'sand' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'grass', tradingPostQuantity: 5 },
      null,
    ],
    [
      null,
      { terrain: 'mountain' },
      { terrain: 'mountain' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'mountain' },
      { terrain: 'mountain' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      null,
    ],
    [
      null,
      null,
      { terrain: 'water', isRuin: true },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'water' },
      null,
    ],
    [
      null,
      null,
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'grass' },
      { terrain: 'water', isRuin: true },
      { terrain: 'water' },
      { terrain: 'mountain', coins: 3 },
      { terrain: 'mountain' },
      null,
    ],
    [
      null,
      { terrain: 'wild', isTower: true },
      { terrain: 'sand', coins: 2 },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'mountain' },
      { terrain: 'mountain', coins: 1 },
      { terrain: 'mountain', coins: 3 },
    ],
    [
      null,
      { terrain: 'mountain' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'sand', coins: 2 },
      { terrain: 'sand', coins: 1 },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'mountain', coins: 3 },
      { terrain: 'mountain' },
      null,
    ],
    [
      null,
      null,
      { terrain: 'mountain', tradingPostQuantity: 3 },
      { terrain: 'sand' },
      { terrain: 'water', isRuin: true },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'water' },
      null,
      null,
      null,
    ],
    [
      null,
      { terrain: 'mountain' },
      { terrain: 'mountain', coins: 2 },
      { terrain: 'sand' },
      { terrain: 'grass' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'grass', tradingPostQuantity: 4 },
      { terrain: 'grass', coins: 1 },
      { terrain: 'water' },
      { terrain: 'mountain' },
      null,
      null,
    ],
    [
      null,
      { terrain: 'mountain', coins: 2 },
      { terrain: 'grass' },
      { terrain: 'grass', coins: 1 },
      { terrain: 'grass', coins: 1 },
      { terrain: 'grass' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'water', isRuin: true },
      { terrain: 'mountain', coins: 2 },
      null,
    ],
    [
      null,
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water', isRuin: true },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'mountain' },
      null,
      null,
    ],
    [
      null,
      { terrain: 'sand' },
      { terrain: 'sand', coins: 2 },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'mountain' },
      { terrain: 'mountain' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'sand' },
      null,
    ],
    [
      null,
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'water' },
      { terrain: 'mountain', coins: 2 },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'sand', tradingPostQuantity: 3 },
      { terrain: 'sand' },
      null,
    ],
    [
      null,
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'grass', tradingPostQuantity: 3 },
      { terrain: 'grass' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'grass' },
      null,
    ],
    [
      null,
      { terrain: 'water', isRuin: true },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'grass', coins: 1 },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water', isRuin: true },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'mountain' },
      null,
    ],
    [
      null,
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'grass' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'grass' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'grass' },
      { terrain: 'water' },
      { terrain: 'mountain' },
      null,
    ],
    [
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'grass', coins: 1 },
      { terrain: 'sand' },
      { terrain: 'mountain' },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'mountain', coins: 2 },
      null,
    ],
    [
      { terrain: 'wild', isTower: true },
      { terrain: 'sand', tradingPostQuantity: 3 },
      { terrain: 'water' },
      { terrain: 'grass' },
      { terrain: 'sand', coins: 1 },
      { terrain: 'mountain' },
      { terrain: 'sand', tradingPostQuantity: 2 },
      { terrain: 'sand' },
      { terrain: 'wild', isCity: true },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'sand', coins: 2 },
      null,
    ],
    [
      null,
      { terrain: 'water' },
      { terrain: 'grass' },
      { terrain: 'sand' },
      { terrain: 'sand', coins: 1 },
      { terrain: 'mountain' },
      { terrain: 'sand' },
      { terrain: 'mountain' },
      { terrain: 'mountain', coins: 1 },
      { terrain: 'water' },
      { terrain: 'grass' },
      { terrain: 'sand' },
      { terrain: 'grass' },
      null,
    ],
    [
      null,
      { terrain: 'water' },
      { terrain: 'grass', coins: 2 },
      { terrain: 'mountain', coins: 1 },
      { terrain: 'mountain' },
      { terrain: 'sand' },
      { terrain: 'grass' },
      { terrain: 'sand' },
      { terrain: 'mountain' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'grass', tradingPostQuantity: 2 },
      { terrain: 'grass' },
      null,
    ],
    [
      null,
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'mountain' },
      { terrain: 'grass' },
      { terrain: 'grass', coins: 2 },
      { terrain: 'grass' },
      { terrain: 'grass' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'mountain' },
      { terrain: 'mountain', coins: 1 },
      { terrain: 'mountain', coins: 1 },
      null,
    ],
    [
      null,
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water', isRuin: true },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'mountain' },
      { terrain: 'grass' },
      { terrain: 'grass', coins: 2 },
      null,
    ],
    [
      null,
      { terrain: 'sand', coins: 2 },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'grass' },
      { terrain: 'sand', coins: 1 },
      { terrain: 'grass', coins: 1 },
      { terrain: 'grass' },
      null,
      null,
    ],
    [
      null,
      { terrain: 'grass', tradingPostQuantity: 6 },
      { terrain: 'grass' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'sand' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'grass' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'water', isRuin: true },
      null,
    ],
    [
      null,
      { terrain: 'grass', coins: 2 },
      { terrain: 'grass' },
      { terrain: 'mountain', coins: 1 },
      { terrain: 'water' },
      { terrain: 'water' },
      { terrain: 'sand', coins: 1 },
      { terrain: 'mountain', tradingPostQuantity: 3 },
      { terrain: 'water', coins: 2 },
      { terrain: 'grass' },
      { terrain: 'sand' },
      { terrain: 'water' },
      { terrain: 'wild', isTower: true },
      null,
    ],
    [
      null,
      null,
      { terrain: 'grass' },
      { terrain: 'mountain' },
      { terrain: 'water', isRuin: true },
      { terrain: 'water' },
      { terrain: 'sand', coins: 2 },
      { terrain: 'mountain' },
      { terrain: 'mountain', coins: 1 },
      { terrain: 'water' },
      { terrain: 'grass' },
      null,
      null,
      null,
    ],
  ],
}
