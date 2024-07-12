import { on } from 'events'
import { PropsWithChildren, ReactElement, ReactHTMLElement, useCallback, useEffect, useRef, useState } from 'react'
import { Portal } from 'react-portal'

const PIXEL_SPACING = 4

type Position = 'top' | 'bottom' | 'left' | 'right'

export interface MenuItemType {
  divider?: true
  label?: string | ReactHTMLElement<HTMLAnchorElement> | ReactElement
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

interface ContextMenuProps {
  alignment: Position
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
  alignment,
  leftClick,
  items,
  offset = 0,
  wrapperStyle,
  onOpen
}: PropsWithChildren<ContextMenuProps>) => {
  const [isOpen, setOpen] = useState(false)
  const [appliedStyle, setAppliedStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const elemRef = useRef<HTMLDivElement>(null)

  function recalculatePosition() {
    if (!containerRef.current || !elemRef.current) {
      return
    }
    const targetRect = containerRef.current.getBoundingClientRect()
    const elem = elemRef.current

    // This will be used to set styles of the tooltip.
    const styles: React.CSSProperties = {
      position: 'fixed'
    }

    // Determine styles based on desired position.
    switch (position) {
      case 'top':
        styles.bottom = window.innerHeight - targetRect.top + PIXEL_SPACING + offset
        styles.left = targetRect.left + targetRect.width / 2 - elem.offsetWidth / 2
        break
      case 'bottom':
        styles.top = targetRect.bottom + PIXEL_SPACING + offset
        styles.left = targetRect.left + targetRect.width / 2 - elem.offsetWidth / 2
        break
      case 'left':
        styles.top = targetRect.top
        styles.right = window.innerWidth - targetRect.left + PIXEL_SPACING + offset
        styles.maxWidth = targetRect.left - PIXEL_SPACING * 2

        // if positioned left is too small, position right instead
        if (styles.maxWidth < 200) {
          const maxWidth = window.innerWidth - (targetRect.right + PIXEL_SPACING * 2)
          if (maxWidth > styles.maxWidth) {
            styles.right = undefined
            styles.left = targetRect.right + PIXEL_SPACING
            styles.maxWidth = maxWidth
          }
        }
        break
      case 'right':
        styles.top = targetRect.top
        styles.left = targetRect.right + PIXEL_SPACING + offset
        styles.maxWidth = window.innerWidth - (targetRect.right + PIXEL_SPACING * 2)

        // if positioned right is too small, position left instead
        if (styles.maxWidth < 200) {
          const maxWidth = targetRect.left - PIXEL_SPACING * 2
          if (maxWidth > styles.maxWidth) {
            styles.left = undefined
            styles.right = window.innerWidth - targetRect.left + PIXEL_SPACING
            styles.maxWidth = maxWidth
          }
        }
        break
      default:
        break
    }

    setAppliedStyle(styles)
  }

  const onClickListener = useCallback(
    (_e: MouseEvent) => {
      setOpen(!isOpen)
    },
    [isOpen]
  )

  const onClickOutsideListener = useCallback(
    (e: MouseEvent) => {
      const el = containerRef.current
      // @ts-ignore
      if (isOpen && el && !el.contains(e.target)) {
        setOpen(false)
      }
    },
    [isOpen]
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
    <div className="relative w-fit h-fit" ref={containerRef} style={wrapperStyle}>
      {children}
      {isOpen && (
        <Portal>
          <div
            className="fixed bg-[#000] rounded-xl border border-light-20 z-10 w-fit h-fit overflow-hidden"
            ref={elemRef}
            style={appliedStyle}
          >
            {items.map((item, index) => {
              if (item.divider) {
                return <div className="w-full min-h-[1px] bg-light-16" key={`divider-${index}`} />
              }
              return (
                <div
                  className="flex flex-nowrap px-4 py-2 text-[15px] text-light-60 cursor-pointer gap-2 select-none hover:light-8"
                  key={`menu-item-${index}`}
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
