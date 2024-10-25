import React, { ComponentProps, useState } from 'react'
import clsx from 'clsx'

export interface AvatarProps extends ComponentProps<'div'> {
  avatarUrl?: string
}

export const Avatar = ({ className = '', avatarUrl, ...props }: AvatarProps) => {
  const [imageErrored, setImageErrored] = useState(false)

  return (
    <div className={clsx(`block aspect-square overflow-hidden rounded-full bg-gray-100`, className)} {...props}>
      {avatarUrl && !imageErrored ? (
        <img
          onError={() => setImageErrored(true)}
          className="block h-full w-full rounded-full"
          src={avatarUrl}
          alt="User Avatar"
        />
      ) : (
        <svg className="h-full w-full text-primary-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </div>
  )
}
