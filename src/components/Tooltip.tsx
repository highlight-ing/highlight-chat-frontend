import { CSSProperties, PropsWithChildren, ReactElement, useEffect, useRef, useState } from 'react'
import { Portal } from 'react-portal'

// space between tooltip and whatever it's wrapping
const PIXEL_SPACING = 4
const emptyObj = {}

interface TooltipProps {
  disabled?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right'
  offset?: number
  tooltip?: string | ReactElement
  wrapperStyle?: CSSProperties
  tooltipContainerStyle?: CSSProperties
}

const Tooltip = ({
  children,
  position,
  offset = 0,
  tooltip,
  disabled,
  wrapperStyle = emptyObj,
  tooltipContainerStyle = emptyObj
}: PropsWithChildren<TooltipProps>) => {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipStyle, setTooltipStyle] = useState({})
  const targetRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  function adjustTooltipPosition() {
    const targetRect = targetRef.current?.getBoundingClientRect()!
    const tooltipElem = tooltipRef.current!

    // This will be used to set styles of the tooltip.
    const styles: CSSProperties = {
      position: 'fixed'
    }

    // Determine styles based on desired position.
    switch (position) {
      case 'top':
        styles.bottom = window.innerHeight - targetRect.top + PIXEL_SPACING + offset
        styles.left = targetRect.left + targetRect.width / 2 - tooltipElem.offsetWidth / 2
        break
      case 'bottom':
        styles.top = targetRect.bottom + PIXEL_SPACING + offset
        styles.left = targetRect.left + targetRect.width / 2 - tooltipElem.offsetWidth / 2
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

    setTooltipStyle(styles)
  }

  useEffect(() => {
    if (tooltipVisible && tooltip) {
      adjustTooltipPosition()
    } else if (!tooltip && tooltipVisible) {
      setTooltipVisible(false)
    }
  }, [tooltipVisible, tooltip])

  if (tooltip === undefined || disabled) {
    return children
  }

  return (
    <div
      className="group flex relative"
      onClick={() => setTooltipVisible(false)}
      onMouseEnter={() => !disabled && setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
      onContextMenu={() => setTooltipVisible(false)}
      ref={targetRef}
      style={wrapperStyle}
    >
      {children}
      {
        tooltipVisible &&
        <Portal>
          <div
            ref={tooltipRef}
            style={{ ...tooltipStyle, ...tooltipContainerStyle, visibility: tooltipVisible ? 'visible' : 'hidden' }}
            className="group-hover:flex bg-dark border border-light-10 rounded-lg text-light-80 p-3 fixed min-w-min min-h-min w-fit h-fit whitespace-pre-wrap z-10"
          >
            {tooltip}
          </div>
        </Portal>
      }
    </div>
  )
}

export default Tooltip
