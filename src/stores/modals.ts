import { StateCreator } from 'zustand'
import Highlight from '@highlight-ai/app-runtime'
import { ModalObjectProps } from '@/types'

export interface ModalsState {
  modals: ModalObjectProps[]
  errorModalOpen: boolean
  errorModalMessage?: string
}

export type ModalsSlice = ModalsState & {
  openModal: (id: string, context?: Record<string, any>, onDoNotShow?: () => void) => void
  closeModal: (id: string) => void
  setErrorModalOpen: (open: boolean) => void
  openErrorModal: (message: string) => void
  closeAllModals: () => void
  isModalOpen: (id: string) => boolean
  shouldModalShowAgain: (id: string, onDoNotShow?: () => void) => boolean
}

export const initialModalsState: ModalsState = {
  modals: [],
  errorModalOpen: false,
  errorModalMessage: undefined,
}

export const createModalsSlice: StateCreator<ModalsSlice> = (set, get) => ({
  ...initialModalsState,
  setErrorModalOpen: (open: boolean) => set({ errorModalOpen: open }),
  openErrorModal: (message: string) => set({ errorModalOpen: true, errorModalMessage: message }),
  openModal: (id: string, context?: Record<string, any>, onDoNotShow?: () => void) => {
    const modals = get().modals
    if (modals.some((modal) => modal.id === id)) {
      return
    }
    if (!get().shouldModalShowAgain(id, onDoNotShow)) {
      return
    }
    set({
      modals: [...modals, { id, context }],
    })
  },
  closeModal: (id: string) => {
    set(({ modals }) => ({ modals: modals.filter((modal) => modal.id !== id) }))
  },
  isModalOpen: (id: string) => {
    return get().modals.some((modal) => modal.id === id)
  },
  shouldModalShowAgain: (id: string, onDoNotShow?: () => void) => {
    if (Highlight.appStorage.get(`doNotShowModal.${id}`)) {
      if (typeof onDoNotShow === 'function') {
        onDoNotShow()
      }
      return false
    }
    return true
  },
  closeAllModals: () => {
    set({ modals: [] })
  },
})
