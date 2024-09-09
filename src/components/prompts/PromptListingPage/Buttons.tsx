'use client'

import Button from '@/components/Button/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu/dropdown-menu'
import { useDownloadOrRedirect } from '@/hooks/useDownloadOrRedirect'

function PlatformDownloadButton({ externalId }: { externalId: string }) {
  const { platform, handleDownload } = useDownloadOrRedirect()

  if (platform === 'windows') {
    return (
      <Button size="xlarge" variant="primary" onClick={() => handleDownload(undefined, externalId)}>
        Download Highlight
      </Button>
    )
  } else if (platform === 'mac') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="xlarge" variant="primary">
            Download Highlight
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="border border-light-10 bg-secondary">
          <DropdownMenuItem
            onClick={() => handleDownload('intel', externalId)}
            className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
          >
            Download for Intel Mac
          </DropdownMenuItem>
          <div className="mx-2 my-1 border-t border-light-10"></div>
          <DropdownMenuItem
            onClick={() => handleDownload('silicon', externalId)}
            className="px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-light-10"
          >
            Download for Silicon Mac
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
}

/**
 * Buttons visible on the prompt listing page
 */
export default function Buttons({ slug, externalId }: { slug: string; externalId: string }) {
  function handleClick() {
    window.location.href = `highlight://prompt/${slug}`
  }

  return (
    <div className="flex gap-1.5">
      <PlatformDownloadButton externalId={externalId} />
      <Button size="xlarge" variant="tertiary" onClick={handleClick}>
        Open in Highlight
      </Button>
    </div>
  )
}
