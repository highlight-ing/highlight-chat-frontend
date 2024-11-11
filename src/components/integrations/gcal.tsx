import * as React from 'react'
import type { CreateGoogleCalendarEventParams } from '@/hooks/useIntegrations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import InputField from '../TextInput/InputField'
import TextArea from '../TextInput/TextArea'
import Button from '../Button/Button'
import {
  checkGoogleConnectionStatus,
  createGoogleCalendarEvent,
  createMagicLinkForGoogle,
} from '@/utils/google-server-actions'
import { DateTimePicker } from '../date-time'
import { SetupConnectionComponent } from './integration-auth'
import { GoogleIcon } from '@/icons/icons'

const gcalEventFormSchema = z.object({
  summary: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
})

type GcalEventFormData = z.infer<typeof gcalEventFormSchema>

export function GcalEventFormComponent({
  data,
  onSuccess,
}: {
  data: CreateGoogleCalendarEventParams
  onSuccess: (url: string) => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GcalEventFormData>({
    resolver: zodResolver(gcalEventFormSchema),
    defaultValues: {
      summary: data.summary,
      location: data.location,
      description: data.description,
      start: data.start ?? new Date().toISOString(),
      end: data.end ?? new Date().toISOString(),
    },
  })

  async function onSubmit(data: GcalEventFormData) {
    // @ts-ignore
    const token = await highlight.internal.getAuthorizationToken()

    const link = await createGoogleCalendarEvent(token, data)

    onSuccess(link ?? '')
  }

  const onDateChange = (startDateTime: Date, endDateTime: Date) => {
    console.log({ startDateTime: startDateTime.toISOString(), endDateTime: endDateTime.toISOString() })
    setValue('start', startDateTime.toISOString())
    setValue('end', endDateTime.toISOString())
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
      <InputField size={'xxlarge'} label={'Summary'} placeholder={'Event Summary'} {...register('summary')} />
      <DateTimePicker onChange={onDateChange} />
      <InputField size={'xxlarge'} label={'Location'} placeholder={'Event Location'} {...register('location')} />
      <TextArea
        rows={4}
        size={'xxlarge'}
        label={'Description'}
        placeholder={'Event Description'}
        {...register('description')}
      />
      <Button size={'medium'} variant={'primary'} type={'submit'} disabled={isSubmitting}>
        Create Event
      </Button>
    </form>
  )
}

export function CreateGoogleCalendarEventComponent(data: CreateGoogleCalendarEventParams) {
  const [state, setState] = useState<'loading' | 'connect' | 'form' | 'success'>('loading')
  const [url, setUrl] = useState<string | undefined>(undefined)

  function onSuccess(url?: string) {
    setState('success')
    setUrl(url)
  }

  useEffect(() => {
    async function checkConnection() {
      //@ts-ignore
      const hlToken = (await highlight.internal.getAuthorizationToken()) as string

      const connected = await checkGoogleConnectionStatus(hlToken)

      if (connected) {
        setState('form')
      } else {
        setState('connect')
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="mt-2">
      {state === 'loading' && <div>Loading...</div>}
      {state === 'connect' && (
        <SetupConnectionComponent
          name={'Google Calendar'}
          checkConnectionStatus={checkGoogleConnectionStatus}
          onConnect={() => setState('form')}
          icon={<GoogleIcon size={16} />}
          createMagicLink={createMagicLinkForGoogle}
        />
      )}
      {state === 'form' && <GcalEventFormComponent data={data} onSuccess={onSuccess} />}
      {state === 'success' && url && (
        <span>
          Google Calendar event created successfully:{' '}
          <a href={url} target="_blank">
            {url}
          </a>
        </span>
      )}
    </div>
  )
}
