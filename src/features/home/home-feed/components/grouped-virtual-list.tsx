import React from 'react'
import { useAtom } from 'jotai'
import { GroupedVirtuoso, type GroupedVirtuosoHandle, type GroupedVirtuosoProps } from 'react-virtuoso'

import { currentListIndexAtom } from '../atoms'

export function GroupHeaderRow(props: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-primary px-5 py-3 shadow-md">
      <p className="font-medium text-subtle">{props.children}</p>
    </div>
  )
}

export function GroupedVirtualList(props: GroupedVirtuosoProps<unknown, number>) {
  const virtuosoRef = React.useRef<GroupedVirtuosoHandle>(null)
  const [currentListIndex, setCurrentListIndex] = useAtom(currentListIndexAtom)

  React.useEffect(() => {
    if (currentListIndex) {
      virtuosoRef.current?.scrollToIndex({
        index: currentListIndex,
      })
    }
  }, [currentListIndex])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const current = virtuosoRef.current
      if (!current) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setCurrentListIndex((prev) => {
            const nextIndex = prev + 1
            current.scrollToIndex({
              index: nextIndex,
            })
            return nextIndex
          })
          break

        case 'ArrowUp':
          e.preventDefault()
          setCurrentListIndex((prev) => {
            const nextIndex = Math.max(0, prev - 1) // Prevent negative indices
            current.scrollToIndex({
              index: nextIndex,
            })
            return nextIndex
          })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [virtuosoRef, setCurrentListIndex])

  // TODO: Add keyboard handling logic

  return <GroupedVirtuoso ref={virtuosoRef} style={{ height: 'calc(100vh - 192px)' }} {...props} />
}
