import { Attachment, ImageAttachment, PdfAttachment, SpreadsheetAttachment, TextFileAttachment } from '@/types'
import { dataURItoFile } from '@/utils/attachments'

export function processAttachments(attachments: any[]): Attachment[] {
  return attachments.map((attachment) => {
    if (attachment.type !== 'file') {
      return attachment as Attachment
    }
    const { fileName, mimeType, value } = attachment

    if (mimeType.startsWith('image/')) {
      return {
        type: 'image',
        value,
      } as ImageAttachment
    } else if (mimeType === 'application/pdf') {
      console.log('Processing PDF:', fileName, mimeType, value)
      const file = dataURItoFile(attachment.value, fileName, mimeType)
      if (!file) {
        console.error('Could not convert data URI to file for PDF:', fileName, value)
        return attachment
      }
      console.log('Converted PDF to file:', file, file.size, file.type, file.name)
      return {
        type: 'pdf',
        value: file,
      } as PdfAttachment
    } else if (
      mimeType.includes('spreadsheetml') ||
      mimeType.includes('excel') ||
      attachment.fileName.endsWith('.xlsx')
    ) {
      return {
        type: 'spreadsheet',
        value,
      } as SpreadsheetAttachment
    } else {
      return {
        type: 'text_file',
        value,
        fileName,
      } as TextFileAttachment
    }
  })
}
