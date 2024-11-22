'use client'

import React from 'react'
import { queryClientAtom } from 'jotai-tanstack-query'
import { Provider } from 'jotai/react'
import { useHydrateAtoms } from 'jotai/react/utils'

import { queryClient } from './react-query-provider'

type JotaiProviderProps = {
  children: React.ReactNode
}

const HydrateAtoms = (props: JotaiProviderProps) => {
  // @ts-expect-error: Client Query types mismatch but compatible
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return props.children
}

export function JotaiProvider(props: JotaiProviderProps) {
  return (
    <Provider>
      <HydrateAtoms>{props.children}</HydrateAtoms>
    </Provider>
  )
}
