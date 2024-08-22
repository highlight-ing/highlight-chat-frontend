import AppScreen from './screens/AppScreen'
import SettingsScreen from './screens/SettingsScreen'
import StartWithTemplateScreen from './screens/StartWithTemplateScreen'
import { PromptEditorScreen, usePromptEditorStore } from '@/stores/prompt-editor'
import SuggestionsScreen from './screens/SuggestionsScreen'
import styles from './prompteditor.module.scss'

function ScreenSelector({ active, name, title }: { active: boolean; name: PromptEditorScreen; title: string }) {
  const { setSelectedScreen } = usePromptEditorStore()

  return (
    <div className={`${styles.tab} ${active ? styles.active : ''}`} onClick={() => setSelectedScreen(name)}>
      {title}
    </div>
  )
}

export default function PromptEditor({ onClose }: { onClose?: () => void }) {
  const { selectedScreen } = usePromptEditorStore()

  return (
    <>
      {selectedScreen !== 'startWithTemplate' && (
        <div className={styles.editorTabs}>
          <div className={styles.tabRow}>
            <ScreenSelector active={selectedScreen === 'app'} name="app" title="App" />
            <ScreenSelector active={selectedScreen === 'suggestions'} name="suggestions" title="Suggestions" />
            <ScreenSelector active={selectedScreen === 'settings'} name="settings" title="Settings" />
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
