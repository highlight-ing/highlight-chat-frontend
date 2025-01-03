import { useEffect, useState } from 'react'
import { ArrowDown2, ArrowUp2 } from 'iconsax-react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import Button from '@/components/Button/Button'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'
import { useStore } from '@/components/providers/store-provider'

import { CreateMCPToolParams } from '../_hooks/use-integrations'

function CreateMCPTool({ toolName, toolInput, toolId, agentId, agentName }: CreateMCPToolParams) {
  console.log('CreateMCPTool', { toolName, toolInput, toolId, agentId, agentName })
  const openModal = useStore((state) => state.openModal)
  const toolResults = useStore((state) => state.toolResults)
  const clearToolResult = useStore((state) => state.clearToolResult)
  const [modalOpened, setModalOpened] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenModal = () => {
    clearToolResult(toolId)
    openModal('confirm-mcp-tool-use', {
      toolName,
      toolInput,
      toolId,
      agentId,
      agentName,
    })
    setModalOpened(true)
  }

  useEffect(() => {
    if (!modalOpened) {
      handleOpenModal()
    }
  }, [modalOpened])

  return (
    <div>
      <div className={`flex items-center justify-between p-2 bg-dark-40 ${isOpen ? 'rounded-t-md' : 'rounded-md'}`}>
        <p className="text-sm font-light text-dark-100 flex items-center" onClick={() => setIsOpen(!isOpen)}>
          {!toolResults ? (
            <>
              <LoadingSpinner size="16px" style={{ marginRight: '4px' }} />
              Running <p className="font-bold">{toolName}</p> from <p className="font-bold">{agentName}</p>
            </>
          ) : (
            <>
              Tool results <p className="font-bold">{toolName}</p> from <p className="font-bold">{agentName}</p>
            </>
          )}
          <p className="text-sm pl-2">{isOpen ? <ArrowUp2 size={16} /> : <ArrowDown2 size={16} />}</p>
        </p>
      </div>
      <div hidden={!isOpen} className="p-2 bg-dark-40 rounded-b-md">
        {toolInput ? (
          <>
            <p className="text-sm font-medium">Tool input:</p>
            <SyntaxHighlighter
              language="json"
              style={darcula}
              customStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '12px', boxSizing: 'border-box' }}
            >
              {JSON.stringify(toolInput, null, 2)}
            </SyntaxHighlighter>
          </>
        ) : (
          <p className="text-sm font-light text-dark-100">
            No tool input is provided. This tool might not require input
          </p>
        )}
        {toolResults && (
          <>
            <p className="text-sm font-medium mt-4">Tool result:</p>
            <SyntaxHighlighter
              language="json"
              style={darcula}
              customStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '12px', boxSizing: 'border-box' }}
            >
              {JSON.stringify(toolResults, null, 2)}
            </SyntaxHighlighter>
          </>
        )}
        {!toolResults && (
          <Button size="medium" variant="primary" onClick={handleOpenModal}>
            Run Tool
          </Button>
        )}
      </div>
    </div>
  )
}

export { CreateMCPTool }
