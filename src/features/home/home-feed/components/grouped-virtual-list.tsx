import React from 'react'
import { GroupedVirtuoso, type GroupedVirtuosoHandle, type GroupedVirtuosoProps } from 'react-virtuoso'

export function GroupHeaderRow(props: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-primary px-5 py-3 shadow-md">
      <p className="font-medium text-subtle">{props.children}</p>
    </div>
  )
}

export function GroupedVirtualList(props: GroupedVirtuosoProps<unknown, number>) {
  const virtuosoRef = React.useRef<GroupedVirtuosoHandle>(null)
  const [currentIndex, setCurrentIndex] = React.useState(0)

  console.log(currentIndex)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const current = virtuosoRef.current
      if (!current) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setCurrentIndex((prev) => {
            const nextIndex = prev + 1
            current.scrollToIndex({
              index: nextIndex,
              align: 'center',
            })
            return nextIndex
          })
          break

        case 'ArrowUp':
          e.preventDefault()
          setCurrentIndex((prev) => {
            const nextIndex = Math.max(0, prev - 1) // Prevent negative indices
            current.scrollToIndex({
              index: nextIndex,
              align: 'center',
            })
            return nextIndex
          })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [virtuosoRef, setCurrentIndex])

  // TODO: Add keyboard handling logic

  return <GroupedVirtuoso ref={virtuosoRef} style={{ height: 'calc(100vh - 192px)' }} {...props} />
}
