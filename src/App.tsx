import React, { ComponentProps, useEffect, useState } from 'react'
import { ExplorerMap } from './ExplorerMap'
import { aghonData } from './data/boards/aghon'
import { Board } from './game-logic/Board'

const bgImage = new URL('/src/images/Aghon.jpeg', import.meta.url)

const aghonBoard = new Board(aghonData)

console.log(aghonBoard)

export interface AppProps extends ComponentProps<'main'> {}

export const App = ({ className = '', ...props }: AppProps) => {
  const updateState = useState(false)[1]

  useEffect(() => {
    aghonBoard.addEventListener('statechange', () => updateState((s) => !s))
  }, [])

  return (
    <main className={`${className} flex-center h-screen`} {...props}>
      <div
        className="aghon relative aspect-[1416/990] w-full max-w-full bg-cover"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <ExplorerMap
          board={aghonBoard}
          className="absolute"
          style={{ top: `${(105 / 990) * 100}%`, left: `${(101 / 1416) * 100}%`, width: `${(1229 / 1416) * 100}%` }}
        />
      </div>
    </main>
  )
}
