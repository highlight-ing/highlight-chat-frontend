import Markdown from 'react-markdown'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import Button from '@/components/Button/Button'
import { HighlightIcon } from '@/components/icons'

import { useChangelogs } from './hooks'

function ChangelogSheet() {
  const { allChangelogNotes } = useChangelogs()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="medium" variant="accent">
          View Changelog
        </Button>
      </SheetTrigger>
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()} className="pl-3 pr-2">
        <SheetHeader className="pb-2">
          <SheetTitle>Highlight Updates</SheetTitle>
          <SheetDescription className="sr-only">Ongoing change log for all Highlight chat updates</SheetDescription>
        </SheetHeader>
        <ScrollArea className="size-full pb-6 pr-1">
          {allChangelogNotes.map((note) => (
            <div className="border-b border-secondary/60 pt-3 last:border-b-0">
              <p className="font-semibold text-teal">{note.version}</p>
              <Markdown className="markdown">{note.releaseNotes}</Markdown>
            </div>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export function ViewChangelogBanner() {
  const { mostRecentChangelogNote } = useChangelogs()

  return (
    <div className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#191919] bg-secondary px-3 shadow-md">
      <div className="flex items-center gap-3 font-medium text-subtle">
        <HighlightIcon size={24} />
        <p>
          Highlight <span className="text-teal">{mostRecentChangelogNote.version}</span> has been released!
        </p>
      </div>
      <ChangelogSheet />
    </div>
  )
}
