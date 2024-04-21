import clsx from 'clsx'
import React, { ComponentProps, useState } from 'react'
import { useGameState } from '../hooks/useGameState'

export interface EraCardsProps extends ComponentProps<'div'> {}

export const EraCards = ({ className = '', ...props }: EraCardsProps) => {
  const [inView, setInView] = useState(false)

  const { gameState } = useGameState()

  const slots = [
    gameState.activePlayer.investigateCards[0],
    gameState.activePlayer.investigateCards[1],
    gameState.activePlayer.investigateCards[2],
  ]

  if (!gameState.activePlayer.investigateCards.length) {
    return null
  }

  return (
    <div
      className={clsx(
        className,
        `absolute left-0 top-0 z-10 flex h-full cursor-pointer flex-col justify-evenly pb-12 transition-all duration-200`,
        inView ? 'translate-x-2' : '-translate-x-[80%]',
      )}
      onClick={() => setInView((v) => !v)}
      {...props}
    >
      {slots.map((card) =>
        card ? (
          <img src={card.imageUrl.href} className="h-full max-h-1/4 rounded-2xl" />
        ) : (
          <div className="h-full max-h-1/4" />
        ),
      )}
    </div>
  )
}