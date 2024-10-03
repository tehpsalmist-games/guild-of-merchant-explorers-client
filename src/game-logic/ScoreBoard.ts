import { sleep } from '../utils'
import { Player } from './GameState'
import {
  coinImage,
  towerImage,
  villageImage,
  treasureChestImage,
  crystalImage,
  tradingPostGrass,
  eraAnyBlocker,
  blockImage,
} from '../images'

interface ScoreBoardStat {
  image?: URL
  name?: string
  score: number
  maxScore?: number

  visibleScore: number
}

export class ScoreBoard {
  stats: ScoreBoardStat[] = []
  player: Player

  doneRevealing: boolean = false

  constructor(player: Player) {
    this.player = player
  }

  get itemLength() {
    return this.stats.length
  }

  calculateStats() {
    this.stats = []

    const hexes = this.player.board.getFlatHexes()

    this.stats.push({
      image: villageImage,
      name: 'Villages Discovered',
      score: hexes.filter((h) => h.isVillage).length,
      visibleScore: -1,
    })
    this.stats.push({
      image: tradingPostGrass,
      name: 'Trade Routes Discovered',
      score: hexes.filter((h) => h.tradingPostValue && h.isCovered).length,
      maxScore: hexes.filter((h) => h.tradingPostValue).length - 1,
      visibleScore: -1,
    })
    this.stats.push({
      image: treasureChestImage,
      name: 'Ruins Discovered',
      score: hexes.filter((h) => h.isRuin && h.isCovered).length,
      maxScore: hexes.filter((h) => h.isRuin).length,
      visibleScore: -1,
    })
    this.stats.push({
      image: towerImage,
      name: 'Towers Discovered',
      score: hexes.filter((h) => h.isTower && h.isCovered).length,
      maxScore: 4,
      visibleScore: -1,
    })

    const crystals = hexes.filter((h) => h.crystalValue)
    if (crystals.length > 0) {
      this.stats.push({
        image: crystalImage,
        name: 'Crystals Discovered',
        score: crystals.filter((h) => h.isCovered).length,
        maxScore: crystals.length,
        visibleScore: -1,
      })
    }

    if (this.player.board.name === 'xawskil') {
      this.stats.push({
        image: blockImage,
        name: 'Discovered Lands',
        score: this.player.board.lands.filter((l) => l.hasBeenReached).length,
        maxScore: this.player.board.lands.length,
        visibleScore: -1,
      })
    }

    this.stats.push({
      image: eraAnyBlocker,
      name: 'Objectives Complete',
      score: this.player.gameState.objectives.filter(
        (o) => o.firstPlayers.includes(this.player) || o.secondPlayers.includes(this.player),
      ).length,
      maxScore: this.player.gameState.objectives.length,
      visibleScore: -1,
    })

    this.stats.push({
      image: treasureChestImage,
      name: 'Treasures Earned',
      score: this.player.treasureCards.size,
      visibleScore: -1,
    })

    this.stats.push({ image: coinImage, score: this.player.coins, visibleScore: -1 })
  }

  async revealScore(dramatic = false) {
    this.doneRevealing = false
    this.player.gameState.emitStateChange()

    for (let i = 0; i < this.stats.length; i++) {
      if (dramatic) await sleep(1000)

      this.stats[i].visibleScore = 0

      if (dramatic) this.player.gameState.emitStateChange()

      while (this.stats[i].visibleScore < this.stats[i].score) {
        if (dramatic) await sleep(this.stats[i].visibleScore > 15 ? (this.stats[i].visibleScore > 30 ? 10 : 50) : 100)

        this.stats[i].visibleScore++
        if (dramatic) this.player.gameState.emitStateChange()
      }
    }

    this.doneRevealing = true
    this.player.gameState.emitStateChange()
  }
}
