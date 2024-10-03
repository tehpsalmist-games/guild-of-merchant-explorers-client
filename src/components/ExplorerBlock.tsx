import React, { ComponentProps } from 'react'
import clsx from 'clsx'
import { blockImage } from '../images'

export interface ExplorerBlockProps extends Omit<ComponentProps<'img'>, 'src' | 'alt'> {
  color: string
}

export const ExplorerBlock = ({ className = '', color, ...props }: ExplorerBlockProps) => {
  return <img src={blockImage.href} alt="explorer block" className={clsx(color, className)} {...props} />
}
