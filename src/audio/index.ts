import { AudioTools } from '../game-logic/AudioTools'

const placeBlock1URL = new URL('/src/audio/place-block-1.wav', import.meta.url)
const placeBlock2URL = new URL('/src/audio/place-block-2.wav', import.meta.url)
const villageURL = new URL('/src/audio/village.wav', import.meta.url)

const coin1URL = new URL('/src/audio/coin-1.wav', import.meta.url)
const coin2URL = new URL('/src/audio/coin-2.wav', import.meta.url)

const completeObjectiveURL = new URL('/src/audio/complete-objective.wav', import.meta.url)

const towerURL = new URL('/src/audio/tower.wav', import.meta.url)
const treasureURL = new URL('/src/audio/treasure.wav', import.meta.url)
const crystalURL = new URL('/src/audio/crystal.wav', import.meta.url)
const tradeURL = new URL('/src/audio/trade.wav', import.meta.url)

const uiCardCloseURL = new URL('/src/audio/ui-card-close.wav', import.meta.url)
const uiCardOpenURL = new URL('/src/audio/ui-card-open.wav', import.meta.url)
const uiWoodCloseURL = new URL('/src/audio/ui-wood-close.wav', import.meta.url)
const uiWoodOpenURL = new URL('/src/audio/ui-wood-open.wav', import.meta.url)

export const uiCardCloseSound = new Audio(uiCardCloseURL.href)
export const uiCardOpenSound = new Audio(uiCardOpenURL.href)
export const uiWoodCloseSound = new Audio(uiWoodCloseURL.href)
export const uiWoodOpenSound = new Audio(uiWoodOpenURL.href)

export const placeBlock1Sound = new Audio(placeBlock1URL.href)
export const placeBlock2Sound = new Audio(placeBlock2URL.href)
export const villageSound = new Audio(villageURL.href)
export const coin1Sound = new Audio(coin1URL.href)
export const coin2Sound = new Audio(coin2URL.href)
export const completeObjectiveSound = new Audio(completeObjectiveURL.href)
export const towerSound = new Audio(towerURL.href)
export const treasureSound = new Audio(treasureURL.href)
export const crystalSound = new Audio(crystalURL.href)
export const tradeSound = new Audio(tradeURL.href)

export const audioTools = new AudioTools()

// super easy usage: placeBlockSFX.play()
//
// for sounds that will be played in quick succession, use the currentTime property to reset the sound:
// placeBlockSFX.currentTime = 0
// this will start the sound over and allow it to be played again immediately
//
// I made a helper function in AudioTools to do this for you:
// audioTools.play(placeBlockSFX)
