import { Button, TextInput, toast, Toggle, useRememberedState } from '@8thday/react'
import { useResetPassword, useSignInEmailPassword, useSignUpEmailPassword } from '@nhost/react'
import React, { ComponentProps, useState } from 'react'
import { Main } from '../design-system/Main'

export interface LoginFormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {}

export const LoginForm = ({ className = '', ...props }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loggingIn, setLoggingIn] = useRememberedState('get-a-room-login-or-signup', false)

  const { signInEmailPassword } = useSignInEmailPassword()
  const { signUpEmailPassword } = useSignUpEmailPassword()

  const { resetPassword } = useResetPassword()

  const disabled = !email || !password || (!loggingIn && confirmPassword !== password)

  return (
    <Main className="flex-center">
      <form
        className={`${className} flex min-w-xs flex-col`}
        {...props}
        onSubmit={async (e) => {
          e.preventDefault()

          if (disabled) return

          if (loggingIn) {
            const loginResult = await signInEmailPassword(email, password)

            if (loginResult.isError) {
              return toast.error({ message: 'Trouble Logging In 🙁', description: loginResult.error?.message })
            }
          } else {
            const signupResult = await signUpEmailPassword(email, password)

            if (signupResult.isError) {
              return toast.error({ message: 'Trouble Signing Up 🙁', description: signupResult.error?.message })
            }
          }
        }}
      >
        <h3 className="mb-2 text-center text-2xl text-gray-700">Type, Friend, and Enter</h3>
        <p className="mb-4 text-center text-xs text-gray-500">
          <em>But not literally...you'll need to pick a unique email and password.</em>
        </p>
        <TextInput
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextInput
          label={`${!loggingIn ? 'Create a ' : ''}Password`}
          type="password"
          minLength={9}
          name={loggingIn ? 'password' : 'new_password'}
          autoComplete={loggingIn ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!loggingIn && (
          <TextInput
            label="Confirm Your Password"
            type="password"
            name="confirm_password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            errorMessage={confirmPassword && confirmPassword !== password ? 'Passwords do not match.' : ''}
          />
        )}
        <Button type="submit" disabled={disabled} className="mt-2 self-start" variant="primary">
          {loggingIn ? 'Log In' : 'Sign Up'}
        </Button>
        <button
          className="link-on-light mt-1 self-start text-sm"
          onClick={async (e) => {
            e.preventDefault()
            e.stopPropagation()

            if (!email) {
              return toast.warn({ message: 'Provide an Email and try again.' })
            }

            const didReset = await resetPassword(email, {
              redirectTo: `${window.location.origin}/online/reset-password`,
            })

            if (didReset.isSent) {
              toast.success({
                message: 'Check your email!',
                description: 'A message has been sent with instructions to reset your password.',
              })
            }

            if (didReset.error) {
              toast.error({ message: 'Trouble requesting password reset:', description: didReset.error.message })
            }
          }}
        >
          Forgot Password
        </button>
        <Toggle
          className="mt-4"
          leftLabel="Signing Up"
          rightLabel="Logging In"
          neitherOff
          setChecked={setLoggingIn}
          checked={loggingIn}
        />
      </form>
    </Main>
  )
}
