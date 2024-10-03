import { Button, ButtonProps, ButtonVariants } from '@8thday/react'
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListItem,
  useListNavigation,
  useRole,
  useTypeahead,
} from '@floating-ui/react'
import clsx from 'clsx'
import React, { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'

interface SelectContextValue {
  activeIndex: number | null
  selectedIndex: number | null
  getItemProps: ReturnType<typeof useInteractions>['getItemProps']
  handleSelect: (index: number | null) => void
}

const SelectContext = createContext<SelectContextValue>({} as SelectContextValue)
export interface SelectProps extends Omit<ButtonProps, 'onSelect'> {
  value: string
  onSelect(val: string): void
  selectionDisplay?(label: string | null): ReactNode
}

export const Select = ({ value, onSelect, selectionDisplay, children, ...props }: SelectProps) => {
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(value)

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom',
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [flip()],
  })

  const elementsRef = useRef<Array<HTMLElement | null>>([])
  const labelsRef = useRef<Array<string | null>>([])

  const handleSelect = useCallback((index: number | null) => {
    setSelectedIndex(index)
    setIsOpen(false)
    if (index !== null) {
      setSelectedLabel(labelsRef.current[index])
      onSelectRef.current(labelsRef.current[index] ?? '')
    }
  }, [])

  function handleTypeaheadMatch(index: number | null) {
    if (isOpen) {
      setActiveIndex(index)
    } else {
      handleSelect(index)
    }
  }

  const listNav = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
  })
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    selectedIndex,
    onMatch: handleTypeaheadMatch,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'listbox' })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    listNav,
    typeahead,
    click,
    dismiss,
    role,
  ])

  const selectContext = useMemo(
    () => ({
      activeIndex,
      selectedIndex,
      getItemProps,
      handleSelect,
    }),
    [activeIndex, selectedIndex, getItemProps, handleSelect],
  )

  return (
    <>
      <Button ref={refs.setReference} {...getReferenceProps()} {...props}>
        {selectionDisplay ? selectionDisplay(selectedLabel) : selectedLabel ?? 'Select...'}
      </Button>
      <SelectContext.Provider value={selectContext}>
        {isOpen && (
          <FloatingFocusManager context={context} modal={false}>
            <div
              className="z-30 flex flex-col gap-y-0.5 rounded bg-white shadow-md"
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
                {children}
              </FloatingList>
            </div>
          </FloatingFocusManager>
        )}
      </SelectContext.Provider>
    </>
  )
}

export const Option = ({
  label,
  children,
  className = '',
}: {
  label?: string
  children: ReactNode
  className?: string
}) => {
  const { activeIndex, selectedIndex, getItemProps, handleSelect } = useContext(SelectContext)

  const { ref, index } = useListItem({ label })

  const isActive = activeIndex === index
  const isSelected = selectedIndex === index

  return (
    <button
      ref={ref}
      role="option"
      aria-selected={isActive && isSelected}
      tabIndex={isActive ? 0 : -1}
      className={clsx(className, 'px-2 py-1', {
        'bg-gray-50': isActive,
        'bg-sky-300': isSelected,
      })}
      {...getItemProps({
        onClick: () => handleSelect(index),
      })}
    >
      {children || label}
    </button>
  )
}
