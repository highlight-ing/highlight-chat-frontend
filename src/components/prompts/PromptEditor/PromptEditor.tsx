import AppScreen from './screens/AppScreen'
import SettingsScreen from './screens/SettingsScreen'
import StartWithTemplateScreen from './screens/StartWithTemplateScreen'
import { PromptEditorScreen, usePromptEditorStore } from '@/stores/prompt-editor'
import SuggestionsScreen from './screens/SuggestionsScreen'
import styles from './prompteditor.module.scss'
import { trackEvent } from '@/utils/amplitude'

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

function TutorialButton() {
  const { onboarding, startTutorial } = usePromptEditorStore()

  function handleClick() {
    trackEvent('Trigger Prompt Editor Tutorial', {})
    startTutorial()
  }

  return (
    <div
      onClick={handleClick}
      className={`${styles.tab} ${styles.right} ${onboarding.isOnboarding ? styles.disabled : ''}`}
    >
      Tutorial
    </div>
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
              active={selectedScreen === 'suggestions'}
              name="suggestions"
              title="Suggestions"
              disabled={onboarding.isOnboarding}
            />
            <ScreenSelector
              active={selectedScreen === 'settings'}
              name="settings"
              title="Settings"
              disabled={onboarding.isOnboarding}
            />
            <TutorialButton />
          </div>
        </div>
      )}
      <div className={'h-full'}>
        {selectedScreen === 'startWithTemplate' && <StartWithTemplateScreen />}
        {selectedScreen === 'app' && <AppScreen />}
        {selectedScreen === 'suggestions' && <SuggestionsScreen />}
        {selectedScreen === 'settings' && <SettingsScreen onClose={onClose} />}
      </div>
    </>
  )
}
