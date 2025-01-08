import React, { useRef, useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ClipboardText,
  Command,
  Edit2,
  Global,
  Messages2,
  Monitor,
  Send2,
  Smallcaps,
  TickCircle,
  Trash,
} from 'iconsax-react'

import { AppShortcutPreferences, PromptWithTags } from '@/types/supabase-helpers'
import usePromptApps from '@/hooks/usePromptApps'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip } from '@/components/ui/tooltip'
import Button from '@/components/Button/Button'
import { AudioIcon, ScreenshotIcon } from '@/components/icons'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'
import { useStore } from '@/components/providers/store-provider'

import { useApplications } from '../../_hooks/use-applications'
import { DeleteAction } from '../shortcuts-list/delete-action'
import { EmptyPreview } from './empty-preview'

interface ShortcutPreviewProps {
  shortcutId?: string
  shortcuts?: (PromptWithTags & { isUserCreated?: boolean })[]
  preferences?: AppShortcutPreferences[]
  isLoading?: boolean
}

const contextIcons: Record<string, React.ReactNode> = {
  'Selected Text': <Smallcaps size={17} className="text-light-40" variant="Bold" />,
  'Audio Transcription': <AudioIcon size={16} />,
  'Clipboard Text': <ClipboardText size={17} className="text-light-40" variant="Bold" />,
  Screenshot: <ScreenshotIcon size={17} />,
  Window: <Monitor size={17} className="text-light-40" variant="Bold" />,
}

export function ShortcutPreview({ shortcutId, shortcuts, preferences, isLoading }: ShortcutPreviewProps) {
  const { selectPrompt } = usePromptApps()
  const openModal = useStore((state) => state.openModal)
  const [copied, setCopied] = useState(false)
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const { applications } = useApplications()

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-6">
        <p className="text-sm text-light-40"></p>
      </div>
    )
  }

  if (!shortcutId || !shortcuts) {
    return <EmptyPreview />
  }

  const shortcut = shortcuts.find((s) => s.id.toString() === shortcutId)

  if (!shortcut) {
    return <EmptyPreview />
  }

  const hasCustomIcon = shortcut.image && shortcut.user_images?.file_extension

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation()

    if (copied || !shortcut?.slug) return

    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    const url = `https://chat.highlight.ing/prompts/${shortcut.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)

    timeout.current = setTimeout(() => {
      setCopied(false)
    }, 2500)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed action bar */}
      <div className="flex justify-end pr-8 pt-6 flex-shrink-0">
        <Button
          size="small"
          variant="ghost-neutral"
          onClick={() =>
            openModal('edit-prompt', {
              data: {
                prompt: shortcut,
                promptShortcutPreferences: preferences?.find((pref) => pref.prompt_id === shortcut.id),
              },
            })
          }
          className="text-[#6E6E6E] text-[13px] leading-4"
        >
          <Edit2 size={16} className="mr-1" variant="Bold" />
          Edit Shortcut
        </Button>
        <Button
          size="small"
          variant="ghost-neutral"
          onClick={handleShare}
          className="text-[#6E6E6E] text-[13px] leading-4"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={copied ? 'check' : 'share'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              {copied ? <TickCircle size={16} className="text-green-400" /> : <Send2 size={16} variant="Bold" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </motion.div>
          </AnimatePresence>
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button size="small" variant="ghost-neutral" className="text-[#6E6E6E] text-[13px] leading-4">
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 px-1 py-0.5">
            <div className="flex flex-col gap-1">
              {shortcut.isUserCreated && <DeleteAction shortcut={shortcut} moreOptionsOpen={true} />}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 px-16">
        {/* Header section */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {hasCustomIcon ? (
                <PromptAppIcon
                  height={26}
                  width={26}
                  imageId={shortcut.image!}
                  imageExtension={shortcut.user_images!.file_extension}
                  className="flex-shrink-0"
                />
              ) : (
                <div className="flex items-center justify-center rounded-full bg-[#ffffff08] w-[26px] h-[26px]">
                  <Command size={14} className="text-light-60" />
                </div>
              )}
              <h2 className="text-[24px] font-medium text-white leading-5 tracking-[-0.36px]">{shortcut.name}</h2>
            </div>
          </div>
          {shortcut.description && (
            <p className="mt-9 text-[15px] text-light-60 leading-6 font-light tracking-[-0.225px]">
              {shortcut.description}
            </p>
          )}
        </div>

        {/* Rest of content */}
        <div className="pt-8">
          <div className="flex flex-col gap-6">
            {preferences?.some((pref) => pref.prompt_id === shortcut.id) && (
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <h3 className="text-[13px] font-normal text-light-40 leading-5 w-[160px]">
                    Application Availability
                  </h3>
                  <div className="">
                    {preferences
                      .filter((pref) => pref.prompt_id === shortcut.id)
                      .map((pref) => {
                        const isGlobal = pref.application_name_darwin === '*' || pref.application_name_win32 === '*'
                        if (isGlobal) {
                          return (
                            <div
                              key={pref.id}
                              className="flex items-center gap-2 px-2 py-0.5 rounded-full border border-[#333333] bg-[#1C1C1C] w-fit"
                            >
                              <Global size={17} className="text-light-40" variant="Bold" />
                              <span className="text-light-60 text-sm">Available Globally</span>
                            </div>
                          )
                        }

                        const apps = [...(pref.application_name_darwin ? JSON.parse(pref.application_name_darwin) : [])]

                        return (
                          <div key={pref.id} className="flex flex-wrap items-center gap-1.5 text-sm text-light-80">
                            {apps.map((app, index) => {
                              const appData = applications.find((a) => a.id === app)
                              return (
                                <React.Fragment key={app}>
                                  <div className="flex items-center gap-2 px-2 py-0.5 rounded-full border border-[#333333] bg-[#1C1C1C]">
                                    <div
                                      className="flex items-center justify-center h-[17px] w-[17px] rounded-md p-0.5 border border-[0.25px] border-[#333333]"
                                      style={{
                                        background:
                                          appData?.theme === 'dark'
                                            ? 'linear-gradient(139deg, #333 3.52%, #161818 51.69%)'
                                            : 'linear-gradient(139deg, #FFFFFF 3.52%, #E5E5E5 51.69%)',
                                      }}
                                    >
                                      {appData?.icon && React.createElement(appData.icon, { size: 12 })}
                                    </div>
                                    <span className="text-light-60">{app}</span>
                                  </div>
                                </React.Fragment>
                              )
                            })}
                          </div>
                        )
                      })}
                  </div>
                </div>

                <div className="flex gap-2 border-b border-[#ffffff0d] pb-8">
                  <h3 className="text-[13px] font-normalleading-5 w-[160px] text-light-40">Context Specifications</h3>
                  <div className="text-sm text-light-80">
                    {preferences
                      .filter((pref) => pref.prompt_id === shortcut.id)
                      .map((pref) => {
                        const contexts = []
                        if (pref.context_types?.selected_text) contexts.push('Selected Text')
                        if (pref.context_types?.audio_transcription) contexts.push('Audio Transcription')
                        if (pref.context_types?.clipboard_text) contexts.push('Clipboard Text')
                        if (pref.context_types?.screenshot) contexts.push('Screenshot')
                        if (pref.context_types?.window) contexts.push('Window')

                        return contexts.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {contexts.map((context, index) => (
                              <React.Fragment key={context}>
                                <div className="flex items-center gap-2 px-2 py-0.5 rounded-full border border-[#333333] bg-[#1C1C1C]">
                                  <div className="text-light-40">{contextIcons[context]}</div>
                                  <span className="text-light-60">{context}</span>
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                        ) : (
                          'No context types selected'
                        )
                      })}
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="text-[15px] text-light-80 leading-6 tracking-[-0.225px] whitespace-pre-wrap font-light">
                {shortcut.prompt_text || 'No prompt content available'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
