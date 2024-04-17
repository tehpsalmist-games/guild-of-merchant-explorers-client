import { CSSProperties } from 'react'
import { GameState } from './GameState'

export type Terrain = 'mountain' | 'sand' | 'grass' | 'water' | 'wild'

export interface BoardData {
  imageURL: URL
  dimensions: {
    height: number
    width: number
    innerWidth: number
    innerHeight: number
    paddingLeft: number
    paddingTop: number
  }
  hexData: (HexData | null)[][]
}

export class Board {
  // display properties
  imageURL: URL
  svgStyle: CSSProperties
  height: number
  width: number

  // game data
  hexes: (Hex | null)[][]
  regions: Region[] = []
  lands: Land[] = []
  gameState: GameState

  constructor(boardData: BoardData) {
    this.imageURL = boardData.imageURL
    this.height = boardData.dimensions.height
    this.width = boardData.dimensions.width
    this.svgStyle = {
      top: `${(boardData.dimensions.paddingTop / this.height) * 100}%`,
      left: `${(boardData.dimensions.paddingLeft / this.width) * 100}%`,
      width: `${(boardData.dimensions.innerWidth / this.width) * 100}%`,
    }

    this.hexes = boardData.hexData.map((columns, columnIndex) => {
      return columns.map((hexData, rowIndex) => {
        if (!hexData) return null

        return new Hex({
          ...hexData,
          row: rowIndex,
          column: columnIndex,
          board: this,
        })
      })
    })

    for (const hex of this.getFlatHexes()) {
      // make Lands
      if (hex.isInLand && !hex.land) {
        this.lands.push(new Land(hex))
      }

      // make regions
      if (hex.isInRegion && !hex.region) {
        this.regions.push(new Region(hex))
      }
    }
  }

  hexContactIterator(hex: Hex) {
    return [
      this.hexes[hex.column - 1]?.[hex.column % 2 === 0 ? hex.row + 1 : hex.row],
      this.hexes[hex.column - 1]?.[hex.column % 2 === 0 ? hex.row : hex.row - 1],
      this.hexes[hex.column]?.[hex.row - 1],
      this.hexes[hex.column + 1]?.[hex.column % 2 === 0 ? hex.row : hex.row - 1],
      this.hexes[hex.column + 1]?.[hex.column % 2 === 0 ? hex.row + 1 : hex.row],
      this.hexes[hex.column]?.[hex.row + 1],
    ].filter<Hex>((h): h is Hex => !!h)
  }

  getFlatHexes() {
    return this.hexes.flat().filter<Hex>((h): h is Hex => !!h)
  }

  getHex(row: number, column: number) {
    return this.hexes[column]?.[row]
  }

  get dimensions() {
    return [this.hexes.length, this.hexes[0].length]
  }

  wipe() {
    this.getFlatHexes().forEach((hex) => {
      if (!hex.isVillage && !hex.isCity) {
        hex.isExplored = false
      }
    })
  }
}

export interface HexData {
  terrain: Terrain
  coins?: number
  tradingPostQuantity?: number
  isRuin?: boolean
  isTower?: boolean
  isCity?: boolean
  // these values are for the more complex maps we'll implement later
  isIce?: boolean
  crystalValue?: number
  ruinSymbol?: string
}

export class Hex {
  row: number
  column: number
  terrain: Terrain
  coins: number
  tradingPostValue: number
  isCity = false
  isRuin = false
  isTower = false
  isIce = false
  isExplored = false
  isVillage = false
  isVillageCandidate = false
  isInLand = false
  isInRegion = false
  isCovered = false
  region: Region | null = null
  land: Land | null = null
  board: Board

  constructor({
    terrain,
    coins,
    tradingPostQuantity,
    isCity,
    isRuin,
    isTower,
    isIce,
    row,
    column,
    board,
  }: HexData & { row: number; column: number; board: Board }) {
    this.board = board
    this.row = row
    this.column = column
    this.terrain = terrain
    this.coins = coins ?? 0
    this.isExplored = this.isCity = isCity ?? false
    this.isRuin = isRuin ?? false
    this.isTower = isTower ?? false
    this.isIce = isIce ?? false
    this.tradingPostValue = tradingPostQuantity ?? 0

    const isLandTerrain = ['mountain', 'sand', 'grass'].includes(terrain)

    if (!this.coins && !this.isRuin && !this.tradingPostValue && isLandTerrain) {
      this.isVillageCandidate = true
    }

    if (isLandTerrain) {
      this.isInRegion = true
    }

    if (isLandTerrain || this.isTower || this.isIce) {
      this.isInLand = true
    }
  }

  get element() {
    return document.getElementById(`${this.row}-${this.column}`)
  }

  explore() {
    this.isExplored = true

    //For hexes that do actions that require it to be uncovered
    //TODO how are we going to undo this? maybe we should move it?
    if (!this.isCovered){
      if (this.isTower) {
        //TODO add tower logic
      }

      if (this.isRuin) {
        //TODO add ruin logic
      }

      this.isCovered = true
    }

    if (this.region) {
      this.region.explore()
    }

    if (this.land) {
      this.land.explore()
    }
  }

  isExplorable() {
    return !this.isExplored && this.board.hexContactIterator(this).some((h) => h.isExplored)
  }
}

export class Region {
  terrain: Terrain
  hexes: Hex[] = []
  hasVillage = false
  land: Land
  board: Board

  constructor(startingHex: Hex) {
    this.terrain = startingHex.terrain
    this.board = startingHex.board
    startingHex.land?.addRegion(this)

    this.buildRegionFromHex(startingHex)
  }

  buildRegionFromHex(hex: Hex) {
    hex.region = this
    this.hexes.push(hex)

    for (const nextHex of this.board.hexContactIterator(hex)) {
      if (nextHex.isInRegion && !nextHex.region && nextHex.terrain === this.terrain) {
        this.buildRegionFromHex(nextHex)
      }
    }
  }

  get size() {
    return this.hexes.length
  }

  get log() {
    return this.hexes.map((h) => h.element)
  }

  explore() {
    if (!this.hasVillage && this.hexes.every((h) => h.isExplored)) {
      this.hasVillage = true

      const villageCandidates = this.hexes.filter((h) => h.isVillageCandidate)
      if (villageCandidates.length > 1) {
        this.board.gameState.villageMode(this)
      } else if (villageCandidates.length === 1) {
        // auto place the only option
        villageCandidates[0].isVillage = true
      }
    }
  }
}

export class Land {
  hexes: Hex[] = []
  hasBeenReached = false
  board: Board
  regions: Region[] = []

  constructor(startingHex: Hex) {
    this.board = startingHex.board
    this.buildLandFromHex(startingHex)
  }

  buildLandFromHex(hex: Hex) {
    hex.land = this
    this.hexes.push(hex)

    for (const nextHex of this.board.hexContactIterator(hex)) {
      if (nextHex.isInLand && !nextHex.land) {
        this.buildLandFromHex(nextHex)
      }
    }
  }

  addRegion(r: Region) {
    r.land = this
    this.regions.push(r)
  }

  get log() {
    return this.hexes.map((h) => h.element)
  }

  explore() {
    this.hasBeenReached = true
  }
}

//We can use this to find trading routes and score them.
//TODO I can't test this cuz I got an error lol
export class TradeRoute{
  tradingPosts: Hex[] = []
  board: Board
  isTradable = this.tradingPosts?.length > 1

  constructor(startingHex: Hex) {
    this.board = startingHex.board
    if (startingHex.isExplored) this.buildTradeRouteFromHex(startingHex)
  }

  buildTradeRouteFromHex(hex: Hex) {
    if (hex.tradingPostValue) {
      this.tradingPosts.push(hex)
    }

    for (const nextHex of this.board.hexContactIterator(hex)) {
      if (nextHex.isExplored) {
        this.buildTradeRouteFromHex(nextHex)
      }
    }
  }
  
  coverTradingPost(hex: Hex) {
    if (this.tradingPosts.includes(hex)) {
      hex.isCovered = true;
      this.tradingPosts = this.tradingPosts.filter((h) => h !== hex);
    }
  }

  get log() {
    return this.tradingPosts.map((h) => h.element)
  }

  explore() {
    if (this.isTradable) {
      this.board.gameState.tradingMode(this)
    }
  }
}
