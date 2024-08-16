import { ClipboardText, Document, Keyboard, Sound, GallerySlash, DocumentText1 } from 'iconsax-react'
import { useState } from 'react'
import { CloseIcon } from '../icons/icons'
import Tooltip from './Tooltip'
import { useStore } from '@/providers/store-provider'
import { AttachmentType } from '@/types'
import { useImageDownload } from '@/hooks/useImageDownload'
import { useShallow } from 'zustand/react/shallow'

interface AttachmentProps {
  type: AttachmentType
  value: string
  isFile?: boolean
  removeEnabled?: boolean
}

export const Attachment = ({ type, value, isFile = false, removeEnabled = false }: AttachmentProps) => {
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
  }

  const renderAttachmentContent = () => {
    switch (type) {
      case 'image':
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
          if (error) return <GallerySlash size={32} color="#FF8A65" />
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
        return <ClipboardText className="text-white" />
      case 'audio':
        return <Sound className="text-white" />
      case 'pdf':
        return (
          <div className="align-center flex w-full justify-center gap-2 p-2">
            <Document className="min-w-5 text-white" />
            <span className="inline-block max-w-40 truncate align-middle text-sm text-white">{value}</span>
          </div>
        )
      case 'window':
        return <Keyboard className="text-white" />
      case 'text_file':
        return (
          <div className="align-center flex w-full justify-center gap-2 p-2">
            <DocumentText1 className="min-w-5 text-white" />
            <span className="inline-block max-w-40 truncate align-middle text-sm text-white">{value}</span>
          </div>
        )
      default:
        return null
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
        <div
          className={`flex h-12 items-center justify-center rounded-md border border-light-10 bg-light-20 ${
            type === 'pdf' ? 'max-w-40' : 'max-w-20'
          } ${type !== 'image' ? 'min-w-12' : 'min-w-8'} w-fit overflow-hidden`}
        >
          {renderAttachmentContent()}
        </div>
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
