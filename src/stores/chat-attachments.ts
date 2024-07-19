import { Attachment } from "@/types";
import { StateCreator } from "zustand";

/**
 * Store that deals with the attachments for Highlight Chat.
 */

export interface ChatAttachmentsState {
  attachments: Attachment[];
}

export type ChatAttachmentsSlice = ChatAttachmentsState & {
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (attachmentType: string) => void;
  clearAttachments: () => void;
};

export const initialChatAttachmentsState: ChatAttachmentsState = {
  attachments: [],
};

export const createChatAttachmentsSlice: StateCreator<ChatAttachmentsSlice> = (
  set
) => ({
  ...initialChatAttachmentsState,
  addAttachment: (attachment: Attachment) =>
    set((state) => ({ attachments: [...state.attachments, attachment] })),
  removeAttachment: (attachmentType: string) =>
    set((state) => ({
      attachments: state.attachments.filter(
        (attachment) => attachment.type !== attachmentType
      ),
    })),
  clearAttachments: () => set({ attachments: [] }),
});
