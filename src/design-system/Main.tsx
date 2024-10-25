import React, { ComponentProps } from 'react'

export interface MainProps extends ComponentProps<'main'> {}

export const Main = ({ className = '', ...props }: MainProps) => {
  return <main className={`${className} min-h-screen pb-12 sm:pb-0 sm:pt-12`} {...props} />
}
