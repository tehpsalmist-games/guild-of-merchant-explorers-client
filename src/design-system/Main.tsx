import React, { ComponentProps } from 'react'

export interface MainProps extends ComponentProps<'main'> {}

export const Main = ({ className = '', ...props }: MainProps) => {
  return <main className={`${className} min-h-screen pt-12`} {...props} />
}
