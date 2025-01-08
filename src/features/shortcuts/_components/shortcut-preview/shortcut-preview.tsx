import React from 'react'
import { Command, Messages2 } from 'iconsax-react'

import { AppShortcutPreferences, PromptWithTags } from '@/types/supabase-helpers'
import usePromptApps from '@/hooks/usePromptApps'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import PromptAppIcon from '@/components/PromptAppIcon/PromptAppIcon'
import { useStore } from '@/components/providers/store-provider'

import { EmptyPreview } from './empty-preview'

interface ShortcutPreviewProps {
  shortcutId?: string
  shortcuts?: (PromptWithTags & { isUserCreated?: boolean })[]
  preferences?: AppShortcutPreferences[]
  isLoading?: boolean
}

export function ShortcutPreview({ shortcutId, shortcuts, preferences, isLoading }: ShortcutPreviewProps) {
  const { selectPrompt } = usePromptApps()
  const openModal = useStore((state) => state.openModal)

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-6">
        <p className="text-sm text-light-40">Loading shortcut details...</p>
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-[#ffffff0d] flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {hasCustomIcon ? (
              <PromptAppIcon
                height={32}
                width={32}
                imageId={shortcut.image!}
                imageExtension={shortcut.user_images!.file_extension}
                className="flex-shrink-0"
              />
            ) : (
              <div className="flex items-center justify-center rounded-full bg-[#ffffff08] w-8 h-8">
                <Command size={16} className="text-light-60" />
              </div>
            )}
            <h2 className="text-[32px] font-semibold text-white leading-5 tracking-[-0.48px]">{shortcut.name}</h2>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              openModal('edit-prompt', {
                data: {
                  prompt: shortcut,
                  promptShortcutPreferences: preferences?.find((pref) => pref.prompt_id === shortcut.id),
                },
              })
            }
          >
            Edit
          </Button>
        </div>
        {shortcut.description && (
          <p className="text-[15px] text-[#959595] leading-5 tracking-[-0.225px]">{shortcut.description}</p>
        )}
      </div>

      <div className="p-6 overflow-y-auto">
        <div className="flex flex-col gap-6">
          {preferences?.some((pref) => pref.prompt_id === shortcut.id) && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-light-80">App Availability</h3>
                <div className="p-3 rounded-lg bg-[#ffffff08]">
                  {preferences
                    .filter((pref) => pref.prompt_id === shortcut.id)
                    .map((pref) => {
                      const isGlobal = pref.application_name_darwin === '*' || pref.application_name_win32 === '*'
                      if (isGlobal) {
                        return (
                          <div key={pref.id} className="text-sm text-light-40">
                            Available in all applications
                          </div>
                        )
                      }

                      const apps = [...(pref.application_name_darwin ? JSON.parse(pref.application_name_darwin) : [])]

                      return (
                        <div key={pref.id} className="text-sm text-light-40">
                          Available in: {apps.join(', ')}
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-light-80">Context Types</h3>
                <div className="p-3 rounded-lg bg-[#ffffff08] text-sm text-light-40">
                  {preferences
                    .filter((pref) => pref.prompt_id === shortcut.id)
                    .map((pref) => {
                      const contexts = []
                      if (pref.context_types?.selected_text) contexts.push('Selected Text')
                      if (pref.context_types?.audio_transcription) contexts.push('Audio Transcription')
                      if (pref.context_types?.clipboard_text) contexts.push('Clipboard Text')
                      if (pref.context_types?.screenshot) contexts.push('Screenshot')
                      if (pref.context_types?.window) contexts.push('Window')

                      return contexts.length > 0 ? contexts.join(', ') : 'No context types selected'
                    })}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm  text-light-80">Prompt</h3>
            <div className="text-[15px] text-[#959595] leading-5 tracking-[-0.225px] whitespace-pre-wrap">
              {shortcut.prompt_text || 'No prompt content available'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
