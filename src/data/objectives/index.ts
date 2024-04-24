import { BoardName } from '../../game-logic/GameState'
import { ObjectiveData } from '../../game-logic/Objective'
import {
  aghonObjective1,
  aghonObjective2,
  aghonObjective3,
  aghonObjective4,
  aghonObjective5,
  aghonObjective6,
  aveniaObjective1,
  aveniaObjective2,
  aveniaObjective3,
  aveniaObjective4,
  aveniaObjective5,
  aveniaObjective6,
  kazanObjective1,
  kazanObjective2,
  kazanObjective3,
  kazanObjective4,
  kazanObjective5,
  kazanObjective6,
  cnidariaObjective1,
  cnidariaObjective2,
  cnidariaObjective3,
  cnidariaObjective4,
  cnidariaObjective5,
  cnidariaObjective6,
  xawskilObjective1,
  xawskilObjective2,
  xawskilObjective3,
  xawskilObjective4,
  xawskilObjective5,
  xawskilObjective6,
  northProyliaObjective1,
  northProyliaObjective2,
  northProyliaObjective3,
  northProyliaObjective4,
  northProyliaObjective5,
  northProyliaObjective6,
} from '../../images'

export const objectives: Record<BoardName | 'xawskil' | 'northProylia', ObjectiveData[]> = {
  aghon: [
    {
      imageUrl: aghonObjective1,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: {
          type: 'village',
        },
        position: 'on',
        relativeTo: {
          type: 'different-terrain',
        },
      },
    },
    {
      imageUrl: aghonObjective2,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'trading-post' },
        position: 'on',
        relativeTo: {
          type: 'different-terrain',
        },
      },
    },
    { imageUrl: aghonObjective3, complexAlgorithm: { spec: 'ruins-near-all-terrains' } },
    {
      imageUrl: aghonObjective4,
      simpleAlgorithm: {
        quantity: 1,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'tower' },
      },
    },
    { imageUrl: aghonObjective5, complexAlgorithm: { spec: 'trade-route-value', value: 12 } },
    {
      imageUrl: aghonObjective6,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: { type: 'village' },
        position: 'on',
        relativeTo: { type: 'mountain' },
      },
    },
  ],
  avenia: [
    {
      imageUrl: aveniaObjective1,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'village' },
        position: 'on',
        relativeTo: { type: 'different-land' },
      },
    },
    {
      imageUrl: aveniaObjective2,
      simpleAlgorithm: { quantity: 2, exploredSpace: { type: 'tower' } },
    },
    {
      imageUrl: aveniaObjective3,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'ruin' },
        position: 'adjacent',
        relativeTo: { type: 'border' },
      },
    },
    {
      imageUrl: aveniaObjective4,
      simpleAlgorithm: {
        quantity: 1,
        exploredSpace: { type: 'village' },
        position: 'on',
        relativeTo: { type: 'any-terrain', size: ['gte', 5] },
      },
    },
    {
      imageUrl: aveniaObjective5,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: { type: 'trading-post' },
        position: 'on',
        relativeTo: { type: 'trading-post', size: ['gte', 3] },
      },
    },
    {
      imageUrl: aveniaObjective6,
      simpleAlgorithm: { quantity: 5, exploredSpace: { type: 'village' } },
    },
  ],
  kazan: [
    {
      imageUrl: kazanObjective1,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: {
          type: 'ruin',
        },
        position: 'on',
        relativeTo: {
          type: 'ruin',
          values: ['A', 'J'],
        },
      },
    },
    {
      imageUrl: kazanObjective2,
      complexAlgorithm: { spec: 'ruin-c-northeast-tower' },
    },
    {
      imageUrl: kazanObjective3,
      simpleAlgorithm: {
        quantity: 1,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'ruin' },
      },
    },
    {
      imageUrl: kazanObjective4,
      complexAlgorithm: { spec: '2-cities-2-ruins' },
    },
    {
      imageUrl: kazanObjective5,
      simpleAlgorithm: { quantity: 1, exploredSpace: { type: 'coin', size: ['gte', 3] } },
    },
    {
      imageUrl: kazanObjective6,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: {
          type: 'ruin',
        },
        position: 'on',
        relativeTo: {
          type: 'ruin',
          values: ['B', 'D'],
        },
      },
    },
  ],
  cnidaria: [
    {
      imageUrl: cnidariaObjective1,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'crystal' },
      },
    },
    {
      imageUrl: cnidariaObjective2,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'ruin' },
        position: 'on',
        relativeTo: { type: 'same-ruin-type' },
      },
    },
    {
      imageUrl: cnidariaObjective3,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'village' },
        position: 'on',
        relativeTo: { type: 'same-terrain' },
      },
    },
    {
      imageUrl: cnidariaObjective4,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'ruin' },
        position: 'on',
        relativeTo: { type: 'different-ruin-type' },
      },
    },
    {
      imageUrl: cnidariaObjective5,
      simpleAlgorithm: { quantity: 2, exploredSpace: { type: 'crystal' } },
    },
    {
      imageUrl: cnidariaObjective6,
      complexAlgorithm: { spec: 'trade-route-value', value: 16 },
    },
  ],
  xawskil: [
    {
      imageUrl: xawskilObjective1,
      simpleAlgorithm: {
        quantity: 5,
        exploredSpace: { type: 'village' },
        position: 'on',
        relativeTo: { type: 'different-land' },
      },
      first: 12,
      second: 6,
    },
    {
      imageUrl: xawskilObjective2,
      complexAlgorithm: { spec: 'westernmost-land' },
      first: 12,
      second: 6,
    },
    {
      imageUrl: xawskilObjective3,
      simpleAlgorithm: { quantity: 3, exploredSpace: { type: 'tower' } },
      first: 14,
      second: 7,
    },
    {
      imageUrl: xawskilObjective4,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: { type: 'village' },
        position: 'on',
        relativeTo: { type: 'same-land' },
      },
    },
    {
      imageUrl: xawskilObjective5,
      simpleAlgorithm: {
        quantity: 1,
        exploredSpace: { type: 'trading-post' },
        position: 'on',
        relativeTo: { type: 'trading-post', size: ['gte', 5] },
      },
    },
    {
      imageUrl: xawskilObjective6,
      simpleAlgorithm: { quantity: 6, exploredSpace: { type: 'ruin' } },
    },
  ],
  northProylia: [
    {
      imageUrl: northProyliaObjective1,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'ice' },
      },
    },
    {
      imageUrl: northProyliaObjective2,
      simpleAlgorithm: { quantity: 2, exploredSpace: { type: 'ruin' }, position: 'on', relativeTo: { type: 'ice' } },
    },
    {
      imageUrl: northProyliaObjective3,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'trading-post' },
      },
    },
    {
      imageUrl: northProyliaObjective4,
      complexAlgorithm: { spec: 'trade-route-ice' },
    },
    {
      imageUrl: northProyliaObjective5,
      simpleAlgorithm: {
        quantity: 1,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'north-border' },
      },
    },
    {
      imageUrl: northProyliaObjective6,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'village' },
        position: 'on',
        relativeTo: { type: 'different-terrain', size: ['lte', 3] },
      },
    },
  ],
}
