import { Button, TextInput, toast } from '@8thday/react'
import { useChangePassword } from '@nhost/react'
import React, { ComponentProps, useState } from 'react'

export interface ChangePasswordProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  onSuccess?(): void
}

export const ChangePassword = ({ className = '', onSuccess, ...props }: ChangePasswordProps) => {
  const { changePassword } = useChangePassword()

  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const disabled = confirmNewPassword !== newPassword

  return (
    <form
      className={`${className}`}
      onSubmit={async (e) => {
        e.preventDefault()

        if (disabled) return

        const changeResult = await changePassword(newPassword)

        if (changeResult.isError) {
          return toast.error({ message: 'Trouble Changing Password 🙁', description: changeResult.error?.message })
        }

        if (changeResult.isSuccess) {
          toast.success({ message: 'Password Updated!', description: "Don't forget to save it somewhere safe!" })
          onSuccess?.()
        }
      }}
      {...props}
    >
      <TextInput
        label="New Password"
        type="password"
        name="new_password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <TextInput
        label="Confirm New Password"
        type="password"
        name="confirm_password"
        autoComplete="new-password"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        errorMessage={confirmNewPassword && disabled ? 'Passwords do not match.' : ''}
      />
      <Button variant="primary" type="submit" disabled={disabled}>
        Submit
      </Button>
    </form>
  )
}
