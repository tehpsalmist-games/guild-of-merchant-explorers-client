import clsx from 'clsx'
import React, { ComponentProps, useState } from 'react'
import { useEventListener } from '@8thday/react'
import { Player } from '../game-logic/GameState'
import { audioTools, uiCardCloseSound, uiCardOpenSound } from '../audio'

export interface EraCardsProps extends ComponentProps<'div'> {
  player: Player
}

export const EraCards = ({ className = '', player, ...props }: EraCardsProps) => {
  const [inView, setInView] = useState(false)

  useEventListener('keydown', (a) => {
    if (a.key === 'a') {
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

  const chosenCards = player.investigateCards.chosenCards

  const slots = [chosenCards[0], chosenCards[1], chosenCards[2]]

  if (!player.investigateCards.size) {
    return null
  }

  return (
    <div
      className={clsx(
        className,
        `absolute left-0 top-0 z-10 flex h-full w-[14%] cursor-pointer flex-col justify-evenly pb-12 transition-all duration-200`,
        inView ? 'translate-x-2 items-start opacity-100' : '-translate-x-[80%] opacity-70',
      )}
      onClick={() => toggleView()}
      {...props}
    >
      {slots.map((card, i) =>
        card ? (
          <img key={i} src={card.card.imageUrl.href} className="h-full max-h-1/4 rounded-2xl" />
        ) : (
          <div key={i} className="h-full max-h-1/4" />
        ),
      )}
    </div>
  )
}
