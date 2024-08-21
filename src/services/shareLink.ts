import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { ChatHistoryItem, Message } from '@/types'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

//TODO: commented out to prevent hydration errors for now

// if (!supabaseUrl || !supabaseServiceRoleKey) {
//     throw new Error('Supabase URL or Service Role Key is not set');
//   }

// const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function createShareLink(conversation: ChatHistoryItem): Promise<string> {
  const shareId = uuidv4()
  // TODO: Implement actual sharing logic with Supabase
  return `https://chat-new.highlight.ing/share/${shareId}`
}

export async function getSharedConversation(id: string): Promise<{ title: string; messages: Message[] } | null> {
  // Mock data for testing
  if (id === 'mockUUID') {
    return {
      title: 'Mock Shared Conversation',
      messages: [
        { role: 'user', content: 'Hello, this is a test message.' },
        { role: 'assistant', content: 'Hi there! This is a mock response from the assistant.' },
        { role: 'user', content: 'Can you show me some code?' },
        {
          role: 'assistant',
          content:
            'Sure! Here\'s a simple Python function:\n\n```python\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n```',
        },
      ],
    }
  }

  // TODO: Implement actual data retrieval from Supabase
  return null
}
