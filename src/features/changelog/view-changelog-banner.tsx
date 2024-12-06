import { ArrowRight } from 'iconsax-react'
import Markdown from 'react-markdown'

import { trackEvent } from '@/utils/amplitude'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { HighlightIcon } from '@/components/icons'

import { useChangelogs } from './hooks'

export function ViewChangelogBanner() {
  const { allChangelogNotes } = useChangelogs()
  const { mostRecentChangelogNote } = useChangelogs()

  function handleClick() {
    trackEvent('HL Chat Changelog Open', {
      version: mostRecentChangelogNote.version,
    })
  }

  return (
    <Sheet>
      <SheetTrigger
        onClick={handleClick}
        className="group flex h-16 w-full items-center justify-between rounded-2xl border border-[#191919] bg-secondary/70 px-3 shadow-md hover:bg-secondary"
      >
        <div className="flex items-center gap-3 font-medium text-subtle">
          <HighlightIcon size={24} />
          <p>
            Highlight <span className="text-teal">{mostRecentChangelogNote.version}</span> has been released!
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-tertiary px-3 py-1.5 text-sm font-medium text-tertiary opacity-0 transition group-hover:bg-hover group-hover:opacity-100">
          <span>View changelog</span>
          <ArrowRight size={20} variant="Bold" className="opacity-80" />
        </div>
      </SheetTrigger>
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()} className="pl-3 pr-2 duration-75 sm:max-w-lg">
        <SheetHeader className="pb-2">
          <SheetTitle>Highlight Updates</SheetTitle>
          <SheetDescription className="sr-only">Ongoing change log for all Highlight chat updates</SheetDescription>
        </SheetHeader>
        <ScrollArea className="size-full pb-6 pr-1">
          {allChangelogNotes.map((note) => (
            <div key={note.version} className="border-b border-secondary/60 pt-3 last:border-b-0">
              <p className="font-semibold text-teal">{note.version}</p>
              <Markdown className="markdown">{note.releaseNotes}</Markdown>
            </div>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
