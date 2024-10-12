import { PropsWithChildren, ReactElement, ReactHTMLElement, useCallback, useEffect, useRef, useState } from 'react'
import { Portal } from 'react-portal'

import styles from './contextmenu.module.scss'
import { calculatePositionedStyle } from '@/utils/components'

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
  menuStyle?: React.CSSProperties
  menuItemStyle?: React.CSSProperties
  hidden?: boolean
}

const ContextMenu = ({
  disabled,
  children,
  triggerId,
  position,
  leftClick,
  items,
  offset = 0,
  wrapperStyle,
  menuStyle,
  menuItemStyle,
  hidden,
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
    if (disabled) {
      return
    }

    const onTrigger = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const triggerContainsTarget = document.getElementById(triggerId)?.contains(target)
      const targetContainsTrigger = false //!triggerContainsTarget && target.contains(document.getElementById(triggerId))
      if (triggerContainsTarget || targetContainsTrigger) {
        setOpen(!isOpen)
      }
    }

    document.addEventListener(leftClick ? 'click' : 'contextmenu', onTrigger)
    return () => {
      document.removeEventListener(leftClick ? 'click' : 'contextmenu', onTrigger)
    }
  }, [isOpen, triggerId, disabled, leftClick])

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
      recalculatePosition()
    }
  }, [isOpen])

  if (disabled) {
    return typeof children === 'function'
      ? // @ts-ignore
        children({ isOpen })
      : children
  }

  return (
    <div className={`relative h-fit w-fit ${hidden ? 'hidden' : ''}`} ref={containerRef} style={wrapperStyle}>
      {typeof children === 'function'
        ? // @ts-ignore
          children({ isOpen })
        : children}
      {isOpen && (
        <Portal>
          <div className={styles.contextMenu} ref={elemRef} style={{ ...appliedStyle, ...menuStyle }}>
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
                  style={menuItemStyle}
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
