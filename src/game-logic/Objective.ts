import { GameState } from './GameState'

type Operator = 'eq' | 'gte' | 'lte'
type Position = 'adjacent' | 'on' | 'connected'

export type ObjectiveData =
  | {
      imageUrl: URL
      type: 'simple'
      quantity: number
      exploredSpace: {
        type: 'coin' | 'trading-post' | 'village' | 'ruin' | 'tower' | 'crystal'
        size?: [Operator, number]
      }
      position?: Position
      relativeTo?: {
        type:
          | 'different-terrain'
          | 'same-terrain'
          | 'any-terrain'
          | 'different-land'
          | 'same-land'
          | 'border'
          | 'north-border'
          | 'ruin'
          | 'tower'
          | 'trading-post'
          | 'crystal'
          | 'ice'
          | 'mountain'
          | 'same-ruin-type'
          | 'different-ruin-type'
        size?: [Operator, number]
      }
      first?: number
      second?: number
    }
  | {
      imageUrl: URL
      type: 'complex'
      spec:
        | 'trade-route-ice'
        | 'trade-route-value'
        | 'ruin-aj'
        | 'ruin-bd'
        | '2-cities-2-ruins'
        | 'ruin-c-northeast-tower'
        | 'westernmost-land'
        | 'ruins-near-all-terrains'
      value?: number
      first?: number
      second?: number
    }

export class Objective {
  gameState: GameState
  firstPlaceReward: number
  secondPlaceReward: number

  constructor(objectiveData: ObjectiveData, gameState: GameState) {
    this.gameState = gameState

    this.firstPlaceReward = objectiveData.first ?? 10
    this.secondPlaceReward = objectiveData.second ?? 5

    // what to do with objective data...
  }
}
