import React, { ComponentProps } from 'react'
import { useParams } from 'react-router-dom'

export interface GameRoomProps extends ComponentProps<'div'> {}

export const GameRoom = ({ className = '', ...props }: GameRoomProps) => {
  const { roomId } = useParams()

  return (
    <div className={`${className}`} {...props}>
      Room: {roomId}
    </div>
  )
}
