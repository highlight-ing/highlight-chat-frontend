import React from 'react'
import { GroupedVirtuoso, type GroupedVirtuosoProps } from 'react-virtuoso'

export function GroupHeaderRow(props: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-primary px-5 py-3 shadow-md">
      <p className="font-medium text-subtle">{props.children}</p>
    </div>
  )
}

export function GroupedVirtualList(props: GroupedVirtuosoProps<unknown, number>) {
  // TODO: Add keyboard handling logic

  return <GroupedVirtuoso style={{ height: 'calc(100vh - 192px)' }} {...props} />
}
