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

export const objectives: Record<BoardName, ObjectiveData[]> = {
  aghon: [
    {
      id: 'aghonObjective1',
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
      id: 'aghonObjective2',
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
    { id: 'aghonObjective3', imageUrl: aghonObjective3, complexAlgorithm: { spec: 'ruins-near-all-terrains' } },
    {
      id: 'aghonObjective4',
      imageUrl: aghonObjective4,
      simpleAlgorithm: {
        quantity: 1,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'tower' },
      },
    },
    { id: 'aghonObjective5', imageUrl: aghonObjective5, complexAlgorithm: { spec: 'trade-route-value', value: 12 } },
    {
      id: 'aghonObjective6',
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
      id: 'aveniaObjective1',
      imageUrl: aveniaObjective1,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'village' },
        position: 'on',
        relativeTo: { type: 'different-land' },
      },
    },
    {
      id: 'aveniaObjective2',
      imageUrl: aveniaObjective2,
      simpleAlgorithm: { quantity: 2, exploredSpace: { type: 'tower' } },
    },
    {
      id: 'aveniaObjective3',
      imageUrl: aveniaObjective3,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'ruin' },
        position: 'adjacent',
        relativeTo: { type: 'border' },
      },
    },
    {
      id: 'aveniaObjective4',
      imageUrl: aveniaObjective4,
      simpleAlgorithm: {
        quantity: 1,
        exploredSpace: { type: 'village' },
        position: 'on',
        relativeTo: { type: 'any-terrain', size: ['gte', 5] },
      },
    },
    {
      id: 'aveniaObjective5',
      imageUrl: aveniaObjective5,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: { type: 'trading-post' },
        position: 'on',
        relativeTo: { type: 'trading-post', size: ['gte', 3] },
      },
    },
    {
      id: 'aveniaObjective6',
      imageUrl: aveniaObjective6,
      simpleAlgorithm: { quantity: 5, exploredSpace: { type: 'village' } },
    },
  ],
  kazan: [
    {
      id: 'kazanObjective1',
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
      id: 'kazanObjective2',
      imageUrl: kazanObjective2,
      complexAlgorithm: { spec: 'ruin-c-northeast-tower' },
    },
    {
      id: 'kazanObjective3',
      imageUrl: kazanObjective3,
      simpleAlgorithm: {
        quantity: 1,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'ruin' },
      },
    },
    {
      id: 'kazanObjective4',
      imageUrl: kazanObjective4,
      complexAlgorithm: { spec: '2-cities-2-ruins' },
    },
    {
      id: 'kazanObjective5',
      imageUrl: kazanObjective5,
      simpleAlgorithm: { quantity: 1, exploredSpace: { type: 'coin', size: ['gte', 3] } },
    },
    {
      id: 'kazanObjective6',
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
      id: 'cnidariaObjective1',
      imageUrl: cnidariaObjective1,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'crystal' },
      },
    },
    {
      id: 'cnidariaObjective2',
      imageUrl: cnidariaObjective2,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'ruin' },
        position: 'on',
        relativeTo: { type: 'same-ruin-type' },
      },
    },
    {
      id: 'cnidariaObjective3',
      imageUrl: cnidariaObjective3,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'village' },
        position: 'on',
        relativeTo: { type: 'same-terrain' },
      },
    },
    {
      id: 'cnidariaObjective4',
      imageUrl: cnidariaObjective4,
      simpleAlgorithm: {
        quantity: 3,
        exploredSpace: { type: 'ruin' },
        position: 'on',
        relativeTo: { type: 'different-ruin-type' },
      },
    },
    {
      id: 'cnidariaObjective5',
      imageUrl: cnidariaObjective5,
      simpleAlgorithm: { quantity: 2, exploredSpace: { type: 'crystal' } },
    },
    {
      id: 'cnidariaObjective6',
      imageUrl: cnidariaObjective6,
      complexAlgorithm: { spec: 'trade-route-value', value: 16 },
    },
  ],
  xawskil: [
    {
      id: 'xawskilObjective1',
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
      id: 'xawskilObjective2',
      imageUrl: xawskilObjective2,
      complexAlgorithm: { spec: 'westernmost-land' },
      first: 12,
      second: 6,
    },
    {
      id: 'xawskilObjective3',
      imageUrl: xawskilObjective3,
      simpleAlgorithm: { quantity: 3, exploredSpace: { type: 'tower' } },
      first: 14,
      second: 7,
    },
    {
      id: 'xawskilObjective4',
      imageUrl: xawskilObjective4,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: { type: 'village' },
        position: 'on',
        relativeTo: { type: 'same-land' },
      },
    },
    {
      id: 'xawskilObjective5',
      imageUrl: xawskilObjective5,
      simpleAlgorithm: {
        quantity: 1,
        exploredSpace: { type: 'trading-post' },
        position: 'on',
        relativeTo: { type: 'trading-post', size: ['gte', 5] },
      },
    },
    {
      id: 'xawskilObjective6',
      imageUrl: xawskilObjective6,
      simpleAlgorithm: { quantity: 6, exploredSpace: { type: 'ruin' } },
    },
  ],
  northProylia: [
    {
      id: 'northProyliaObjective1',
      imageUrl: northProyliaObjective1,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'ice' },
      },
    },
    {
      id: 'northProyliaObjective2',
      imageUrl: northProyliaObjective2,
      simpleAlgorithm: { quantity: 2, exploredSpace: { type: 'ruin' }, position: 'on', relativeTo: { type: 'ice' } },
    },
    {
      id: 'northProyliaObjective3',
      imageUrl: northProyliaObjective3,
      simpleAlgorithm: {
        quantity: 2,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'trading-post' },
      },
    },
    {
      id: 'northProyliaObjective4',
      imageUrl: northProyliaObjective4,
      complexAlgorithm: { spec: 'trade-route-ice' },
    },
    {
      id: 'northProyliaObjective5',
      imageUrl: northProyliaObjective5,
      simpleAlgorithm: {
        quantity: 1,
        exploredSpace: { type: 'village' },
        position: 'adjacent',
        relativeTo: { type: 'north-border' },
      },
    },
    {
      id: 'northProyliaObjective6',
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
