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
    const handleKeyDown = (e: KeyboardEvent) => {
      const current = virtuosoRef.current
      if (!current) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setCurrentListIndex((prev) => {
            const nextIndex = Math.max(0, prev - 1)
            current.scrollToIndex({
              index: nextIndex,
            })
            return nextIndex
          })
          break

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
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [virtuosoRef, setCurrentListIndex])

  return <GroupedVirtuoso ref={virtuosoRef} initialTopMostItemIndex={currentListIndex} {...props} />
}
