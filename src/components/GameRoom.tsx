import React, { ComponentProps } from 'react'
import { useParams } from 'react-router-dom'
import { Main } from '../design-system/Main'

export interface GameRoomProps extends ComponentProps<'main'> {}

export const GameRoom = ({ className = '', ...props }: GameRoomProps) => {
  const { roomId } = useParams()

  return (
    <Main className={`${className} flex-center`} {...props}>
      <h3 className="text-primary-500">Coming Soon!</h3>
    </Main>
  )
}
