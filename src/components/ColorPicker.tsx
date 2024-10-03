import React, { ComponentProps } from 'react'
import { ExplorerBlock } from './ExplorerBlock'
import { Option, Select } from './Select'
import clsx from 'clsx'
import { ButtonProps } from '@8thday/react'

const colors = [
  'hue-rotate-[310deg] saturate-[7] brightness-[0.7]', // red
  'hue-rotate-[350deg] saturate-[6] brightness-[0.9]', // orange
  'hue-rotate-[10deg] saturate-[7]', // yellow
  'hue-rotate-[30deg] saturate-[5]', // green
  'hue-rotate-[120deg] saturate-[3]', // blue
  'hue-rotate-[150deg] saturate-[3] brightness-[0.8]', // blue
  'hue-rotate-[240deg] saturate-[2] brightness-[0.9]', // purple
  'hue-rotate-[290deg] saturate-[3]', // pink
]

export interface ColorPickerProps extends Omit<ButtonProps, 'onSelect'> {
  value: string
  onValueChange(newVal: string): void
  disabledColors?: string[]
}

export const ColorPicker = ({
  className = '',
  value,
  onValueChange,
  disabledColors = [],
  ...props
}: ColorPickerProps) => {
  return (
    <Select
      variant="dismissive"
      className={clsx(className, 'h-10')}
      value={value}
      onSelect={onValueChange}
      selectionDisplay={(label) => (
        <ExplorerBlock className={clsx('h-9', !label && 'opacity-50')} color={label ?? ''} />
      )}
      {...props}
    >
      {colors.map(
        (color) =>
          !disabledColors.includes(color) && (
            <Option label={color}>
              <ExplorerBlock color={color} className="h-10" />
            </Option>
          ),
      )}
    </Select>
  )
}
