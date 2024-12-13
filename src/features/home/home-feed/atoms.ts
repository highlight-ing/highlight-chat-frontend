'use client'

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const feedHiddenAtom = atomWithStorage('hideHomeFeed', false)

export const toggleFeedVisibilityAtom = atom(null, (_, set) => set(feedHiddenAtom, (previousValue) => !previousValue))
