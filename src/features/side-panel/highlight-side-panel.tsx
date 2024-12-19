import { useAtomValue } from 'jotai'

import { isOnHomeAtom } from '@/atoms/side-panel'

import { AudioNoteSidePanelContent, AudioNoteSidePanelHeader } from './components/audio-note'
import { SidePanel } from './components/side-panel'

export function HighlightSidePanel() {
  const isOnHome = useAtomValue(isOnHomeAtom)

  return (
    <SidePanel hideCloseButton={isOnHome}>
      <AudioNoteSidePanelHeader />
      <AudioNoteSidePanelContent />
    </SidePanel>
  )
}
