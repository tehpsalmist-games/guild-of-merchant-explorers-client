import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { plankPanelHorizontal } from '../images'
import { SignedIn, SignedOut, useSignOut, useUserData } from '@nhost/react'
import { toast, useOnlyOnce } from '@8thday/react'
import clsx from 'clsx'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { Notifications } from './Notifications'
import { Avatar } from './Avatar'

const navClasses = 'flex-center px-3 font-semibold text-white hover:bg-black/10'

export interface AppProps {}

export const App = (_: AppProps) => {
  const { signOut } = useSignOut()

  const user = useUserData()

  useOnlyOnce(() => toast.success({ message: `Welcome, ${user?.displayName}!` }), !!user)

  return (
    <>
      <nav
        className="fixed bottom-0 z-10 flex h-12 w-full items-stretch sm:bottom-[unset] sm:top-0 sm:flex-row-reverse sm:justify-end"
        style={{ backgroundImage: `url(${plankPanelHorizontal.href})` }}
      >
        <SignedOut>
          <NavLink
            to="online/login"
            className={({ isActive }) => clsx(navClasses, 'ml-auto', isActive && 'bg-black/15')}
          >
            Login
          </NavLink>
        </SignedOut>
        <SignedIn>
          <NavLink
            to="profile"
            className={({ isActive }) => clsx(navClasses, 'mr-auto sm:mr-0', isActive && 'bg-black/15')}
          >
            <Avatar avatarUrl={user?.avatarUrl} className="max-h-10 rounded-full" />
          </NavLink>
          <Notifications className={navClasses} />
          <button className={clsx(navClasses, 'ml-auto !hidden sm:!flex')} onClick={() => signOut()}>
            Logout
          </button>
        </SignedIn>
        <NavLink to="online" className={({ isActive }) => clsx(navClasses, isActive && 'bg-black/15')}>
          Play Online
        </NavLink>
        <NavLink to="local" className={({ isActive }) => clsx(navClasses, isActive && 'bg-black/15')}>
          Play Local
        </NavLink>
      </nav>
      <Outlet />
    </>
  )
}
