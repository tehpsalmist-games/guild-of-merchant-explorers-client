import { useNhostClient } from '@nhost/react'
import React, { ComponentProps, useState } from 'react'
import { Button, Modal, toast } from '@8thday/react'
import { EyeIcon, EyeSlashIcon, PaperAirplaneIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/16/solid'
import { getGraphqlErrorMessage } from '../graphql/utils'
import clsx from 'clsx'
import { usePlayerList } from '../hooks/usePlayerList'
import { CLOSE_ROOM, DISINVITE_PLAYER, INVITE_PLAYER, UPDATE_ROOM } from '../graphql/mutations'

export interface HostControlsProps extends ComponentProps<'div'> {
  room: any
  buttonClasses?: string
}

export const HostControls = ({ className = '', buttonClasses = '', room, ...props }: HostControlsProps) => {
  const nhost = useNhostClient()

  const { list, userLookup } = usePlayerList()

  const availablePlayers = list.filter((u) => u.id !== room.host_id && room.members.every((m) => m.player_id !== u.id))

  const [invitingUsers, setInvitingUsers] = useState(false)

  return (
    <div className={clsx(className, 'flex gap-x-1')} {...props}>
      <Button
        variant="primary"
        className={buttonClasses}
        PreIcon={UserGroupIcon}
        onClick={() => setInvitingUsers(true)}
      />
      <Button
        variant={room.is_public ? 'primary' : 'secondary'}
        className={buttonClasses}
        PreIcon={room.is_public ? EyeIcon : EyeSlashIcon}
        onClick={async () => {
          const is_public = !room.is_public

          const res = await nhost.graphql.request(UPDATE_ROOM, { id: room.id, set: { is_public } })

          if (res.error) {
            return toast.error({
              message: 'Trouble making this table public...',
              description: getGraphqlErrorMessage(res.error),
            })
          }

          toast.success({ message: `Table is now ${is_public ? 'Public' : 'Private'}` })
        }}
      />
      <Button
        variant="dismissive"
        className={buttonClasses}
        PreIcon={XMarkIcon}
        onClick={async () => {
          if (!confirm('Folding up this table will lose any current game progress. Continue?')) {
            return
          }

          const res = await nhost.graphql.request(CLOSE_ROOM, { id: room.id })

          if (res.error) {
            toast.error({
              message: 'Trouble folding up table...',
              description: getGraphqlErrorMessage(res.error),
            })
          }
        }}
      />
      {invitingUsers && (
        <Modal onClose={() => setInvitingUsers(false)}>
          <div className="min-w-64">
            <h3 className="mb-4 text-center">{room.name}</h3>
            <h4>At the Table</h4>
            <ul className="-mx-2">
              <li className="px-2 py-1">{userLookup[room.host_id]?.displayName}</li>
              {room.members.map((m) => (
                <li
                  key={m.player_id}
                  className="flex items-center justify-between px-2 py-1 even:bg-gray-50 hover:bg-gray-100"
                >
                  {userLookup[m.player_id]?.displayName}
                  <Button
                    variant="dismissive"
                    className={buttonClasses}
                    PreIcon={XMarkIcon}
                    onClick={async () => {
                      if (!confirm('Are you sure you want to remove this player from the game?')) {
                        return
                      }

                      const res = await nhost.graphql.request(DISINVITE_PLAYER, { roomMemberId: m.id })

                      if (res.error) {
                        return toast.error({
                          message: 'Trouble folding up table...',
                          description: getGraphqlErrorMessage(res.error),
                        })
                      }

                      toast.success({ message: `${userLookup[m.player_id]?.displayName} has been disinvited.` })
                    }}
                  />
                </li>
              ))}
            </ul>
            <h4>Invite a Player</h4>
            <ul className="-mx-2">
              {availablePlayers.length === 0 && (
                <p className="px-2">
                  <em>No one{room.members.length > 0 && ' else'} is available to play. :(</em>
                </p>
              )}
              {availablePlayers.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between px-2 py-1 even:bg-gray-50 hover:bg-gray-100"
                >
                  {u.displayName}
                  <Button
                    variant="primary"
                    PreIcon={PaperAirplaneIcon}
                    className={buttonClasses}
                    onClick={async () => {
                      const res = await nhost.graphql.request(INVITE_PLAYER, { playerId: u.id, roomId: room.id })

                      if (res.error) {
                        return toast.error({
                          message: 'Trouble inviting player...',
                          description: getGraphqlErrorMessage(res.error),
                        })
                      }

                      return toast.success({ message: `${u.displayName} Invited!` })
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
    </div>
  )
}
