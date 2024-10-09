import { Attachment } from '@/types'
import { StateCreator } from 'zustand'

/**
 * Store that deals with the attachments for Highlight Chat.
 */

export interface ChatAttachmentsState {
  attachments: Attachment[]
}

export type ChatAttachmentsSlice = ChatAttachmentsState & {
  addAttachment: (attachment: Attachment) => void
  removeAttachment: (attachmentType: Attachment) => void
  clearAttachments: () => void
}

export const initialChatAttachmentsState: ChatAttachmentsState = {
  attachments: [],
}

const areAttachmentsEqual = (a: Attachment, b: Attachment) => {
  if (a.type !== b.type) return false

  const typesToCompareValueOnly = ['image', 'pdf', 'audio', 'clipboard', 'spreadsheet', 'text_file']
  // @ts-ignore
  if (typesToCompareValueOnly.includes(a.type)) return a.value === b.value

  if (a.type === 'conversation' && b.type === 'conversation') {
    return a.id === b.id && a.value === b.value
  }
  return false
}

export const MAX_NUMBER_OF_ATTACHMENTS = 5

export const createChatAttachmentsSlice: StateCreator<ChatAttachmentsSlice> = (set) => {
  return {
    ...initialChatAttachmentsState,
    addAttachment: (attachment: Attachment) => {
      set((state) => {
        if (state.attachments.length >= MAX_NUMBER_OF_ATTACHMENTS) {
          return state
        }

        const isAttachmentCurrentConversation = attachment.type === 'conversation' && attachment.isCurrentConversation
        if (isAttachmentCurrentConversation) {
          const isCurrentConversationAlreadyAttached = state.attachments.some(
            (a) => a.type === 'conversation' && a.isCurrentConversation,
          )
          return {
            ...state,
            attachments: isCurrentConversationAlreadyAttached
              ? state.attachments.map((a) => (a.type === 'conversation' && a.isCurrentConversation ? attachment : a))
              : [...state.attachments, attachment],
          }
        }

        const alreadyAttached = state.attachments.find((a) => areAttachmentsEqual(a, attachment))
        return {
          ...state,
          attachments: alreadyAttached ? state.attachments : [...state.attachments, attachment],
        }
      })
    },
    removeAttachment: (attachment: Attachment) =>
      set((state) => ({
        attachments: state.attachments.filter((a) => !areAttachmentsEqual(a, attachment)),
      })),
    clearAttachments: () => set({ attachments: [] }),
  }
}
