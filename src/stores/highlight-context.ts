import type { HighlightContext } from '@highlight-ai/app-runtime'
import { StateCreator } from 'zustand'

/**
 * Store that holds the incoming HighlightContext from when the app is activated within Highlight.
 * The useSubmitQuery hook uses this to send the query to the backend chat API.
 */

export interface HighlightContextState {
  highlightContext?: HighlightContext
}

export type HighlightContextSlice = HighlightContextState & {
  setHighlightContext: (highlightContext: HighlightContext) => void
}

export const initialHighlightContextState: HighlightContextState = {
  highlightContext: undefined,
}

export const createHighlightContextSlice: StateCreator<HighlightContextSlice> = (set) => ({
  ...initialHighlightContextState,
  setHighlightContext: (highlightContext: HighlightContext) => set({ highlightContext }),
})
