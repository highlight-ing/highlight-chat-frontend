import { StateCreator } from 'zustand'

export interface PendingCreateAction {
  id: number
  actionName: 'notion' | 'linear'
  conversationId: string
}

export interface PendingCreateActionsState {
  lastCreateActionId: number
  pendingCreateActions: PendingCreateAction[]
}

export type PendingCreateActionsSlice = PendingCreateActionsState & {
  addPendingCreateAction: (createAction: Omit<PendingCreateAction, 'id'>) => void
  removePendingCreateAction: (id: number) => void
}

export const initialPendingCreateActionsState: PendingCreateActionsState = {
  lastCreateActionId: 0,
  pendingCreateActions: [],
}

export const createPendingCreateActionsSlice: StateCreator<PendingCreateActionsSlice> = (set) => ({
  ...initialPendingCreateActionsState,
  addPendingCreateAction: (createAction: Omit<PendingCreateAction, 'id'>) => {
    set((state) => ({
      lastCreateActionId: state.lastCreateActionId + 1,
      pendingCreateActions: [...state.pendingCreateActions, { id: state.lastCreateActionId + 1, ...createAction }],
    }))
  },
  removePendingCreateAction: (id: number) => {
    set((state) => ({
      pendingCreateActions: state.pendingCreateActions.filter((createAction) => createAction.id !== id),
    }))
  },
})
