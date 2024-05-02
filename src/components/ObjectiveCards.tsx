import clsx from 'clsx'
import React, { ComponentProps, useEffect, useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { blockImage, era2Blocker, era3Blocker, eraAnyBlocker, treasureChestImage } from '../images'
import { useEventListener } from '@8thday/react'

export interface ObjectiveCardsProps extends ComponentProps<'div'> {}

export const ObjectiveCards = ({ className = '', ...props }: ObjectiveCardsProps) => {
  const [inView, setInView] = useState(true)

  const { gameState } = useGameState()

  useEventListener('keydown', (e) => {
    if (e.key === 'w') {
      setInView((v) => !v)
    }
  })

  useEffect(() => {
    const listener = () => setInView(true)
    gameState.activePlayer.addEventListener('objective-achieved', listener)

    return () => gameState.activePlayer.removeEventListener('objective-achieved', listener)
  }, [gameState.activePlayer])

  return (
    <div
      className={clsx(
        className,
        `absolute left-0 top-16 z-10 flex w-full cursor-pointer justify-evenly transition-all duration-200`,
        inView ? 'translate-y-2 opacity-100' : '-translate-y-[80%] opacity-50',
      )}
      onClick={() => setInView((v) => !v)}
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
                className={clsx('left-1/5 absolute top-1/2 h-1/3')}
              />
            )}
            {card.isSecondBlocked && i === 0 && (
              <img
                src={era3Blocker.href}
                alt="era 3 objective blocker"
                className={clsx('right-1/5 absolute top-1/2 h-1/3')}
              />
            )}
            {card.isFirstBlocked && i === 1 && (
              <img
                src={era3Blocker.href}
                alt="era 3 objective blocker"
                className={clsx('left-1/5 absolute top-1/2 h-1/3')}
              />
            )}
            {card.isSecondBlocked && i === 1 && (
              <img
                src={eraAnyBlocker.href}
                alt="era any objective blocker"
                className={clsx('right-1/5 absolute top-1/2 h-1/3')}
              />
            )}
            {card.isFirstBlocked && i === 2 && (
              <img
                src={eraAnyBlocker.href}
                alt="era any objective blocker"
                className={clsx('left-1/5 absolute top-1/2 h-1/3')}
              />
            )}
            {card.firstPlayers.concat(card.secondPlayers).some((p) => p === gameState.activePlayer) && (
              <img
                src={blockImage.href}
                alt="explorer block"
                className={clsx(
                  'absolute top-1/2 h-1/6 -translate-y-1/2 hue-rotate-[120deg] saturate-200',
                  card.firstPlayers.includes(gameState.activePlayer) ? 'left-1/4 ' : 'right-1/4',
                )}
              />
            )}
          </div>
        ) : (
          <div key={i} className="w-full max-w-1/4" />
        ),
      )}
    </div>
  )
}
