import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

import styles from './scrollable.module.scss'

interface ScrollableProps {
  className?: string
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

const Scrollable = forwardRef<HTMLDivElement, React.PropsWithChildren<ScrollableProps>>(
  ({ children, className, onScroll }, forwardedRef) => {
    const innerRef = useRef<HTMLDivElement>(null)
    const handleRef = useRef<HTMLDivElement>(null)
    const [isScrolling, setIsScrolling] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout>()
    const [isHandlePressed, setIsHandlePressed] = useState(false)
    const startYRef = useRef<number>(0)
    const startScrollTopRef = useRef<number>(0)

    useImperativeHandle(forwardedRef, () => innerRef.current!, [])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (typeof onScroll === 'function') {
        onScroll(e)
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setIsScrolling(true)

      const handle = handleRef.current!
      const container = e.target as HTMLDivElement
      const rect = container.getBoundingClientRect()
      const scrollPercentage = container.scrollTop / (container.scrollHeight - rect.height)
      const scrollbarHeight = rect.height * (rect.height / container.scrollHeight)
      const scrollableAreaHeight = rect.height - scrollbarHeight
      handle.style.setProperty(
        '--top',
        `${rect.y + (rect.height - scrollbarHeight) + scrollableAreaHeight * scrollPercentage}px`,
      )
      handle.style.setProperty('--height', `${scrollbarHeight}px`)

      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 1500)
    }

    const updateHandlePosition = () => {
      const handle = handleRef.current!
      const container = innerRef.current!
      const rect = container.getBoundingClientRect()
      const scrollPercentage = container.scrollTop / (container.scrollHeight - rect.height)
      const scrollbarHeight = rect.height * (rect.height / container.scrollHeight)
      const scrollableAreaHeight = rect.height - scrollbarHeight
      handle.style.setProperty(
        '--top',
        `${rect.y + (rect.height - scrollbarHeight) + scrollableAreaHeight * scrollPercentage}px`,
      )
      handle.style.setProperty('--height', `${scrollbarHeight}px`)
    }

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsHandlePressed(true)
      startYRef.current = e.clientY
      startScrollTopRef.current = innerRef.current!.scrollTop
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isHandlePressed) return

      const container = innerRef.current!
      const deltaY = e.clientY - startYRef.current
      const scrollRatio = container.scrollHeight / container.clientHeight
      container.scrollTop = startScrollTopRef.current + deltaY * scrollRatio
      updateHandlePosition()
    }

    const onMouseUp = () => {
      setIsHandlePressed(false)
    }

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
    }, [])

    useEffect(() => {
      if (isHandlePressed) {
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }
      return () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
    }, [isHandlePressed])

    return (
      <div ref={innerRef} className={`${styles.container} ${className ?? ''}`} onScroll={handleScroll}>
        <div
          ref={handleRef}
          className={`${styles.handle} ${isScrolling ? styles.visible : ''} `}
          onMouseDown={onMouseDown}
        />
        {children}
      </div>
    )
  },
)

Scrollable.displayName = 'Scrollable'

export default Scrollable
