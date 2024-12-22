import React from 'react'
import { useAtomValue } from 'jotai'

import { isOnHomeAtom, sidePanelContentTypeAtom } from '@/atoms/side-panel'

import { AudioNoteSidePanelContent, AudioNoteSidePanelHeader } from './components/audio-note'
import { ChatSidePanelContent, ChatSidePanelHeader } from './components/chat'
import { SidePanel, SidePanelContent, SidePanelHeader } from './components/side-panel'

export function HighlightSidePanel() {
  const isOnHome = useAtomValue(isOnHomeAtom)
  const sidePanelContentType = useAtomValue(sidePanelContentTypeAtom)

  const { header, content } = React.useMemo(() => {
    switch (sidePanelContentType) {
      case 'audio-note':
        return { header: <AudioNoteSidePanelHeader />, content: <AudioNoteSidePanelContent /> }
      case 'chat':
        return { header: <ChatSidePanelHeader />, content: <ChatSidePanelContent /> }
      default:
        return { header: null, content: null }
    }
  }, [sidePanelContentType])

  return (
    <SidePanel hideCloseButton={isOnHome} className="hidden lg:block">
      <SidePanelHeader>{header}</SidePanelHeader>
      <SidePanelContent>{content}</SidePanelContent>
    </SidePanel>
  )
}
