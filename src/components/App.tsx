import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { plankPanelHorizontal } from '../images'
import { SignedIn, SignedOut, useSignOut, useUserData } from '@nhost/react'
import { toast, useOnlyOnce } from '@8thday/react'
import clsx from 'clsx'
import { UserCircleIcon } from '@heroicons/react/24/outline'

const navClasses = 'flex-center px-3 font-semibold text-white hover:bg-white/10'

export interface AppProps {}

export const App = (_: AppProps) => {
  const { signOut } = useSignOut()

  const user = useUserData()

  useOnlyOnce(() => toast.success({ message: `Welcome, ${user?.displayName}!` }), !!user)

  return (
    <>
      <nav
        className="fixed top-0 z-10 flex h-12 w-full items-stretch"
        style={{ backgroundImage: `url(${plankPanelHorizontal.href})` }}
      >
        <NavLink to="local" className={({ isActive }) => clsx(navClasses, isActive && 'bg-white/15')}>
          Play Local
        </NavLink>
        <NavLink to="online" className={({ isActive }) => clsx(navClasses, isActive && 'bg-white/15')}>
          Play Online
        </NavLink>
        <SignedOut>
          <NavLink
            to="online/login"
            className={({ isActive }) => clsx(navClasses, 'ml-auto', isActive && 'bg-white/15')}
          >
            Login
          </NavLink>
        </SignedOut>
        <SignedIn>
          <button className={clsx(navClasses, 'ml-auto')} onClick={() => signOut()}>
            Logout
          </button>
          <NavLink to="profile" className={({ isActive }) => clsx(navClasses, isActive && 'bg-white/15')}>
            {user?.avatarUrl ? (
              <img src={user?.avatarUrl} className="aspect-square max-h-10 rounded-full" />
            ) : (
              <UserCircleIcon className="h-6 w-6" />
            )}
          </NavLink>
        </SignedIn>
      </nav>
      <Outlet />
    </>
  )
}
