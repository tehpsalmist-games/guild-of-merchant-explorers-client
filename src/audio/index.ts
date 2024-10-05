const placeBlock1SFXURL = new URL('/src/audio/place-block-1.wav', import.meta.url)
const placeBlock2SFXURL = new URL('/src/audio/place-block-2.wav', import.meta.url)
const villageSFXURL = new URL('/src/audio/village.wav', import.meta.url)

const coin1SFXURL = new URL('/src/audio/coin-1.wav', import.meta.url)
const coin2SFXURL = new URL('/src/audio/coin-2.wav', import.meta.url)

const cardFlipSFXURL = new URL('/src/audio/card-flip.wav', import.meta.url)
const cardSFXURL = new URL('/src/audio/card.wav', import.meta.url)
const completeObjectiveSFXURL = new URL('/src/audio/complete-objective.wav', import.meta.url)

const towerSFXURL = new URL('/src/audio/tower.wav', import.meta.url)
const treasureSFXURL = new URL('/src/audio/treasure.wav', import.meta.url)
const crystalSFXURL = new URL('/src/audio/crystal.wav', import.meta.url)
const tradeSFXURL = new URL('/src/audio/trade.wav', import.meta.url)

export const placeBlock1SFX = new Audio(placeBlock1SFXURL.href)
export const placeBlock2SFX = new Audio(placeBlock2SFXURL.href)
export const villageSFX = new Audio(villageSFXURL.href)
export const coin1SFX = new Audio(coin1SFXURL.href)
export const coin2SFX = new Audio(coin2SFXURL.href)
export const cardFlipSFX = new Audio(cardFlipSFXURL.href)
export const cardSFX = new Audio(cardSFXURL.href)
export const completeObjectiveSFX = new Audio(completeObjectiveSFXURL.href)
export const towerSFX = new Audio(towerSFXURL.href)
export const treasureSFX = new Audio(treasureSFXURL.href)
export const crystalSFX = new Audio(crystalSFXURL.href)
export const tradeSFX = new Audio(tradeSFXURL.href)

// super easy usage: placeBlockSFX.play()
//
// for sounds that will be played in quick succession, use the currentTime property to reset the sound:
// placeBlockSFX.currentTime = 0
// this will start the sound over and allow it to be played again immediately
