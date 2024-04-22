import clsx from 'clsx'
import React, { ComponentProps, useState } from 'react'
import { useGameState } from '../hooks/useGameState'

export interface ObjectiveCardsProps extends ComponentProps<'div'> {}

export const ObjectiveCards = ({ className = '', ...props }: ObjectiveCardsProps) => {
  const [inView, setInView] = useState(false)

  const { gameState } = useGameState()

  return (
    <div
      className={clsx(
        className,
        `absolute bottom-0 left-0 z-10 flex w-full cursor-pointer justify-evenly pl-[10%] transition-all duration-200`,
        inView ? '-translate-y-2' : 'translate-y-[80%]',
      )}
      onClick={() => setInView((v) => !v)}
      {...props}
    >
      {gameState.objectives.map((card) =>
        card ? (
          <img src={card.imageUrl.href} className="w-full max-w-1/4 rounded-2xl" />
        ) : (
          <div className="w-full max-w-1/4" />
        ),
      )}
    </div>
  )
}
