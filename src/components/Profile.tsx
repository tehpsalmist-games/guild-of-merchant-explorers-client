import React, { useRef, useState } from 'react'
import { Main } from '../design-system/Main'
import { useNhostClient, useUserData } from '@nhost/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { ChangePassword } from './ChangePassword'
import { Button, TextInput, toast } from '@8thday/react'
import { UPDATE_USER } from '../graphql/mutations'
import { Avatar } from './Avatar'

export interface ProfileProps {}

export const Profile = (_: ProfileProps) => {
  const formRef = useRef<HTMLFormElement>(null)
  const user = useUserData()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')

  const nhost = useNhostClient()

  if (!user) return null

  return (
    <Main className="p-4">
      <Avatar className="mt-4 aspect-square w-48" avatarUrl={user.avatarUrl} />
      <div className="mb-2">
        <label className="font-medium text-gray-800">Email</label>
        <p>
          <strong>{user.email}</strong>
        </p>
      </div>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault()

          if (
            !displayName ||
            displayName.length < 3 ||
            displayName === user.displayName ||
            !formRef.current?.checkValidity()
          )
            return

          nhost.graphql
            .request(UPDATE_USER, { userId: user.id, set: { displayName } })
            .then((r) => {
              if (r.error) {
                return toast.error({
                  message: 'Trouble Changing Display Name',
                  description: Array.isArray(r.error) ? r.error[0].message : r.error.message,
                })
              }

              toast.success({ message: 'Display Name Updated!' })
            })
            .catch(console.error)
        }}
        className="flex max-w-xs gap-x-2"
      >
        <TextInput
          className="grow"
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          collapseDescriptionArea
          minLength={3}
          required
        />
        {displayName !== user.displayName && <Button type="submit" className="self-end" PreIcon={CheckIcon} />}
      </form>
      <hr className="my-4" />
      <h3>Change Password</h3>
      <ChangePassword className="max-w-xs" />
    </Main>
  )
}
