import { useEffect, useState } from 'react'

import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'

export interface MCPLoaderProps {
  agentName: string
  toolName: string
}

export function MCPLoader({ agentName, toolName }: MCPLoaderProps) {
  const [text, setText] = useState(`Running ${toolName} from ${agentName}.`)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setText(`${text} Depending on tool complexity, this may take a few seconds...`)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="16px" />
      <p className="text-primary">{text}</p>
    </div>
  )
}
