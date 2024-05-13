const placeBlockSFXURL = new URL('/src/audio/place-block.wav', import.meta.url)
const villageSFXURL = new URL('/src/audio/village.wav', import.meta.url)

const coin1SFXURL = new URL('/src/audio/coin-1.wav', import.meta.url)
const coin2SFXURL = new URL('/src/audio/coin-2.wav', import.meta.url)

const cardFlipSFXURL = new URL('/src/audio/card-flip.wav', import.meta.url)

const towerSFXURL = new URL('/src/audio/tower.wav', import.meta.url)
const treasureSFXURL = new URL('/src/audio/treasure.wav', import.meta.url)
const crystalSFXURL = new URL('/src/audio/crystal.wav', import.meta.url)

export const placeBlockSFX = new Audio(placeBlockSFXURL.href)
export const villageSFX = new Audio(villageSFXURL.href)
export const coin1SFX = new Audio(coin1SFXURL.href)
export const coin2SFX = new Audio(coin2SFXURL.href)
export const cardFlipSFX = new Audio(cardFlipSFXURL.href)
export const towerSFX = new Audio(towerSFXURL.href)
export const treasureSFX = new Audio(treasureSFXURL.href)
export const crystalSFX = new Audio(crystalSFXURL.href)

// super easy usage: placeBlockSFX.play()
