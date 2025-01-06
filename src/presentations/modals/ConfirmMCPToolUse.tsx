import { ModalObjectProps } from '@/types'

import { useSubmitQuery } from '@/hooks/useSubmitQuery'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import { useStore } from '@/components/providers/store-provider'

export interface ConfirmMCPToolUseContext {
  toolName: string
  toolInput: object
  toolId: string
  agentId: string
  agentName: string
}

export default function ConfirmMCPToolUse({ id, context }: ModalObjectProps) {
  const { toolName, toolInput, toolId, agentId, agentName } = context as ConfirmMCPToolUseContext
  const closeModal = useStore((state) => state.closeModal)
  const setToolResult = useStore((state) => state.setToolResult)
  const clearToolResult = useStore((state) => state.clearToolResult)
  const { handleSubmit } = useSubmitQuery()

  const onRunTool = async () => {
    try {
      clearToolResult(toolId)
      // @ts-expect-error
      const result = await globalThis.highlight.agents.callAgentTool(agentId, toolName, toolId, toolInput)
      setToolResult(toolId, {
        toolResults: result.toolResults,
        toolId,
        agentId,
        agentName,
        toolName,
        isError: result.toolResults?.isError || false,
        content: result.toolResults?.content || [],
      })
      // send this tool result back to the chat backend
      handleSubmit(
        'Responding to the tool call...',
        null,
        undefined,
        undefined,
        'text',
        result.toolResults?.content,
        toolId,
      )
    } catch (error) {
      console.error('Error running tool:', error)
      setToolResult(toolId, {
        toolResults: null,
        toolId,
        agentId,
        agentName,
        toolName,
        isError: true,
        content: [],
      })
    } finally {
      closeModal(id)
    }
  }

  return (
    <ConfirmationModal
      id={id}
      primaryAction={{
        label: 'Run Tool',
        onClick: onRunTool,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: () => closeModal(id),
      }}
    >
      <div className="space-y-4">
        <span className="text-red-400 font-medium">Warning:</span> Using local tools could result in unexpected
        behavior.
        <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2">
          <span className="text-sm text-gray-400">Agent name:</span>
          <span className="text-sm font-medium">{agentName ?? 'No agent name provided'}</span>

          <span className="text-sm text-gray-400">Tool name:</span>
          <span className="text-sm font-medium">{toolName ?? 'No tool name provided'}</span>

          <span className="text-sm text-gray-400">Tool input:</span>
          <pre className="text-sm bg-dark-40 p-2 rounded font-mono">{JSON.stringify(toolInput, null, 2)}</pre>
        </div>
        <div className="text-gray-400">Are you sure you want to run this tool?</div>
      </div>
    </ConfirmationModal>
  )
}
