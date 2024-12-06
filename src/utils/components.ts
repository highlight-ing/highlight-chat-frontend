import { CSSProperties } from 'react'

const PIXEL_SPACING = 4

export const calculatePositionedStyle = (
  targetElement: HTMLDivElement,
  positionedElement: HTMLElement,
  position: 'top' | 'bottom' | 'left' | 'right',
  offset?: number,
  offsetX?: number,
) => {
  const targetRect = targetElement.getBoundingClientRect()
  const positionOffset = offset ?? 0
  const positionOffsetX = offsetX ?? 0
  const styles: CSSProperties = {
    position: 'fixed',
  }

  const correctVertical = () => {
    // @ts-ignore
    if (positionedElement.offsetHeight + styles.bottom > window.innerHeight) {
      styles.top = targetRect.bottom + PIXEL_SPACING + positionOffset
    }
    // @ts-ignore
    else if (positionedElement.offsetHeight + styles.top > window.innerHeight) {
      styles.top = window.innerHeight - positionedElement.offsetHeight - PIXEL_SPACING - positionOffset
    }
  }

  const correctLeft = () => {
    if (styles.left === undefined) {
      return
    }
    // @ts-ignore
    if (styles.left < 0) {
      styles.left = PIXEL_SPACING
      // @ts-ignore
    } else if (styles.left + positionedElement.offsetWidth > window.innerWidth) {
      styles.left = window.innerWidth - positionedElement.offsetWidth - PIXEL_SPACING
    }
  }

  switch (position) {
    case 'top':
      styles.bottom = window.innerHeight - targetRect.top + PIXEL_SPACING + positionOffset
      styles.left = targetRect.left + targetRect.width / 2 - positionedElement.offsetWidth / 2 + positionOffsetX
      correctVertical()
      correctLeft()
      break
    case 'bottom':
      styles.top = targetRect.bottom + PIXEL_SPACING + positionOffset
      styles.left = targetRect.left + targetRect.width / 2 - positionedElement.offsetWidth / 2 + positionOffsetX
      correctVertical()
      correctLeft()
      break
    case 'left':
      styles.top = targetRect.top + positionOffset
      styles.right = window.innerWidth - targetRect.left + PIXEL_SPACING + positionOffsetX
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
      styles.top = targetRect.top + positionOffset
      styles.left = targetRect.right + PIXEL_SPACING + positionOffsetX
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
  return styles
}
