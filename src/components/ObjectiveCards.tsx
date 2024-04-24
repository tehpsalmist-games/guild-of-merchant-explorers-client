import clsx from 'clsx'
import React, { ComponentProps, useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { blockImage } from '../images'

export interface ObjectiveCardsProps extends ComponentProps<'div'> {}

export const ObjectiveCards = ({ className = '', ...props }: ObjectiveCardsProps) => {
  const [inView, setInView] = useState(false)

  const { gameState } = useGameState()

  return (
    <div
      className={clsx(
        className,
        `absolute bottom-0 left-0 z-10 flex w-full cursor-pointer justify-evenly pl-[10%] transition-all duration-200`,
        inView ? '-translate-y-2 opacity-100' : 'translate-y-[80%] opacity-50',
      )}
      onClick={() => setInView((v) => !v)}
      {...props}
    >
      {gameState.objectives.map((card, i) =>
        card ? (
          <div key={i} className="relative w-full max-w-1/4">
            <img src={card.imageUrl.href} className="w-full rounded-2xl" />
            {card.firstPlayers.some((p) => p === gameState.activePlayer) && (
              <img
                src={blockImage.href}
                alt="explorer block"
                className="absolute left-1/4 top-1/2 h-6 -translate-y-1/2"
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
