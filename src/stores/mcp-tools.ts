import { StateCreator } from 'zustand'

interface MCPToolResult {
  toolResults: any
  toolId: string | undefined
  agentId: string
  agentName: string
  toolName: string
  isError: boolean
  content: Array<{
    type: string
    text: string
  }>
}

export interface MCPToolsState {
  toolResults: Record<string, MCPToolResult>
}

export type MCPToolsSlice = MCPToolsState & {
  setToolResult: (toolId: string, result: MCPToolResult) => void
  clearToolResult: (toolId: string) => void
}

export const initialMCPToolsState: MCPToolsState = {
  toolResults: {},
}

export const createMCPToolsSlice: StateCreator<MCPToolsSlice> = (set) => ({
  ...initialMCPToolsState,
  setToolResult: (toolId, result) =>
    set((state) => ({
      toolResults: {
        ...state.toolResults,
        [toolId]: result,
      },
    })),
  clearToolResult: (toolId) =>
    set((state) => {
      const newResults = { ...state.toolResults }
      delete newResults[toolId]
      return { toolResults: newResults }
    }),
})
