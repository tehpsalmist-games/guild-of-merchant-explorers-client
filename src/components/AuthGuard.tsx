import { Redirect } from '@8thday/react'
import { SignedIn, SignedOut } from '@nhost/react'
import React, { ReactNode } from 'react'

export interface AuthGuardProps {
  children: ReactNode
  invertGuard?: boolean
  redirectTo?: string
}

export const AuthGuard = ({ children, invertGuard = false, redirectTo = '/online/login' }: AuthGuardProps) => {
  if (invertGuard) {
    return (
      <>
        <SignedOut>{children}</SignedOut>
        <SignedIn>
          <Redirect to={redirectTo} />
        </SignedIn>
      </>
    )
  }
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Redirect to={redirectTo} />
      </SignedOut>
    </>
  )
}
