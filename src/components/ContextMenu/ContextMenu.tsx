import { PropsWithChildren, ReactElement, ReactHTMLElement, useCallback, useEffect, useRef, useState } from 'react'
import { Portal } from 'react-portal'

import styles from './contextmenu.module.scss'
import { calculatePositionedStyle } from '@/utils/components'

const PIXEL_SPACING = 4

type Position = 'top' | 'bottom' | 'left' | 'right'

export interface MenuItemType {
  divider?: true
  label?: string | ReactHTMLElement<HTMLAnchorElement> | ReactElement
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

interface ContextMenuProps {
  disabled?: boolean
  items: MenuItemType[]
  leftClick?: boolean
  offset?: number
  position: Position
  triggerId: string
  wrapperStyle?: React.CSSProperties
  onOpen?: () => void
}

const ContextMenu = ({
  children,
  triggerId,
  position,
  leftClick,
  items,
  offset = 0,
  wrapperStyle,
  onOpen,
}: PropsWithChildren<ContextMenuProps>) => {
  const [isOpen, setOpen] = useState(false)
  const [appliedStyle, setAppliedStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const elemRef = useRef<HTMLDivElement>(null)

  function recalculatePosition() {
    if (!containerRef.current || !elemRef.current) {
      return
    }
    const styles = calculatePositionedStyle(containerRef.current, elemRef.current, position, offset)
    setAppliedStyle(styles)
  }

  const onClickListener = useCallback(
    (_e: MouseEvent) => {
      setOpen(!isOpen)
    },
    [isOpen],
  )

  const onClickOutsideListener = useCallback(
    (e: MouseEvent) => {
      const el = containerRef.current
      // @ts-ignore
      if (isOpen && el && !el.contains(e.target)) {
        setOpen(false)
      }
    },
    [isOpen],
  )

  useEffect(() => {
    const el = document.getElementById(triggerId)
    if (!el) {
      return
    }
    el.addEventListener(leftClick ? 'click' : 'contextmenu', onClickListener)
    return () => {
      el.removeEventListener(leftClick ? 'click' : 'contextmenu', onClickListener)
    }
  }, [leftClick, onClickListener])

  useEffect(() => {
    document.addEventListener('click', onClickOutsideListener)
    document.addEventListener('contextmenu', onClickOutsideListener)
    return () => {
      document.removeEventListener('click', onClickOutsideListener)
      document.removeEventListener('contextmenu', onClickOutsideListener)
    }
  }, [onClickOutsideListener])

  useEffect(() => {
    if (isOpen) {
      if (onOpen) onOpen()
      recalculatePosition()
    }
  }, [isOpen])

  return (
    <div className="relative h-fit w-fit" ref={containerRef} style={wrapperStyle}>
      {typeof children === 'function'
        ? // @ts-ignore
          children({ isOpen })
        : children}
      {isOpen && (
        <Portal>
          <div className={styles.contextMenu} ref={elemRef} style={appliedStyle}>
            {items.map((item, index) => {
              if (item.divider) {
                return <div className="min-h-[1px] w-full bg-light-16" key={`divider-${index}`} />
              }
              return (
                <div
                  key={`menu-item-${index}`}
                  className={styles.contextMenuItem}
                  onClick={(e) => {
                    setOpen(false)
                    item?.onClick?.(e)
                  }}
                >
                  {item.label}
                </div>
              )
            })}
          </div>
        </Portal>
      )}
    </div>
  )
}

export default ContextMenu
