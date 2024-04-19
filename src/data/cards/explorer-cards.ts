import { GlobalExplorerCard } from '../../game-logic/Cards'
import {
  exploreEra1,
  exploreEra2,
  exploreEra3,
  exploreEraAny,
  exploreGrass,
  exploreMountain,
  exploreSand,
  exploreWater,
  exploreWild,
} from '../../images'

export const getInitialExplorerList = (): GlobalExplorerCard[] => [
  {
    id: 'mountain-1',
    imageUrl: exploreMountain,
    rules: {
      limit: 1,
      straight: false,
      connectionRequired: false,
      terrains: [{ terrain: 'mountain', count: 1 }],
      regionBound: false,
    },
  },
  {
    id: 'grass-2',
    imageUrl: exploreGrass,
    rules: {
      limit: 2,
      connectionRequired: false,
      straight: false,
      terrains: [{ terrain: 'grass', count: 2 }],
      regionBound: false,
    },
  },
  {
    id: 'sand-2',
    imageUrl: exploreSand,
    rules: {
      limit: 2,
      connectionRequired: false,
      straight: false,
      terrains: [{ terrain: 'sand', count: 2 }],
      regionBound: false,
    },
  },
  {
    id: 'water-3',
    imageUrl: exploreWater,
    rules: {
      limit: 3,
      connectionRequired: true,
      straight: true,
      terrains: [{ terrain: 'water', count: 3 }],
      regionBound: false,
    },
  },
  {
    id: 'wild-2',
    imageUrl: exploreWild,
    rules: {
      limit: 2,
      connectionRequired: true,
      straight: false,
      terrains: [{ terrain: 'wild', count: 2 }],
      regionBound: false,
    },
  },
  {
    id: 'era-1',
    imageUrl: exploreEra1,
    rules(p) {
      return p.powerCards[0].rules
    },
  },
]

export const getLaterExplorerList = (): GlobalExplorerCard[] => [
  {
    id: 'era-any',
    imageUrl: exploreEraAny,
    rules(p) {
      return p.era4SelectedPowerCard.rules
    },
  },
  {
    id: 'era-3',
    imageUrl: exploreEra3,
    rules(p) {
      return p.powerCards[2].rules
    },
  },
  {
    id: 'era-2',
    imageUrl: exploreEra2,
    rules(p) {
      return p.powerCards[1].rules
    },
  },
]
