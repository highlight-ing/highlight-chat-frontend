import { ClipboardText, Document, Keyboard, Sound } from 'iconsax-react'
import { useState } from 'react'
import { CloseIcon } from '../icons/icons'
import Tooltip from './Tooltip'
import { useStore } from '@/providers/store-provider'
import { AttachmentType } from '@/types'
import { useImageDownload } from '@/hooks/useImageDownload'

interface AttachmentProps {
  type: AttachmentType
  value: string
  isFile?: boolean
  removeEnabled?: boolean
}

export const Attachment = ({ type, value, isFile = false, removeEnabled = false }: AttachmentProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const { removeAttachment, fileInputRef } = useStore((state) => ({
    removeAttachment: state.removeAttachment,
    fileInputRef: state.fileInputRef
  }))

  const { imageUrl, isLoading, error } = useImageDownload(type === 'image' ? value : null)

  const onRemoveAttachment = () => {
    removeAttachment(type)
    if (fileInputRef?.current && isFile) {
      fileInputRef.current.value = ''
    }
  }

  const renderAttachmentContent = () => {
    switch (type) {
      case 'image':
        if (isLoading) return <div>Loading image...</div>
        if (error) return <div>Error loading image: {error.message}</div>
        return imageUrl ? (
          <img
            className="transition-opacity transition-padding duration-150 ease-in-out flex h-12 w-auto max-w-20 items-center overflow-hidden rounded-sm opacity-50 pointer-events-none"
            style={{ opacity: isImageLoaded ? 1 : 0 }}
            src={imageUrl}
            onLoad={() => setIsImageLoaded(true)}
            alt="Attachment"
          />
        ) : null
      case 'clipboard':
        return <ClipboardText className="text-white" />
      case 'audio':
        return <Sound className="text-white" />
      case 'pdf':
        return (
          <div className="flex w-full justify-center align-center gap-2 p-2">
            <Document className="text-white min-w-5" />
            <span className="inline-block align-middle text-sm text-white truncate max-w-40">{value}</span>
          </div>
        )
      case 'window':
        return <Keyboard className="text-white" />
      default:
        return null
    }
  }

  return (
    <Tooltip
      key="attachment-tooltip"
      tooltip={<div className="max-w-[300px] max-h-[100px] line-clamp-3">{value}</div>}
      position="right"
      disabled={!value || value.length === 0 || type === 'image'}
    >
      <div
        className={`group relative flex items-center justify-center h-12 rounded-md border border-light-10 bg-light-20 ${
          type === 'pdf' ? 'max-w-40' : 'max-w-20'
        } ${type !== 'image' ? 'min-w-12' : 'min-w-2'} w-fit`}
      >
        {renderAttachmentContent()}
        {removeEnabled && (
          <div
            className="absolute top-[-5px] right-[-5px] hidden group-hover:flex cursor-pointer text-light-80"
            onClick={onRemoveAttachment}
          >
            <CloseIcon size={16} />
          </div>
        )}
      </div>
    </Tooltip>
  )
}