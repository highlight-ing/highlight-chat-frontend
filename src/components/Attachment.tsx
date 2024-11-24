import { useEffect, useState } from 'react'
import { AttachmentType } from '@/types'
import { getWordCountFormatted } from '@/utils/string'
import { ClipboardText, DocumentText1, GallerySlash, Smallcaps, VoiceSquare } from 'iconsax-react'
import { useSetAtom } from 'jotai'

import { selectedAudioNoteAtom, transcriptOpenAtom } from '@/atoms/transcript-viewer'
import { useImageDownload } from '@/hooks/useImageDownload'
import { CloseIcon } from '@/components/icons'
import { useStore } from '@/components/providers/store-provider'
import { fetchAppIcon } from '@/app/(app)/actions'

import Tooltip from './Tooltip/Tooltip'

interface BaseAttachmentProps {
  onRemove?: () => void
  value: string
  isSharedImage?: boolean
  sharedImageUrl?: string // Add this line
  version?: string
}

interface WindowAttachmentProps extends BaseAttachmentProps {
  type: 'window'
  appIcon?: string
}

interface WindowContextAttachmentProps extends BaseAttachmentProps {
  type: 'window_context'
  appName?: string
}

interface OtherAttachmentProps extends BaseAttachmentProps {
  type: Exclude<AttachmentType, 'window'>
  isFile?: boolean
}

type AttachmentProps = (WindowAttachmentProps | WindowContextAttachmentProps | OtherAttachmentProps) & {
  title?: string
  id?: string
  startedAt?: Date
  endedAt?: Date
}

export const Attachment = ({
  title,
  id,
  type,
  value,
  onRemove,
  isSharedImage = false,
  sharedImageUrl,
  version,
  ...props
}: AttachmentProps) => {
  const appName = (props as WindowContextAttachmentProps).appName
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const conversationId = version === 'v4' ? useStore((state) => state.conversationId) : undefined
  const isConversationLoading = useStore((state) => state.isConversationLoading)
  const inputIsDisabled = useStore((state) => state.inputIsDisabled)
  const [appIconUrl, setAppIconUrl] = useState<string | null>(null)

  useEffect(() => {
    if (appName) {
      fetchAppIcon(appName).then((url) => {
        if (url) setAppIconUrl(url)
      })
    }
  }, [appName])

  const { imageUrl, isLoading, error } = useImageDownload(
    type === 'image' && !value.startsWith('data:image') && !value.startsWith('blob:') ? value : null,
    conversationId,
  )

  const renderAttachmentContent = () => {
    const size = 20
    switch (type) {
      case 'image':
        if (isSharedImage && sharedImageUrl) {
          return (
            <img
              className="transition-padding max-w-20 pointer-events-none flex h-12 w-auto items-center overflow-hidden rounded-sm object-cover transition-opacity duration-150 ease-in-out"
              src={sharedImageUrl}
              alt="Shared Attachment"
            />
          )
        }
        const isBase64 = value.startsWith('data:image')
        const isBlob = value.startsWith('blob:')
        if (isBase64 || isBlob) {
          // Local image (base64)
          return (
            <img
              className="transition-padding max-w-20 pointer-events-none flex h-12 w-auto items-center overflow-hidden rounded-sm object-cover transition-opacity duration-150 ease-in-out"
              src={value}
              alt="Attachment"
            />
          )
        } else {
          // Remote image
          if (isLoading) {
            return (
              <div
                className="to-light-30 animate-shimmer h-12 w-20 bg-gradient-to-r from-light-20"
                style={{ backgroundSize: '200% 100%' }}
              />
            )
          }
          if (error) return <GallerySlash color="#FF8A65" size={size} />
          return (
            <img
              className="transition-padding max-w-20 pointer-events-none flex h-12 w-auto items-center overflow-hidden rounded-sm object-cover opacity-50 transition-opacity duration-150 ease-in-out"
              style={{ opacity: isImageLoaded ? 1 : 0 }}
              src={imageUrl || value}
              onLoad={() => setIsImageLoaded(true)}
              alt="Attachment"
            />
          )
        }
      case 'clipboard':
        return (
          <div className="text-nowrap flex h-[48px] items-center gap-2.5 rounded-[16px] border border-light-10 bg-secondary px-2.5 text-base">
            <ClipboardText className="min-w-5 text-secondary" variant="Bold" size={size} />
            <span className="inline-block align-middle text-sm text-secondary">Clipboard</span>
          </div>
        )
      case 'pdf':
      case 'text_file':
        return (
          <div className="align-center flex w-full justify-center gap-2 p-2 pl-2.5">
            <DocumentText1 className="min-w-5 text-secondary" variant="Bold" size={size} />
            <span className="max-w-40 inline-block truncate align-middle text-sm text-secondary">{value}</span>
          </div>
        )
      case 'window':
      case 'window_context':
        return (
          <>
            {appName && appIconUrl ? (
              <img src={appIconUrl} alt={appName} className="h-[42px] w-[42px] rounded" />
            ) : (
              <DocumentText1 className="text-secondary" variant="Bold" size={size} />
            )}
          </>
        )
      case 'selected_text':
        return <Smallcaps className="text-secondary" variant="Bold" size={size} />
      default:
        return <DocumentText1 className="text-secondary" variant="Bold" size={size} />
    }
  }

  const setSelectedAudioNote = useSetAtom(selectedAudioNoteAtom)
  const setTranscriptOpen = useSetAtom(transcriptOpenAtom)

  function handleAudioClick() {
    if (!value) return

    setSelectedAudioNote({
      id,
      transcript: value,
      startedAt: props.startedAt,
      endedAt: props.endedAt,
    })
    setTranscriptOpen(true)
  }

  return (
    <Tooltip
      key="attachment-tooltip"
      tooltip={<div className="line-clamp-3 max-h-[100px] max-w-[300px]">{value}</div>}
      position="right"
      disabled={!value || value?.length === 0 || type === 'image'}
    >
      <div className="group relative">
        {type === 'conversation' || type === 'audio' ? (
          <button
            onClick={handleAudioClick}
            className="text-nowrap flex h-[48px] w-40 items-center gap-2.5 rounded-[16px] border border-light-10 bg-secondary p-[5px] text-base leading-none"
          >
            <div className="size-9 grid grow-0 place-items-center rounded-[12px] bg-green-20 text-green">
              <VoiceSquare size={16} variant="Bold" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-secondary">Audio Notes</span>
              {value && <span className="text-xs text-tertiary">{`${getWordCountFormatted(value)} words`}</span>}
            </div>
          </button>
        ) : (
          <div
            className={`flex h-[48px] items-center justify-center rounded-[16px] border border-light-10 bg-secondary ${
              type === 'pdf' || type === 'text_file' ? 'max-w-40' : ''
            } ${type !== 'image' ? 'min-w-12' : 'min-w-[52px]'} w-fit overflow-hidden`}
          >
            {renderAttachmentContent()}
          </div>
        )}
        {onRemove && (
          <button
            type="button"
            aria-label="Remove attachment"
            disabled={isConversationLoading || inputIsDisabled}
            className="absolute right-[-8px] top-[-8px] hidden rounded-full bg-light-20 p-0.5 text-light-80 disabled:opacity-40 group-hover:flex"
            onClick={onRemove}
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>
    </Tooltip>
  )
}
