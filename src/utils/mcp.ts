interface Tool {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
}

interface ToolResponse {
  result?: {
    tools: Tool[]
  }
  error: string | null
}

async function getAllMCPTools() {
  // @ts-expect-error
  const mcpTools = (await globalThis.highlight.agents.getAllToolsFromAgents()) as ToolResponse[]
  console.log('allMCPTools', mcpTools)

  if (mcpTools.length > 0) {
    return mcpTools
  }
  return null
}

export { getAllMCPTools }
