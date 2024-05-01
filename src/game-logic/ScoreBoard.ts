import { sleep } from '../utils'
import { GameState } from './GameState'
import { coinImage, towerImage, villageImage, treasureChestImage, crystalImage, tradePostCoverImage } from '../images'

interface ScoreBoardStat {
    image?: URL
    name?: string
    score: number
    maxScore?: number

    visibleScore: number
}

export class ScoreBoard {
    stats: ScoreBoardStat[] = []
    gameState: GameState

    doneRevealing: boolean = false

    constructor(gameState: GameState) {
        this.gameState = gameState

        const hexes = this.gameState.activePlayer.board.getFlatHexes()

        this.stats.push({ image: villageImage, name: 'Villages Discovered', score: hexes.filter((h) => h.isVillage).length, visibleScore: -1 })
        this.stats.push({ image: tradePostCoverImage, name: 'Trade Routes Discovered', score: hexes.filter((h) => h.tradingPostValue && h.isCovered).length, maxScore: hexes.filter((h) => h.tradingPostValue).length - 1, visibleScore: -1 })
        this.stats.push({ image: treasureChestImage, name: 'Ruins Discovered', score: hexes.filter((h) => h.isRuin && h.isCovered).length, maxScore: hexes.filter((h) => h.isRuin).length, visibleScore: -1 })
        this.stats.push({ image: towerImage, name: 'Towers Discovered', score: hexes.filter((h) => h.isTower && h.isCovered).length, maxScore: 4, visibleScore: -1 })
        
        const crystals = hexes.filter((h) => h.crystalValue)
        if (crystals.length > 0) {
            this.stats.push({ image: crystalImage, name: 'Crystals Discovered', score: crystals.filter((h) => h.isCovered).length, maxScore: crystals.length, visibleScore: -1 })
        }
        
        this.stats.push({ image: treasureChestImage, name: 'Objectives Complete', score: this.gameState.objectives.filter((o) => o.firstPlayers.includes(this.gameState.activePlayer) || o.secondPlayers.includes(this.gameState.activePlayer)).length, maxScore: this.gameState.objectives.length, visibleScore: -1 })

        this.stats.push({ image: treasureChestImage, name: 'Treasures Earned', score: this.gameState.activePlayer.treasureCards.length, visibleScore: -1 })
        
        this.stats.push({ image: coinImage, score: this.gameState.activePlayer.coins, visibleScore: -1 })

        this.revealScore()
    }

    get itemLength() {
        return this.stats.length
    }

    async revealScore() {
        for (let i = 0; i < this.stats.length; i++) {
            await sleep(1000)
            
            this.stats[i].visibleScore = 0

            this.gameState.emitStateChange()

            while (this.stats[i].visibleScore < this.stats[i].score) {
                await sleep(this.stats[i].visibleScore > 15 ? this.stats[i].visibleScore > 30 ? 10 : 50 : 100)
                this.stats[i].visibleScore++
                this.gameState.emitStateChange()
            }
        }

        this.doneRevealing = true
        this.gameState.emitStateChange()
    }
}