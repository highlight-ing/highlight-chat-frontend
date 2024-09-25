import { ClipboardText, Document, Keyboard, Sound, GallerySlash, DocumentText1 } from 'iconsax-react'
import { useState } from 'react'
import { CloseIcon } from '../icons/icons'
import Tooltip from './Tooltip/Tooltip'
import { useStore } from '@/providers/store-provider'
import { AttachmentType } from '@/types'
import { useImageDownload } from '@/hooks/useImageDownload'
import { trackEvent } from '@/utils/amplitude'
import { useShallow } from 'zustand/react/shallow'
import { VoiceSquare } from 'iconsax-react'
import { getWordCount } from '@/utils/string'

interface BaseAttachmentProps {
  removeEnabled?: boolean
  value: string
  isSharedImage?: boolean
  sharedImageUrl?: string // Add this line
}

interface WindowAttachmentProps extends BaseAttachmentProps {
  type: 'window'
  appIcon?: string
}

interface OtherAttachmentProps extends BaseAttachmentProps {
  type: Exclude<AttachmentType, 'window'>
  isFile?: boolean
}

type AttachmentProps = WindowAttachmentProps | OtherAttachmentProps

export const Attachment = ({
  type,
  value,
  removeEnabled = false,
  isSharedImage = false,
  sharedImageUrl,
  ...props
}: AttachmentProps) => {
  const appIcon = (props as WindowAttachmentProps).appIcon
  const isFile = (props as OtherAttachmentProps).isFile
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const { removeAttachment, fileInputRef } = useStore(
    useShallow((state) => ({
      removeAttachment: state.removeAttachment,
      fileInputRef: state.fileInputRef,
    })),
  )

  const { imageUrl, isLoading, error } = useImageDownload(
    type === 'image' && !value.startsWith('data:image') && !value.startsWith('blob:') ? value : null,
  )

  const onRemoveAttachment = () => {
    removeAttachment(type)
    if (fileInputRef?.current && isFile) {
      fileInputRef.current.value = ''
    }
    trackEvent('HL Chat Attachment Removed', { type })
  }

  const renderAttachmentContent = () => {
    const size = 20
    switch (type) {
      case 'image':
        if (isSharedImage && sharedImageUrl) {
          return (
            <img
              className="transition-padding pointer-events-none flex h-12 w-auto max-w-20 items-center overflow-hidden rounded-sm object-cover transition-opacity duration-150 ease-in-out"
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
              className="transition-padding pointer-events-none flex h-12 w-auto max-w-20 items-center overflow-hidden rounded-sm object-cover transition-opacity duration-150 ease-in-out"
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
              className="transition-padding pointer-events-none flex h-12 w-auto max-w-20 items-center overflow-hidden rounded-sm object-cover opacity-50 transition-opacity duration-150 ease-in-out"
              style={{ opacity: isImageLoaded ? 1 : 0 }}
              src={imageUrl || value}
              onLoad={() => setIsImageLoaded(true)}
              alt="Attachment"
            />
          )
        }
      case 'clipboard':
      case 'window_context':
        return <ClipboardText className="text-secondary" variant="Bold" size={size} />
      case 'pdf':
        return (
          <div className="align-center flex w-full justify-center gap-2 p-2">
            <DocumentText1 className="min-w-5 text-secondary" variant="Bold" size={size} />
            <span className="inline-block max-w-40 truncate align-middle text-sm text-secondary">{value}</span>
          </div>
        )
      case 'window':
        return (
          <>
            {appIcon ? (
              <img
                src={appIcon}
                alt="App Icon"
                className="h-[42px] w-[42px] bg-[url('../assets/window-border.png')] p-[2px]"
              />
            ) : (
              <DocumentText1 className="text-white" variant="Bold" size={size} />
            )}
          </>
        )
      case 'text_file':
        return (
          <div className="align-center flex w-full justify-center gap-2 p-2">
            <DocumentText1 className="min-w-5 text-white" variant="Bold" size={size} />
            <span className="inline-block max-w-40 truncate align-middle text-sm text-white">{value}</span>
          </div>
        )
      default:
        return <DocumentText1 className="text-white" variant="Bold" size={size} />
    }
  }

  return (
    <Tooltip
      key="attachment-tooltip"
      tooltip={<div className="line-clamp-3 max-h-[100px] max-w-[300px]">{value}</div>}
      position="right"
      disabled={!value || value.length === 0 || type === 'image'}
    >
      <div className="group relative">
        {type === 'conversation' || type === 'audio' ? (
          <div className="flex h-[52px] w-fit items-center gap-2.5 text-nowrap rounded-[10px] border border-tertiary bg-secondary p-[7px_16px_7px_5px] text-base">
            <div className="rounded-md border border-light-10 bg-green-20 p-[10px]">
              <VoiceSquare className="min-w-5 text-conv-green" variant="Bold" size={20} />
            </div>
            <div className="flex max-w-[180px] flex-col gap-1">
              <span className="overflow-hid</div>den text-ellipsis whitespace-nowrap text-[13px] font-medium leading-4 text-secondary">
                Conversation
              </span>
              <span className="text-[10px] font-[350] leading-4 text-tertiary">{getWordCount(value)} words</span>
            </div>
          </div>
        ) : (
          <div
            className={`flex h-[52px] items-center justify-center rounded-[10px] border border-tertiary bg-secondary ${
              type === 'pdf' ? 'max-w-40' : 'max-w-20'
            } ${type !== 'image' ? 'min-w-12' : 'min-w-[52px]'} w-fit overflow-hidden`}
          >
            {renderAttachmentContent()}
          </div>
        )}
        {removeEnabled && (
          <div
            className="absolute right-[-8px] top-[-8px] hidden cursor-pointer rounded-full bg-light-20 p-0.5 text-light-80 group-hover:flex"
            onClick={onRemoveAttachment}
          >
            <CloseIcon size={16} />
          </div>
        )}
      </div>
    </Tooltip>
  )
}
