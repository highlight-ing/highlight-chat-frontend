import { z } from 'zod'
import videoUrlParser from 'js-video-url-parser'

// Schema that uses js-video-url-parser to validate the video URL is YouTube or Vimeo
export const videoUrlSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (value) => {
      if (!value) {
        return true
      }

      const provider = videoUrlParser.parse(value)?.provider

      return provider !== undefined && ['youtube', 'vimeo'].includes(provider)
    },
    {
      message: 'Invalid video URL, must be a YouTube or Vimeo URL.',
    },
  )

export const PreferredAttachmentSchema = z.enum(['default', 'screen', 'page-text', 'clipboard', 'audio'])

export type PreferredAttachment = z.infer<typeof PreferredAttachmentSchema>
