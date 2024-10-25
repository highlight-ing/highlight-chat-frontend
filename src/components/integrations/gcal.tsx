import type { CreateGoogleCalendarEventParams } from '@/hooks/useIntegrations'
import { useState } from 'react'

export function CreateGoogleCalendarEventComponent({
  summary,
  location,
  description,
  start,
  end,
}: CreateGoogleCalendarEventParams) {
  const [state, setState] = useState<'form' | 'success'>('form')
  const [url, setUrl] = useState<string | undefined>(undefined)

  function onSuccess(url?: string) {
    setState('success')
    setUrl(url)
  }

  return (
    <div className="mt-2">
      {state === 'form' && <div>Form</div>}
      {state === 'success' && url && (
        <span>
          Page created successfully:{' '}
          <a href={url} target="_blank">
            {url}
          </a>
        </span>
      )}
    </div>
  )
}
