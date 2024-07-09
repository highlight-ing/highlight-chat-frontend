import { ClipboardText, Document, Sound } from 'iconsax-react'
import { useState } from 'react'

interface AttachmentProps {
  type: 'audio' | 'clipboard' | 'image' | 'pdf'
  value: string
}

export const Attachment = ({ type, value }: AttachmentProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  return (
    <div
      className={`flex items-center justify-center h-12 min-w-12 rounded-md border border-light-10 bg-light-20 ${
        type === 'pdf' ? 'max-w-80' : 'max-w-20'
      } w-fit`}
    >
      {type === 'image' && (
        <img
          className="transition-opacity transition-padding duration-150 ease-in-out flex h-10 max-w-22 w-auto items-center overflow-hidden rounded-sm opacity-50 pointer-events-none"
          style={{ opacity: isImageLoaded ? 1 : 0 }}
          src={value}
          onLoad={() => setIsImageLoaded(true)}
        />
      )}
      {type === 'clipboard' && <ClipboardText className="text-white" />}
      {type === 'audio' && <Sound className="text-white" />}
      {type === 'pdf' && (
        <div className="flex justify-start align-center gap-2 p-1 w-full">
          <Document className="text-white min-w-5" />
          <span className="text-sm text-white truncate">{value}</span>
        </div>
      )}
    </div>
  )
}
