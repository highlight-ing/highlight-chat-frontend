import React, { forwardRef, useEffect, useRef, useState } from 'react'
import Scrollable from '@/components/Scrollable/Scrollable'

interface ShareScrollableProps {
  className?: string
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  onBottomStateChange?: (isAtBottom: boolean) => void
}

const ShareScrollable = forwardRef<HTMLDivElement, React.PropsWithChildren<ShareScrollableProps>>(
  ({ children, className, onScroll, onBottomStateChange }, forwardedRef) => {
    const scrollableRef = useRef<HTMLDivElement>(null)
    const [isAtBottom, setIsAtBottom] = useState(true)

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (onScroll) {
        onScroll(e)
      }

      const container = e.target as HTMLDivElement
      const newIsAtBottom = Math.abs(container.scrollHeight + container.scrollTop - container.clientHeight) < 1

      if (newIsAtBottom !== isAtBottom) {
        setIsAtBottom(newIsAtBottom)
        if (onBottomStateChange) {
          onBottomStateChange(newIsAtBottom)
        }
      }
    }

    useEffect(() => {
      // Check initial scroll position
      if (scrollableRef.current) {
        const { scrollHeight, scrollTop, clientHeight } = scrollableRef.current
        const initialIsAtBottom = Math.abs(scrollHeight + scrollTop - clientHeight) < 1
        setIsAtBottom(initialIsAtBottom)
        if (onBottomStateChange) {
          onBottomStateChange(initialIsAtBottom)
        }
      }
    }, [])

    return (
      <Scrollable ref={scrollableRef} className={className} onScroll={handleScroll}>
        {children}
      </Scrollable>
    )
  },
)

ShareScrollable.displayName = 'ShareScrollable'

export default ShareScrollable
