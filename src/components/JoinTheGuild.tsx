import { Button } from '@8thday/react'
import { RocketLaunchIcon, UsersIcon } from '@heroicons/react/24/outline'
import React, { ComponentProps } from 'react'
import { useHasJoined } from '../hooks/useHasJoined'

export interface JoinTheGuildProps extends ComponentProps<'div'> {}

export const JoinTheGuild = ({ className = '', ...props }: JoinTheGuildProps) => {
  const { gameName, joinGame } = useHasJoined()

  return (
    <div className={`${className} flex-center flex-col`} {...props}>
      <p className="text-xl ">Join</p>
      <h2>{gameName}</h2>
      <p className="text-lg">Multiplayer Forum</p>
      <p className="my-4 max-w-md text-center text-sm text-gray-500">
        <em>
          Upon entering the forum, you make yourself visible to other players, who can either invite you to join their
          tables or accept your invites to join your tables. Have fun!
        </em>
      </p>
      <Button variant="primary" PreIcon={UsersIcon} PostIcon={RocketLaunchIcon} onClick={joinGame}>
        Let's Play!
      </Button>
    </div>
  )
}
