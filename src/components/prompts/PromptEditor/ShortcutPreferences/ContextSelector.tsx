import { useEffect, useMemo, useState } from 'react'
import { ContextTypes, usePromptEditorStore } from '@/stores/prompt-editor'
import { DocumentText } from 'iconsax-react'

import { usePromptEditor } from '@/hooks/usePromptEditor'
import { Switch } from '@/components/catalyst/switch'
import { AudioIcon, ClipboardIcon, ScreenshotIcon, TextIcon } from '@/components/icons'

interface ContextOption {
  id: keyof ContextTypes
  label: string
  description: string
  icon: React.ReactNode
}

const contextOptions: ContextOption[] = [
  {
    id: 'selected_text',
    label: 'Selected Text',
    description: 'Trigger this prompt when text is selected',
    icon: <TextIcon />,
  },
  {
    id: 'audio_transcription',
    label: 'Audio',
    description: 'Use with transcribed audio content',
    icon: <AudioIcon />,
  },
  {
    id: 'clipboard_text',
    label: 'Clipboard Text',
    description: 'Access clipboard content with this prompt',
    icon: <ClipboardIcon />,
  },
  {
    id: 'screenshot',
    label: 'Screenshot',
    description: 'Use with captured screenshots',
    icon: <ScreenshotIcon />,
  },
  {
    id: 'window',
    label: 'Window',
    description: 'Use with the focused window',
    icon: <DocumentText />,
  },
]

function ToggleSwitch({ checked, onToggle }: { checked: boolean; onToggle: (checked: boolean) => void }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="text-right text-xs font-normal leading-snug text-white/40">
        {checked ? 'Custom Contexts' : 'All Contexts'}
      </div>
      <Switch checked={checked} color={'cyan'} onChange={onToggle} />
    </div>
  )
}

export default function ContextSelector() {
  const { selectedApp, contextTypes, setContextTypes } = usePromptEditorStore()
  const { saveShortcutPreferences } = usePromptEditor()

  // Derive enabled state from contextTypes
  const isEnabled = useMemo(() => {
    if (!contextTypes) return false
    return Object.values(contextTypes).some((value) => !value)
  }, [contextTypes])

  // Save to Supabase whenever contextTypes changes
  useEffect(() => {
    if (contextTypes) {
      saveShortcutPreferences()
    }
  }, [contextTypes])

  const toggleContext = (contextId: keyof ContextTypes) => {
    const currentTypes = contextTypes ?? {
      selected_text: false,
      audio_transcription: false,
      clipboard_text: false,
      screenshot: false,
      window: false,
    }

    setContextTypes({
      ...currentTypes,
      [contextId]: !currentTypes[contextId],
    })
  }

  const handleMasterToggle = (enabled: boolean) => {
    const newContextTypes = {
      selected_text: !enabled,
      audio_transcription: !enabled,
      clipboard_text: !enabled,
      screenshot: !enabled,
      window: !enabled,
    }

    setContextTypes(newContextTypes)
  }

  if (selectedApp === 'hidden') {
    return null
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="border-t border-white/5" />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="text-[13px] font-medium leading-normal text-[#eeeeee]">Add Context Specification</h4>
        </div>
        <ToggleSwitch checked={isEnabled} onToggle={handleMasterToggle} />
      </div>
      {/* <p className="text-xs font-normal leading-tight text-[#6e6e6e]">
        Specify the context you want the shortcut to be surfaced.
      </p> */}

      {isEnabled && (
        <div className="grid grid-cols-2 gap-2">
          {contextOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleContext(option.id)}
              className={`p-2 border h-14 rounded-lg flex items-center justify-between gap-2 text-xs ${
                contextTypes?.[option.id] ? 'border-green-40 bg-green-10' : 'border-[#252525] hover:bg-neutral-800/15'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center h-7 w-7 rounded-md p-1.5 border border-[0.25px] border-[#333333]"
                  style={{
                    background: 'linear-gradient(139deg, #333 3.52%, #161818 51.69%)',
                  }}
                >
                  {option.icon}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs truncate w-full whitespace-nowrap">{option.label}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
