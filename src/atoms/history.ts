'use client'

import { atom } from 'jotai'

export const showHistoryAtom = atom(false)

export const toggleShowHistoryAtom = atom(null, (_, set) => {
  set(showHistoryAtom, (previousValue) => !previousValue)
})
