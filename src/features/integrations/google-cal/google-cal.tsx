import React from 'react'
import type { CreateGoogleCalendarEventParams } from '@/hooks/useIntegrations'
import { zodResolver } from '@hookform/resolvers/zod'
import { ControllerRenderProps, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { GoogleIcon } from '@/icons/icons'
import { IntegrationsLoader } from '../_components/loader'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { IntegrationSubmitButton } from '../_components/submit-button'
import { useCheckGoogleCalConnection, useCreateGoogleCalEvent } from './hooks'
import { checkGoogleConnectionStatus, createMagicLinkForGoogle } from './actions'
import { IntegrationSuccessMessage } from '../_components/success-message'
import { SetupConnection } from '../_components/setup-connection'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { extractDateAndTime } from './utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQueryClient } from '@tanstack/react-query'

const googleCalEventFormSchema = z.object({
  summary: z.string().min(1),
  location: z.string().optional(),
  description: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
})

export type GoogleCalEventFormSchema = z.infer<typeof googleCalEventFormSchema>

type GoogleCalEventDropdownProps = {
  field: ControllerRenderProps<GoogleCalEventFormSchema>
}

function DatePickerDropdown(props: GoogleCalEventDropdownProps) {
  const { date: dateValue, time: timeValue } = extractDateAndTime(props.field.value)

  function handleChange(date: Date | undefined, time: string) {
    if (!date) return

    const [hours, minutes] = time.split(':').map(Number)
    const combinedDateTime = new Date(date)
    combinedDateTime.setHours(hours, minutes)

    props.field.onChange(combinedDateTime.toISOString())
  }

  const formattedDate = dateValue ? format(dateValue, 'PPP') : 'Pick a date'

  return (
    <Popover>
      <PopoverTrigger className="relative flex w-full justify-between gap-2 rounded-2xl border border-light-10 bg-secondary px-3 pb-2 pt-7 text-[15px] text-primary outline-none transition-[padding] placeholder:text-subtle hover:border-light-20 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-light-20 data-[state=open]:bg-tertiary [&>span]:line-clamp-1">
        {formattedDate}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-lg bg-secondary p-0">
        <Calendar mode="single" selected={dateValue} onSelect={(date) => handleChange(date, timeValue)} initialFocus />
      </PopoverContent>
    </Popover>
  )
}

function TimeSelectDropdown(props: GoogleCalEventDropdownProps) {
  const { date: dateValue, time: timeValue } = extractDateAndTime(props.field.value)

  const timeOptions = React.useMemo(() => {
    const times = []
    for (let i = 0; i < 48; i++) {
      const hours = Math.floor(i / 2)
        .toString()
        .padStart(2, '0')
      const minutes = i % 2 === 0 ? '00' : '30'
      times.push(`${hours}:${minutes}`)
    }
    return times
  }, [])

  function handleChange(date: Date | undefined, time: string) {
    if (!date) return

    const [hours, minutes] = time.split(':').map(Number)
    const combinedDateTime = new Date(date)
    combinedDateTime.setHours(hours, minutes)

    props.field.onChange(combinedDateTime.toISOString())
  }

  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':')
    return new Date(2023, 0, 1, parseInt(hours, 10), parseInt(minutes, 10)).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isCustomTimeValue = !timeOptions.includes(timeValue)

  return (
    <Select value={timeValue} onValueChange={(time) => handleChange(dateValue, time)}>
      <SelectTrigger value={timeValue} className="w-full">
        {isCustomTimeValue ? timeValue : timeValue ? <SelectValue /> : <span>Select a time</span>}
      </SelectTrigger>
      <SelectContent className="max-h-64 w-36" sideOffset={4}>
        {timeOptions.map((time) => (
          <SelectItem key={time} value={time}>
            {formatTimeForDisplay(time)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type GoogleCalEventFormProps = {
  data: CreateGoogleCalendarEventParams
  onSuccess?: (url: string) => void
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

        <div className="grid w-full grid-cols-2 gap-2">
          <div className="grid w-full grid-cols-3 gap-2">
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <DatePickerDropdown field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1">
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start time</FormLabel>
                    <FormControl>
                      <TimeSelectDropdown field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-2">
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End date</FormLabel>
                    <FormControl>
                      <DatePickerDropdown field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1">
              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time</FormLabel>
                    <FormControl>
                      <TimeSelectDropdown field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
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
  const queryClient = useQueryClient()

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
        onConnect={() => {
          queryClient.invalidateQueries({ queryKey: ['google-cal-check-connection'] })
          setState('form')
        }}
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
