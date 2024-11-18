import React from 'react'
import Markdown from 'react-markdown'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useMostRecentChangelog, useShowChangelog } from './hooks'

export function ChangelogModal() {
  const showChangelog = useShowChangelog()
  const { releaseNotes, version } = useMostRecentChangelog()
  const [open, setOpen] = React.useState(showChangelog)

  React.useEffect(() => {
    if (showChangelog && !open) {
      // window.highlight.appStorage.set('changelog-version-dismissed', version)
    }
  }, [showChangelog, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Highlight <span className="text-teal">{version}</span> Release Notes
          </DialogTitle>
          <DialogDescription className="sr-only">Release notes for the newest version of Highlight</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-96 w-full">
          <Markdown className="markdown">{releaseNotes}</Markdown>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
