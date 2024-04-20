import { CSSProperties } from 'react'
import { GameState, Player } from './GameState'

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
  player: Player

  constructor(boardData: BoardData, player: Player, gameState: GameState) {
    this.player = player
    this.gameState = gameState

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

  hexContactIterator(hex: Hex, keepEmpties: true): (Hex | null)[]
  hexContactIterator(hex: Hex): Hex[]
  hexContactIterator(hex: Hex, keepEmpties = false) {
    const list = [
      this.hexes[hex.column - 1]?.[hex.column % 2 === 0 ? hex.row + 1 : hex.row],
      this.hexes[hex.column - 1]?.[hex.column % 2 === 0 ? hex.row : hex.row - 1],
      this.hexes[hex.column]?.[hex.row - 1],
      this.hexes[hex.column + 1]?.[hex.column % 2 === 0 ? hex.row : hex.row - 1],
      this.hexes[hex.column + 1]?.[hex.column % 2 === 0 ? hex.row + 1 : hex.row],
      this.hexes[hex.column]?.[hex.row + 1],
    ]

    return keepEmpties ? list : list.filter<Hex>((h): h is Hex => !!h)
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
  crystalValue: number
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
    coins = 0,
    tradingPostQuantity = 0,
    isCity = false,
    isRuin = false,
    isTower = false,
    isIce = false,
    crystalValue = 0,
    row,
    column,
    board,
  }: HexData & { row: number; column: number; board: Board }) {
    this.board = board
    this.row = row
    this.column = column
    this.terrain = terrain
    this.coins = coins
    this.isExplored = this.isCity = isCity
    this.isRuin = isRuin
    this.isTower = isTower
    this.isIce = isIce
    this.crystalValue = crystalValue
    this.tradingPostValue = tradingPostQuantity

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

    if (this.coins) {
      // TODO: multiply coins by power card value
      this.board.player.coins += this.coins
    }

    //For hexes that do actions that require it to be uncovered
    if (!this.isCovered) {
      if (this.isTower) {
        //TODO add tower logic
        this.isCovered = true
      }

      if (this.isRuin) {
        //TODO multiply by power card value
        this.board.player.treasureCardHex = this
        this.isCovered = true
      }
    }

    if (this.region) {
      this.region.explore()
    }

    if (this.land) {
      this.land.explore()
    }

    //Finds trading routes every time a hex is explored
    this.board.player.connectedTradePosts = this.getConnectedTradingPosts()
  }

  /**
   * Invert all logic from explore in this method
   */
  unexplore() {
    this.isExplored = false

    if (this.coins) {
      // TODO: multiply coins by power card value
      this.board.player.coins -= this.coins
    }

    if (this.isCovered) {
      if (this.isTower) {
        //TODO add tower logic
        this.isCovered = false
      }

      if (this.isRuin) {
        //TODO multiply by power card value
        this.board.player.treasureCardHex = undefined
        this.isCovered = false
      }
    }

    if (this.region) {
      this.region.unexplore()
    }

    if (this.land) {
      this.land.unexplore()
    }
  }

  isExplorable() {
    return !this.isExplored && this.board.hexContactIterator(this).some((h) => h.isExplored)
  }

  getConnectedHexes(connected: Hex[] = [], visited: Record<string, 1> = {}) {
    // mark this hex as visited
    visited[`${this.row}-${this.column}`] = 1

    // add this hex to the list of visited hexes
    connected.push(this)

    for (const nextHex of this.board.hexContactIterator(this)) {
      if (nextHex.isExplored && !visited[`${nextHex.row}-${nextHex.column}`]) {
        // abusing the crap out of the mutable references with this strange form of recursion,
        // but this totally works and is consistent with the mutable framework we've been leveraging so far.
        nextHex.getConnectedHexes(connected, visited)
      }
    }

    return connected
  }

  getConnectedTradingPosts(){
    return this.getConnectedHexes().filter(h => !h.isCovered && h.tradingPostValue > 0)
  }
}

export class Region {
  terrain: Terrain
  hexes: Hex[] = []
  hasVillage = false
  land: Land
  board: Board
  villageCandidates: Hex[]

  constructor(startingHex: Hex) {
    this.terrain = startingHex.terrain
    this.board = startingHex.board
    startingHex.land?.addRegion(this)

    this.buildRegionFromHex(startingHex)

    this.villageCandidates = this.hexes.filter((h) => h.isVillageCandidate)
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
      this.board.player.regionForVillage = this
    }
  }

  unexplore() {
    if (this.hasVillage && this.hexes.some((h) => !h.isExplored)) {
      this.hasVillage = false
      this.board.player.regionForVillage = undefined
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

  unexplore() {
    if (this.hexes.every((h) => !h.isExplored)) {
      this.hasBeenReached = false
    }
  }
}
