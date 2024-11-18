import { CSSProperties, PropsWithChildren, ReactElement, useEffect, useRef, useState } from 'react'
import { calculatePositionedStyle } from '@/utils/components'
import { Portal } from 'react-portal'

import styles from './tooltip.module.scss'

// space between tooltip and whatever it's wrapping
const emptyObj = {}

interface TooltipProps {
  disabled?: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
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
  tooltipContainerStyle = emptyObj,
}: PropsWithChildren<TooltipProps>) => {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipStyle, setTooltipStyle] = useState({})
  const targetRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  function adjustTooltipPosition() {
    if (!targetRef.current || !tooltipRef.current) {
      return
    }
    const styles = calculatePositionedStyle(targetRef.current, tooltipRef.current, position, offset)
    setTooltipStyle(styles)
  }

  useEffect(() => {
    if (tooltipVisible && tooltip) {
      adjustTooltipPosition()
    } else if (!tooltip && tooltipVisible) {
      setTooltipVisible(false)
    }
  }, [tooltipVisible, tooltip, position, offset])

  if (tooltip === undefined || disabled) {
    return children
  }

  return (
    <div
      className="group relative flex"
      onClick={() => setTooltipVisible(false)}
      onMouseEnter={() => !disabled && setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
      onContextMenu={() => setTooltipVisible(false)}
      ref={targetRef}
      style={wrapperStyle}
    >
      {children}
      {tooltipVisible && (
        <Portal>
          <div
            ref={tooltipRef}
            style={{ ...tooltipStyle, ...tooltipContainerStyle, visibility: tooltipVisible ? 'visible' : 'hidden' }}
            className={styles.tooltip}
          >
            {tooltip}
          </div>
        </Portal>
      )}
    </div>
  )
}

export default Tooltip
