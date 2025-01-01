import React from 'react'
import { useAtomValue } from 'jotai'

import { sidePanelContentTypeAtom } from '@/atoms/side-panel'

import { AudioNoteSidePanelContent, AudioNoteSidePanelHeader } from './audio-note'
import { ChatSidePanelContent, ChatSidePanelHeader } from './chat'
import { SidePanel, SidePanelContent, SidePanelHeader } from './side-panel'

export function HighlightSidePanel() {
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
    <SidePanel className="hidden lg:block">
      <SidePanelHeader>{header}</SidePanelHeader>
      <SidePanelContent>{content}</SidePanelContent>
    </SidePanel>
  )
}
