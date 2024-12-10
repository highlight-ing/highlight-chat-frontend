'use client'

import { atom } from 'jotai'

export const feedHiddenAtom = atom(false)

export const toggleFeedVisibilityAtom = atom(null, (_, set) => set(feedHiddenAtom, (previousValue) => !previousValue))
