import { AudioAttachment } from '@/types'
import { getDurationUnit } from './string'

export const getAudioAttachmentPreview = (attachment: AudioAttachment): string => {
  if (attachment.duration === 0) return attachment.value

  let durationString = ''
  // If the duration can be represented as a whole number of hours use hours
  if (attachment.duration % 60 === 0) {
    durationString = `${attachment.duration / 60} ${getDurationUnit(attachment.duration, 'hours')}`
  } else {
    durationString = `${attachment.duration} ${getDurationUnit(attachment.duration, 'minutes')}`
  }

  return `Last ${durationString}:\n${attachment.value}`
}
