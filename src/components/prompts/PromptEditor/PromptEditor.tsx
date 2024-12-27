import React from 'react'
import { PromptEditorScreen, usePromptEditorStore } from '@/stores/prompt-editor'

import Tooltip from '@/components/Tooltip/Tooltip'

import styles from './prompteditor.module.scss'
import AppScreen from './screens/AppScreen'
import SettingsScreen from './screens/SettingsScreen'
import SimplifiedAppScreen from './screens/SimplifiedAppScreen'
import StartWithTemplateScreen from './screens/StartWithTemplateScreen'
import VariablesScreen from './screens/VariablesScreen'

function ScreenSelector({
  active,
  name,
  title,
  disabled,
}: {
  active: boolean
  name: PromptEditorScreen
  title: string
  disabled?: boolean
}) {
  const { setSelectedScreen } = usePromptEditorStore()

  return (
    <div
      className={`${styles.tab} ${active ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
      onClick={disabled ? () => {} : () => setSelectedScreen(name)}
    >
      {title}
    </div>
  )
}

function VariablesEditorButton() {
  const { onboarding } = usePromptEditorStore()
  const { setSelectedScreen } = usePromptEditorStore()

  return (
    <Tooltip
      position={'bottom'}
      tooltip={
        onboarding.isOnboarding ? undefined : (
          <div className={'flex flex-col gap-1'}>
            <span>System Prompt</span>
            <span className={'text-xs text-light-60'}>
              Edit the system prompt to control what context variables are included.
            </span>
          </div>
        )
      }
    >
      <div
        onClick={() => setSelectedScreen('variables')}
        className={`${styles.tab} ${onboarding.isOnboarding ? styles.disabled : ''}`}
      >
        System Prompt
      </div>
    </Tooltip>
  )
}

export default function PromptEditor({ onClose }: { onClose?: () => void }) {
  const { selectedScreen, editorMode, onboarding } = usePromptEditorStore()

  return (
    <>
      {selectedScreen !== 'startWithTemplate' && (
        <div className={styles.editorTabs}>
          <div className={styles.tabRow}>
            {editorMode === 'simple' ? (
              <ScreenSelector
                active={selectedScreen === 'simplified-app'}
                name="simplified-app"
                title="Simple"
                disabled={onboarding.isOnboarding}
              />
            ) : (
              <ScreenSelector
                active={selectedScreen === 'app'}
                name="app"
                title="App"
                disabled={onboarding.isOnboarding}
              />
            )}
            <ScreenSelector
              active={selectedScreen === 'settings'}
              name="settings"
              title="Settings"
              disabled={onboarding.isOnboarding}
            />
            {editorMode === 'advanced' && <VariablesEditorButton />}
          </div>
        </div>
      )}
      <div className={'h-full'}>
        {selectedScreen === 'startWithTemplate' && <StartWithTemplateScreen />}
        {selectedScreen === 'app' && <AppScreen />}
        {selectedScreen === 'variables' && <VariablesScreen />}
        {selectedScreen === 'settings' && <SettingsScreen onClose={onClose} />}
        {selectedScreen === 'simplified-app' && <SimplifiedAppScreen />}
      </div>
    </>
  )
}
