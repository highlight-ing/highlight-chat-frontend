import AppScreen from './screens/AppScreen'
import SettingsScreen from './screens/SettingsScreen'
import StartWithTemplateScreen from './screens/StartWithTemplateScreen'
import { PromptEditorScreen, usePromptEditorStore } from '@/stores/prompt-editor'
import styles from './prompteditor.module.scss'
import VariablesScreen from './screens/VariablesScreen'
import React from 'react'
import Tooltip from '@/components/Tooltip/Tooltip'

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
            <span>Advanced Variables Editor</span>
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
        Variables Editor
      </div>
    </Tooltip>
  )
}

export default function PromptEditor({ onClose }: { onClose?: () => void }) {
  const { selectedScreen, onboarding } = usePromptEditorStore()

  return (
    <>
      {selectedScreen !== 'startWithTemplate' && (
        <div className={styles.editorTabs}>
          <div className={styles.tabRow}>
            <ScreenSelector
              active={selectedScreen === 'app'}
              name="app"
              title="App"
              disabled={onboarding.isOnboarding}
            />
            <ScreenSelector
              active={selectedScreen === 'settings'}
              name="settings"
              title="Settings"
              disabled={onboarding.isOnboarding}
            />
            <VariablesEditorButton />
          </div>
        </div>
      )}
      <div className={'h-full'}>
        {selectedScreen === 'startWithTemplate' && <StartWithTemplateScreen />}
        {selectedScreen === 'app' && <AppScreen />}
        {selectedScreen === 'variables' && <VariablesScreen />}
        {selectedScreen === 'settings' && <SettingsScreen onClose={onClose} />}
      </div>
    </>
  )
}
