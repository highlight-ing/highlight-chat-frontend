import { useMemo } from 'react'
import { DEFAULT_APP_PROMPT, usePromptEditorStore } from '@/stores/prompt-editor'

import { isAlpha, isDevelopment } from '@/utils/appVersion'
import Button from '@/components/Button/Button'
import { LinearIcon, NotionIcon } from '@/components/icons'

import AppSelector from '../ShortcutPreferences/AppSelector'
import ContextSelector from '../ShortcutPreferences/ContextSelector'
import { IntegrationToggle } from './AppScreen'

function SimplifiedAppScreen() {
  const { promptEditorData, setPromptEditorData, onboarding, editorMode, setEditorMode, setSelectedScreen } =
    usePromptEditorStore()

  const toggleEditorMode = () => {
    if (editorMode === 'simple') {
      setEditorMode('advanced')
      setSelectedScreen('app')
    } else {
      setEditorMode('simple')
      setSelectedScreen('simplified-app')
    }
  }
  const textAreaValue = useMemo(() => {
    if (!promptEditorData.appPrompt) return ''
    return promptEditorData.appPrompt.replace(DEFAULT_APP_PROMPT, '')
  }, [promptEditorData.appPrompt])

  return (
    <div className="flex h-full justify-between">
      <div className="flex-1">
        <textarea
          value={textAreaValue}
          onChange={(e) => setPromptEditorData({ appPrompt: e.target.value + DEFAULT_APP_PROMPT })}
          className="h-full w-full resize-none bg-transparent p-4 text-white outline-none"
          placeholder="Enter your prompt here..."
        />
      </div>
      <div className="max-w-96 basis-1/3 border-l border-[#ffffff0d] p-[17px] overflow-y-auto h-full">
        <div className="mb-4">
          <Button onClick={toggleEditorMode} size="small" variant="tertiary">
            Switch to {editorMode === 'simple' ? 'Advanced' : 'Simple'} Editor
          </Button>
        </div>
        <div>
          <div className="flex flex-col space-y-[6px]">
            <h3 className="text-base font-semibold text-white">Automations</h3>
            <p className="text-xs font-normal leading-tight text-[#6e6e6e]">
              Add automations to your shortcuts to allow Highlight to do things for you.
            </p>
          </div>
          <IntegrationToggle
            icon={<LinearIcon />}
            checked={promptEditorData.enabledAutomations?.createLinearIssue || false}
            onToggle={(checked) => {
              setPromptEditorData({
                enabledAutomations: {
                  ...promptEditorData.enabledAutomations,
                  createLinearIssue: checked,
                },
              })
            }}
            title="Create Linear Issue"
            description="Create a Linear issue using the prompt output"
          />

          <IntegrationToggle
            icon={<NotionIcon />}
            checked={promptEditorData.enabledAutomations?.createNotionPage || false}
            onToggle={(checked) => {
              setPromptEditorData({
                enabledAutomations: {
                  ...promptEditorData.enabledAutomations,
                  createNotionPage: checked,
                },
              })
            }}
            title="Create Notion Page"
            description="Create a Notion page using the prompt output"
          />
        </div>
        {(isDevelopment || isAlpha) && (
          <>
            <div className="flex flex-col space-y-[6px] mt-8">
              <AppSelector shortcutName={promptEditorData.name} />
            </div>
            <div className="flex flex-col space-y-[6px] mt-8 mb-32">
              <ContextSelector />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SimplifiedAppScreen
