import { StateCreator } from 'zustand'

export interface PendingIntegration {
  id: number
  integrationName: string
  conversationId: string
  input: any
}

export interface IntegrationsState {
  lastIntegrationId: number
  pendingIntegrations: PendingIntegration[]
}

export type IntegrationsSlice = IntegrationsState & {
  addPendingIntegration: (integration: Omit<PendingIntegration, 'id'>) => void
  removePendingIntegration: (id: number) => void
}

export const initialIntegrationsState: IntegrationsState = {
  lastIntegrationId: 0,
  pendingIntegrations: [],
}

export const createIntegrationsSlice: StateCreator<IntegrationsSlice> = (set) => ({
  ...initialIntegrationsState,
  addPendingIntegration: (integration: Omit<PendingIntegration, 'id'>) => {
    set((state) => ({
      lastIntegrationId: state.lastIntegrationId + 1,
      pendingIntegrations: [...state.pendingIntegrations, { id: state.lastIntegrationId + 1, ...integration }],
    }))
  },
  removePendingIntegration: (id: number) => {
    set((state) => ({
      pendingIntegrations: state.pendingIntegrations.filter((integration) => integration.id !== id),
    }))
  },
})
