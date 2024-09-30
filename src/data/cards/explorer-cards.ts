import { ExplorerCardData } from '../../game-logic/Cards'
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

export const getInitialExplorerList = (): ExplorerCardData[] => [
  {
    id: 'mountain-1',
    isEraCard: false,
    bonus(p) {
      return null
    },
    imageUrl: exploreMountain,
    rules: () => [
      {
        message: 'Explore 1 Mountain hex',
        limit: 1,
        straight: false,
        consecutive: false,
        connectionRequired: false,
        connectionToPreviousRequired: false,
        terrains: [{ terrain: 'mountain', count: 1 }],
        regionBound: false,
      },
    ],
  },
  {
    id: 'grass-2',
    isEraCard: false,
    bonus(p) {
      return null
    },
    imageUrl: exploreGrass,
    rules: () => [
      {
        message: 'Explore any 2 Grassland hexes',
        limit: 2,
        connectionRequired: false,
        connectionToPreviousRequired: false,
        straight: false,
        consecutive: false,
        terrains: [{ terrain: 'grass', count: 2 }],
        regionBound: false,
      },
    ],
  },
  {
    id: 'sand-2',
    isEraCard: false,
    bonus(p) {
      return null
    },
    imageUrl: exploreSand,
    rules: () => [
      {
        message: 'Explore any 2 Desert hexes',
        limit: 2,
        connectionRequired: false,
        connectionToPreviousRequired: false,
        straight: false,
        consecutive: false,
        terrains: [{ terrain: 'sand', count: 2 }],
        regionBound: false,
      },
    ],
  },
  {
    id: 'water-3',
    isEraCard: false,
    bonus(p) {
      return null
    },
    imageUrl: exploreWater,
    rules: () => [
      {
        message: 'Explore 3 connected Water hexes in a straight line',
        limit: 3,
        connectionRequired: true,
        connectionToPreviousRequired: false,
        straight: true,
        consecutive: false,
        terrains: [{ terrain: 'water', count: 3 }],
        regionBound: false,
      },
    ],
  },
  {
    id: 'wild-2',
    isEraCard: false,
    bonus(p) {
      return null
    },
    imageUrl: exploreWild,
    rules: () => [
      {
        message: 'Explore any 2 connected hexes',
        limit: 2,
        connectionRequired: true,
        connectionToPreviousRequired: false,
        straight: false,
        consecutive: false,
        terrains: [{ terrain: 'wild', count: 2 }],
        regionBound: false,
      },
    ],
  },
  {
    id: 'era-1',
    isEraCard: true,
    getInvestigateCard(p) {
      return p.investigateCards.keptCards[0]
    },
    bonus(p) {
      return p.investigateCards.keptCards[0]?.bonus || null
    },
    imageUrl: exploreEra1,
    rules(p) {
      return p.investigateCards.keptCards[0]?.rules || null
    },
  },
]

export const getLaterExplorerList = (): ExplorerCardData[] => [
  {
    id: 'era-any',
    isEraCard: true,
    getInvestigateCard(p) {
      return p.era4SelectedInvestigateCard
    },
    bonus(p) {
      return p.era4SelectedInvestigateCard?.bonus || null
    },
    imageUrl: exploreEraAny,
    rules(p) {
      return p.era4SelectedInvestigateCard?.rules || null
    },
  },
  {
    id: 'era-3',
    isEraCard: true,
    getInvestigateCard(p) {
      return p.investigateCards.keptCards[2]
    },
    bonus(p) {
      return p.investigateCards.keptCards[2]?.bonus || null
    },
    imageUrl: exploreEra3,
    rules(p) {
      return p.investigateCards.keptCards[2]?.rules || null
    },
  },
  {
    id: 'era-2',
    isEraCard: true,
    getInvestigateCard(p) {
      return p.investigateCards.keptCards[1]
    },
    bonus(p) {
      return p.investigateCards.keptCards[1]?.bonus || null
    },
    imageUrl: exploreEra2,
    rules(p) {
      return p.investigateCards.keptCards[1]?.rules || null
    },
  },
]

export const explorerCardDataMapping = getInitialExplorerList()
  .concat(getLaterExplorerList())
  .reduce<Record<string, ExplorerCardData>>((map, cardData) => ({ ...map, [cardData.id]: cardData }), {})
