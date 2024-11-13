import { useSubmitQuery } from '@/hooks/useSubmitQuery'

export function useIntegration() {
  const { handleSubmit } = useSubmitQuery()

  async function createAction(action: 'notion' | 'linear') {
    let prompt

    switch (action) {
      case 'notion':
        prompt = 'Create a new Notion page inferring the title and content from the conversation.'
        break
      case 'linear':
        prompt = 'Create a new Linear ticket inferring the title and description from the conversation.'
        break
      default:
        return
    }

    await handleSubmit(prompt, undefined, undefined, {
      create_notion_page: action === 'notion',
      create_linear_ticket: action === 'linear',
    })
  }

  return {
    createAction,
  }
}
