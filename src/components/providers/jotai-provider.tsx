'use client'

import React from 'react'
import { Provider } from 'jotai/react'

type JotaiProviderProps = {
  children: React.ReactNode
}

export function JotaiProvider(props: JotaiProviderProps) {
  return <Provider>{props.children}</Provider>
}
