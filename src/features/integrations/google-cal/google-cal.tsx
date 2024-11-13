import React from 'react'
import type { CreateGoogleCalendarEventParams } from '@/hooks/useIntegrations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { GoogleIcon } from '@/icons/icons'
import { IntegrationsLoader } from '../components/loader'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { IntegrationSubmitButton } from '../components/submit-button'
import { useCheckGoogleCalConnection, useCreateGoogleCalEvent } from './hooks'
import { checkGoogleConnectionStatus, createMagicLinkForGoogle } from './actions'
import { IntegrationSuccessMessage } from '../components/success-message'
import { SetupConnection } from '../components/setup-connection'

const googleCalEventFormSchema = z.object({
  summary: z.string().min(1),
  location: z.string().optional(),
  description: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
})

export type GoogleCalEventFormSchema = z.infer<typeof googleCalEventFormSchema>

type GoogleCalEventFormProps = {
  data: CreateGoogleCalendarEventParams
  onSuccess: (url: string) => void
}

export function GoogleCalEventForm(props: GoogleCalEventFormProps) {
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

export function CreateGoogleCalEvent(data: CreateGoogleCalendarEventParams) {
  const { data: connectedToGoogleCal, isLoading: connectionIsLoading } = useCheckGoogleCalConnection()
  const [state, setState] = React.useState<'form' | 'success'>('form')
  const [url, setUrl] = React.useState<string | undefined>(undefined)

  function onSuccess(url?: string) {
    setState('success')
    setUrl(url)
  }

  if (connectionIsLoading) {
    return <IntegrationsLoader />
  }

  if (!connectedToGoogleCal) {
    return (
      <SetupConnection
        name={'Google Calendar'}
        checkConnectionStatus={checkGoogleConnectionStatus}
        onConnect={() => setState('form')}
        icon={<GoogleIcon size={16} />}
        createMagicLink={createMagicLinkForGoogle}
      />
    )
  }

  if (state === 'form') {
    return <GoogleCalEventForm data={data} onSuccess={onSuccess} />
  }

  if (state === 'success' && url) {
    return (
      <IntegrationSuccessMessage
        heading="Google Calendar event created:"
        url={url}
        title={data.summary}
        subTitle="Google Calendar event"
        icon={<GoogleIcon size={20} />}
      />
    )
  }
}
