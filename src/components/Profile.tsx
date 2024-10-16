import React, { ComponentProps } from 'react'
import { Main } from '../design-system/Main'
import { useUserData } from '@nhost/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { ChangePassword } from './ChangePassword'

export interface ProfileProps {}

export const Profile = (_: ProfileProps) => {
  const user = useUserData()

  if (!user) return null

  return (
    <Main className="p-4">
      {user.avatarUrl ? <img src={user.avatarUrl} className="rounded-full" alt="Profile Pic" /> : <UserCircleIcon />}
      <p>Email: {user.email}</p>
      <p>Display Name: {user.displayName}</p>
      <hr className="my-4" />
      <h3>Change Password</h3>
      <ChangePassword className="w-xs" />
    </Main>
  )
}
