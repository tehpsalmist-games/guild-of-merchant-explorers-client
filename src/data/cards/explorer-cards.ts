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
    rules: [
      {
        message: 'Explore 1 Mountain hex',
        limit: 1,
        straight: false,
        consecutive: false,
        connectionRequired: false,
        terrains: [{ terrain: 'mountain', count: 1 }],
        regionBound: false,
      },
    ],
  },
  {
    id: 'grass-2',
    imageUrl: exploreGrass,
    rules: [
      {
        message: 'Explore any 2 Grassland hexes',
        limit: 2,
        connectionRequired: false,
        straight: false,
        consecutive: false,
        terrains: [{ terrain: 'grass', count: 2 }],
        regionBound: false,
      },
    ],
  },
  {
    id: 'sand-2',
    imageUrl: exploreSand,
    rules: [
      {
        message: 'Explore any 2 Desert hexes',
        limit: 2,
        connectionRequired: false,
        straight: false,
        consecutive: false,
        terrains: [{ terrain: 'sand', count: 2 }],
        regionBound: false,
      },
    ],
  },
  {
    id: 'water-3',
    imageUrl: exploreWater,
    rules: [
      {
        message: 'Explore 3 connected Water hexes in a straight line',
        limit: 3,
        connectionRequired: true,
        straight: true,
        consecutive: false,
        terrains: [{ terrain: 'water', count: 3 }],
        regionBound: false,
      },
    ],
  },
  {
    id: 'wild-2',
    imageUrl: exploreWild,
    rules: [
      {
        message: 'Explore any 2 connected hexes',
        limit: 2,
        connectionRequired: true,
        straight: false,
        consecutive: false,
        terrains: [{ terrain: 'wild', count: 2 }],
        regionBound: false,
      },
    ],
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
