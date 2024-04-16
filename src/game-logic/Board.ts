export type Terrain = 'mountain' | 'sand' | 'grass' | 'water' | 'wild'

export class Board extends EventTarget {
  hexes: (Hex | null)[][]
  regions: Region[] = []
  lands: Land[] = []
  villages: Hex[] = []
  towers: Hex[] = []

  constructor(hexes: (HexData | null)[][]) {
    super()

    this.hexes = hexes.map((c, column) =>
      c.map((hexData, row) => hexData && new Hex({ ...hexData, row, column, board: this })),
    )

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

  // kind of a hacky UI updater for now... :/
  recordState() {
    this.dispatchEvent(new CustomEvent('statechange', { detail: { board: this } }))
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

interface TradingPost {
  value: number
  isCovered: boolean // or isLive?
}

export class Hex {
  row: number
  column: number
  terrain: Terrain
  coins: number
  tradingPost?: TradingPost
  isCity = false
  isRuin = false
  isTower = false
  isIce = false
  isExplored = false
  isOccupied = false
  isVillage = false
  isVillageCandidate = false
  isInLand = false
  isInRegion = false
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
    this.isOccupied = this.isExplored = this.isCity = isCity ?? false
    this.isRuin = isRuin ?? false
    this.isTower = isTower ?? false
    this.isIce = isIce ?? false

    if (tradingPostQuantity) {
      this.tradingPost = { value: tradingPostQuantity, isCovered: false }
    }

    const isLandTerrain = ['mountain', 'sand', 'grass'].includes(terrain)

    if (!this.coins && !this.isRuin && !this.tradingPost && isLandTerrain) {
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

    if (this.region) {
      this.region.explore()
    }

    if (this.land) {
      this.land.explore()
    }

    // hacky!
    this.board.recordState()
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
    if (this.hexes.every((h) => h.isExplored)) {
      this.hasVillage = true
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
