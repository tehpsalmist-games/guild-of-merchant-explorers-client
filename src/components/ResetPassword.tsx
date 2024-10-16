import React, { ComponentProps } from 'react'
import { ChangePassword } from './ChangePassword'
import { Main } from '../design-system/Main'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'

export interface ResetPasswordProps extends ComponentProps<'main'> {}

export const ResetPassword = ({ className = '', ...props }: ResetPasswordProps) => {
  const goTo = useNavigate()

  const [searchParams] = useSearchParams()

  const errorType = searchParams.get('error')
  const errorDescription = searchParams.get('errorDescription')

  return (
    <Main className={`${className} flex-center flex-col`} {...props}>
      <h3 className="mb-8">Reset Password</h3>
      {errorType ? (
        <>
          <p>{errorDescription}</p>
          <NavLink to="/online/login" className="link-on-light">
            Return to Login Page
          </NavLink>
        </>
      ) : (
        <ChangePassword className="w-xs" onSuccess={() => goTo('/online/lobby')} />
      )}
    </Main>
  )
}
