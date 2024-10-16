import React, { ComponentProps } from 'react'
import clsx from 'clsx'
import { Main } from '../design-system/Main'
import { gomeArt } from '../images'

export interface HomeProps extends ComponentProps<'main'> {}

export const Home = ({ className = '', ...props }: HomeProps) => {
  return (
    <Main
      className={clsx(className, 'flex-center flex-col gap-4 bg-cover bg-center')}
      style={{ ...props.style, backgroundImage: `url(${gomeArt.href})` }}
      {...props}
    />
  )
}
