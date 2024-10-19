import clsx from 'clsx'
import React, { ComponentProps, useEffect, useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { blockImage, era2Blocker, era3Blocker, eraAnyBlocker } from '../images'
import { useEventListener } from '@8thday/react'
import { ExplorerBlock } from './ExplorerBlock'
import { audioTools, uiCardCloseSound, uiCardOpenSound } from '../audio'

export interface ObjectiveCardsProps extends ComponentProps<'div'> {}

export const ObjectiveCards = ({ className = '', ...props }: ObjectiveCardsProps) => {
  const [inView, setInView] = useState(true)

  const { gameState } = useGameState()

  useEventListener('keydown', (e) => {
    if (e.key === 'w') {
      toggleView()
    }
  })

  function toggleView() {
    setInView((v) => !v)
    if (inView) {
      audioTools.play(uiCardCloseSound)
    } else {
      audioTools.play(uiCardOpenSound)
    }
  }

  useEffect(() => {
    const listener = () => {
      setInView(true)
      audioTools.play(uiCardOpenSound)
    }
    gameState.players.forEach((p) => p.addEventListener('objective-achieved', listener))

    return () => gameState.players.forEach((p) => p.removeEventListener('objective-achieved', listener))
  }, [gameState.players])

  return (
    <div
      className={clsx(
        className,
        `absolute left-0 top-16 z-10 flex w-full cursor-pointer justify-evenly transition-all duration-200`,
        inView ? 'translate-y-2 opacity-100' : '-translate-y-[80%] opacity-50',
      )}
      onClick={() => toggleView()}
      {...props}
    >
      {gameState.objectives.map((card, i) =>
        card ? (
          <div key={i} className="relative w-full max-w-1/4">
            <img src={card.imageUrl.href} className="w-full rounded-2xl" />
            {card.isFirstBlocked && i === 0 && (
              <img
                src={era2Blocker.href}
                alt="era 2 objective blocker"
                className={clsx('absolute left-1/5 top-1/2 h-1/3')}
              />
            )}
            {card.isSecondBlocked && i === 0 && (
              <img
                src={era3Blocker.href}
                alt="era 3 objective blocker"
                className={clsx('absolute right-1/5 top-1/2 h-1/3')}
              />
            )}
            {card.isFirstBlocked && i === 1 && (
              <img
                src={era3Blocker.href}
                alt="era 3 objective blocker"
                className={clsx('absolute left-1/5 top-1/2 h-1/3')}
              />
            )}
            {card.isSecondBlocked && i === 1 && (
              <img
                src={eraAnyBlocker.href}
                alt="era any objective blocker"
                className={clsx('absolute right-1/5 top-1/2 h-1/3')}
              />
            )}
            {card.isFirstBlocked && i === 2 && (
              <img
                src={eraAnyBlocker.href}
                alt="era any objective blocker"
                className={clsx('absolute left-1/5 top-1/2 h-1/3')}
              />
            )}
            <div className="absolute left-1/4 top-1/2 grid h-1/6 -translate-y-1/2 grid-cols-2 gap-2">
              {card.firstPlayers.map((p) => (
                <ExplorerBlock key={p.id} color={p.color} className="h-10" />
              ))}
            </div>
            <div className="absolute right-1/4 top-1/2 grid h-1/6 -translate-y-1/2 grid-cols-2 gap-2">
              {card.secondPlayers.map((p) => (
                <ExplorerBlock key={p.id} color={p.color} className="h-8" />
              ))}
            </div>
          </div>
        ) : (
          <div key={i} className="w-full max-w-1/4" />
        ),
      )}
    </div>
  )
}
