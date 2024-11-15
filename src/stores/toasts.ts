import { ChatHistoryItem, Toast } from '@/types'
import { StateCreator } from 'zustand'

export interface ToastState {
  toasts: Toast[]
}

export type ToastSlice = ToastState & {
  setToasts: (toasts: Toast[]) => void
  addToast: (toast: Partial<Toast>) => void
  removeToast: (toastId: string) => void
}

export const initialToastState: ToastState = {
  toasts: [],
}

export const createToastSlice: StateCreator<ToastSlice> = (set, get) => ({
  ...initialToastState,
  setToasts: (toasts) => {
    set({ toasts })
  },
  addToast: (toast) => {
    set({
      toasts: [
        ...get().toasts,
        {
          ...toast,
          id: toast.id ?? crypto.randomUUID(),
          timeout: toast.timeout ?? 5000,
          type: toast.type ?? 'default',
        },
      ],
    })
  },
  removeToast: (toastId: string) => {
    set({ toasts: get().toasts.filter((toast) => toast.id !== toastId) })
  },
})
