import { ClipboardText, DocumentText, Microphone, Monitor } from 'iconsax-react'

export function PreferredAttachment({ type }: { type: string }) {
  let title = ''
  let description = ''
  let icon = <></>

  switch (type) {
    case 'screen':
      title = 'Prefers Screen'
      description = 'Action is aware of your screen contents'
      icon = <Monitor variant={'Bold'} size="1.25rem" />
      break
    case 'page-text':
      title = 'Prefers Page Text'
      description = 'Action is aware of the text on the page'
      icon = <DocumentText variant={'Bold'} size="1.25rem" />
      break
    case 'clipboard':
      title = 'Prefers Clipboard'
      description = 'Action is aware of the text in your clipboard'
      icon = <ClipboardText variant={'Bold'} size="1.25rem" />
      break
    case 'audio':
      title = 'Prefers Audio'
      description = 'Action is aware of the audio in your microphone'
      icon = <Microphone variant={'Bold'} size="1.25rem" />
      break
    default:
      return <></>
  }

  return (
    <div className="inline-flex h-[52px] w-full items-center justify-start gap-[51px] rounded-[14px] border border-[#222222] py-[7px] pl-[5px] pr-3">
      <div className="flex h-[42px] items-center justify-start gap-2">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border border-white/0 p-[11px]">
          {icon}
        </div>
        <div className="flex items-center justify-start gap-6">
          <div className="inline-flex flex-col items-start justify-center">
            <div className="text-[13px] font-medium leading-none text-[#b4b4b4]">{title}</div>
            <div className="mt-0.5 text-[10px] leading-none text-[#6e6e6e]">{description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
