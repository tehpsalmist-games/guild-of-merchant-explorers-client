import React, { ComponentProps } from 'react'

export interface LoadingProps extends ComponentProps<'div'> {}

export const Loading = ({ className = '', ...props }: LoadingProps) => {
  return (
    <div className={`${className} flex-center h-full`} {...props}>
      Loading...
    </div>
  )
}
