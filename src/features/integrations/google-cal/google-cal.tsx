import React from 'react'
import type { CreateGoogleCalendarEventParams } from '@/hooks/useIntegrations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import InputField from '../TextInput/InputField'
import Button from '../Button/Button'
import {
  checkGoogleConnectionStatus,
  createGoogleCalendarEvent,
  createMagicLinkForGoogle,
} from '@/utils/google-server-actions'
import { DateTimePicker } from '../date-time'
import { SetupConnectionComponent } from './integration-auth'
import { GoogleIcon } from '@/icons/icons'
import { IntegrationsLoader } from './loader'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { IntegrationSubmitButton } from '../components/submit-button'

const googleCalEventFormSchema = z.object({
  summary: z.string().min(1),
  location: z.string().optional(),
  description: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
})

type GoogleCalEventFormSchema = z.infer<typeof googleCalEventFormSchema>

type GoogleCalEventFormProps = {
  data: CreateGoogleCalendarEventParams
  onSuccess: (url: string) => void
}

export function GcalEventFormComponent(props: GoogleCalEventFormProps) {
  const { mutate: createGoogleCalEvent, isPending } = useCreateGoogleCalEvent(props.onSuccess)

  const form = useForm<z.infer<typeof googleCalEventFormSchema>>({
    resolver: zodResolver(googleCalEventFormSchema),
    defaultValues: {
      summary: props.data.summary,
      location: props.data.location,
      description: props.data.description,
      start: props.data.start ?? new Date().toISOString(),
      end: props.data.end ?? new Date().toISOString(),
    },
  })

  async function onSubmit(data: GoogleCalEventFormSchema) {
    createGoogleCalEvent(data)
  }

  const onStartDateChange = (startDateTime: Date) => {
    try {
      if (!isNaN(startDateTime.getTime())) {
        console.log({ startDateTime })
        setValue('start', startDateTime.toISOString())
      }
    } catch (e) {
      console.warn('Error setting start date value', e)
    }
  }

  const onEndDateChange = (endDateTime: Date) => {
    try {
      if (!isNaN(endDateTime.getTime())) {
        console.log({ endDateTime })
        setValue('end', endDateTime.toISOString())
      }
    } catch (e) {
      console.warn('Error setting start date value', e)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Input placeholder="Event summary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <DateTimePicker
            dateFieldLabel="Start Date"
            timeFieldLabel="Start Time"
            defaultDateIso={props.data.start}
            onChange={onStartDateChange}
          />
          <DateTimePicker
            dateFieldLabel="End Date"
            timeFieldLabel="End Time"
            defaultDateIso={props.data.end}
            onChange={onEndDateChange}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Event location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Event description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <IntegrationSubmitButton isPending={isPending} label="Create event" icon={<GoogleIcon size={20} />} />
      </form>
    </Form>
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
      {state === 'loading' && <IntegrationsLoader />}
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
