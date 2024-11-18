import Highlight from '@highlight-ai/app-runtime'
import imageCompression from 'browser-image-compression'

export const compressImageIfNeeded = async (file: File): Promise<File> => {
  const ONE_MB = 1 * 1024 * 1024 // 1MB in bytes
  if (file.size <= ONE_MB) return file

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }

  try {
    return await imageCompression(file, options)
  } catch (error) {
    console.error('Error compressing image:', error)
    return file
  }
}

export const readFileAsBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Handle window list
// PS(umut): Switched this to native windows since we don't need base64 encoded window icons.
export async function fetchWindows() {
  const windows = await Highlight.user.getNativeWindows()
  // Filter out windows with null or empty titles, then map to the desired format
  const windowTitles = windows
    .filter((window) => window.title !== null && window.title !== '')
    .map((window) => ({ title: window.title, appName: window.appName, pid: window.pid }))
  return windowTitles
}

export const addAttachmentsToFormData = async (
  formData: FormData,
  attachments: any[],
): Promise<{
  screenshot?: string
  audio?: string
  fileTitle?: string
  clipboardText?: string
  ocrText?: string
  windowContext?: string
}> => {
  console.log('addAttachmentsToFormData')
  let screenshot, audio, fileTitle, clipboardText, ocrText, windowContext

  for (const attachment of attachments) {
    if (attachment?.value) {
      switch (attachment.type) {
        case 'text_file':
          formData.append('text_file', `${attachment.fileName}\n${attachment.value}`)
          break
        case 'image':
        case 'screenshot':
          screenshot = attachment.value
          if (attachment.file) {
            const compressedFile = await compressImageIfNeeded(attachment.file)
            const base64data = await readFileAsBase64(compressedFile)
            const mimeType = compressedFile.type || 'image/png'
            const base64WithMimeType = `data:${mimeType};base64,${base64data.split(',')[1]}`
            formData.append('base64_image', base64WithMimeType)
          } else if (typeof attachment.value === 'string' && attachment.value.startsWith('data:image')) {
            formData.append('base64_image', attachment.value)
          } else {
            console.error('Unsupported image format:', attachment.value)
          }
          break
        case 'pdf':
          fileTitle = attachment.value.name
          formData.append('pdf', attachment.value)
          break
        case 'audio':
        case 'conversation':
          audio = attachment.value
          formData.append('audio', attachment.value)
          break
        case 'spreadsheet':
          fileTitle = attachment.value.name
          formData.append('spreadsheet', attachment.value)
          break
        case 'clipboard':
          clipboardText = attachment.value
          formData.append('clipboard_text', attachment.value)
          break
        case 'ocr':
          ocrText = attachment.value
          formData.append('ocr_text', attachment.value)
          break
        case 'window_context':
          windowContext = attachment.value
          formData.append('window_context', attachment.value)
          break
        default:
          console.warn('Unknown attachment type:', attachment.type)
      }
    }
  }

  return { screenshot, audio, fileTitle, clipboardText, ocrText, windowContext }
}
