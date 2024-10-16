import React, { ComponentProps } from 'react'
import { Main } from '../design-system/Main'

export interface LobbyProps extends ComponentProps<'div'> {}

export const Lobby = ({ className = '', ...props }: LobbyProps) => {
  return (
    <Main className={`${className} flex-center`} {...props}>
      <h2 className="text-primary-700">Coming Soon!</h2>
    </Main>
  )
}
