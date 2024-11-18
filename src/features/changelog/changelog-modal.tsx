import React from 'react'
import Markdown from 'react-markdown'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useMostRecentChangelog, useShowChangelog } from './hooks'

export function ChangelogModal() {
  const { showChangelog, setShowChangelog } = useShowChangelog()
  const { releaseNotes, version } = useMostRecentChangelog()
  const [open, setOpen] = React.useState(showChangelog)

  React.useEffect(() => {
    if (showChangelog) {
      setOpen(true)
    }
  }, [setOpen, showChangelog])

  function handleOpenChange(value: boolean) {
    if (value === false && showChangelog) {
      window.highlight.appStorage.set('changelog-version-dismissed', version)
      setShowChangelog(false)
    }
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-xl">
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
