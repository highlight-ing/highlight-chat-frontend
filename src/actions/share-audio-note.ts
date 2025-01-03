'use server'

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

import { ConversationData } from '@/types/conversations'

const supabaseUrl = process.env.AUDIO_NOTE_SUPABASE_URL
const supabaseServiceRoleKey = process.env.AUDIO_NOTE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is not set')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function generateAudioNoteShareLink(conversation: ConversationData, userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID not found')
    }

    const startedAt = new Date(conversation.startedAt)
    const endedAt = new Date(conversation.endedAt)
    const timestamp = new Date(conversation.timestamp)

    // TODO: Figure out what is required to generate an audio note
    const shareData: ConversationData = {
      ...conversation,
      startedAt,
      endedAt,
      timestamp,
      userId,
    }
    // id: string
    // title: string
    // summary: string
    // topic: string
    // transcript: string
    // summarized: boolean
    // shareLink: string

    const slug = uuidv4()
    const { error } = await supabase.from('conversations').insert({
      external_id: slug,
      contents: JSON.stringify(shareData),
      highlight_user_id: shareData.userId,
    })

    if (error) {
      throw new Error(`Error sharing audio note: ${error.message}`)
    }

    return `https://conversations.app.highlight.ing/share/${slug}`
  } catch (error) {
    console.error('Error sharing conversation:', error)
    if (error instanceof Error) {
      throw new Error(`Error sharing conversation: ${error.message}`)
    } else {
      throw new Error('Error sharing conversation: Unknown error')
    }
  }
}

export async function deleteAudioNoteShareLink(conversation: ConversationData) {
  if (!conversation.shareLink) {
    throw new Error('No share link found for this conversation')
  }

  const slug = conversation.shareLink.split('/').pop()

  if (!slug) {
    throw new Error(`Slug is undefined`)
  }

  const { error } = await supabase.from('conversations').delete().eq('external_id', slug)

  if (error) {
    throw new Error(`Error deleting conversation: ${error.message}`)
  }

  // Create a new conversation object with userId and shareLink set to empty strings
  const updatedConversation: ConversationData = {
    ...conversation,
    userId: '',
    shareLink: '',
  }

  return updatedConversation
}
